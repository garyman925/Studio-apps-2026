// Browser acceptance for the local parent app. Requires Playwright supplied by the environment.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve(__dirname, '../screenshots/round9');
const base = process.env.DEMO_URL || 'http://127.0.0.1:4173/';
const evidence = { round: 9, date: '2026-10-09', browser: '', checks: [], consoleErrors: [], requests: [] };
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
async function check(page, label, selector) {
  await page.evaluate(() => document.fonts.ready);
  await settle(page);
  const data = await page.evaluate(selector => {
    const nav = document.querySelector('.bottom-nav').getBoundingClientRect();
    const el = selector && document.querySelector(selector), box = el?.getBoundingClientRect();
    const scroll = document.scrollingElement;
    const logo = document.querySelector('.brand-logo img');
    const header = document.querySelector('.header'), headerBox = header.getBoundingClientRect(), appBox = document.querySelector('.app').getBoundingClientRect();
    const strip = document.querySelector('.student-strip').getBoundingClientRect();
    return { viewport: { width: innerWidth, height: innerHeight }, noOverflow: scroll.scrollWidth === scroll.clientWidth,
      scrollY, maxScroll: scroll.scrollHeight - scroll.clientHeight, atBottom: Math.abs(scrollY - (scroll.scrollHeight - scroll.clientHeight)) <= 2,
      navHeight: nav.height, navTop: nav.top, mainBottomPadding: getComputedStyle(document.querySelector('main')).paddingBottom,
      button: box && { top: box.top, bottom: box.bottom, clear: box.top >= 0 && box.bottom <= nav.top - 8,
        hit: el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)) },
      dialogNoOverflow: !document.querySelector('dialog[open]') || document.querySelector('dialog[open]').scrollWidth === document.querySelector('dialog[open]').clientWidth,
      header: { fullWidth: headerBox.left === appBox.left && headerBox.width === appBox.width, height: headerBox.height, background: getComputedStyle(header).backgroundColor, position: getComputedStyle(header).position, separateStrip: strip.top >= headerBox.bottom, logoBackground: getComputedStyle(document.querySelector('.brand-logo')).backgroundColor, englishInStudentRow: !!document.querySelector('.student-strip > .student .student-english') },
      logoLoaded: logo.complete && logo.naturalWidth === 161 && logo.naturalHeight === 65,
      typography: { heading: getComputedStyle(document.querySelector('h1')).fontSize, secondary: getComputedStyle(document.querySelector('.hint')).fontSize, body: getComputedStyle(document.body).fontSize, family: getComputedStyle(document.body).fontFamily, date: document.querySelector('.class-date') && getComputedStyle(document.querySelector('.class-date')).fontSize },
      colors: { background: getComputedStyle(document.querySelector('.app')).backgroundColor, navigation: getComputedStyle(document.querySelector('.bottom-nav')).backgroundColor },
      containsDemoNotices: /Demo|虛構|示例|評審/.test(document.body.innerText) };
  }, selector);
  assert(data.noOverflow, label + ': horizontal overflow');
  assert(data.dialogNoOverflow, label + ': dialog overflow');
  assert(data.header.fullWidth && data.header.height >= 64 && data.header.separateStrip, label + ': header layout');
  assert.equal(data.header.background, 'rgb(38, 125, 119)');
  assert.equal(data.header.position, 'static');
  assert.equal(data.header.logoBackground, 'rgba(0, 0, 0, 0)');
  assert(!data.header.englishInStudentRow);
  assert(data.logoLoaded, label + ': logo missing');
  assert(!data.containsDemoNotices, label + ': old notices');
  if (selector) { assert(data.atBottom, label + ': not scrolled to end'); assert(data.button.clear && data.button.hit, label + ': operation blocked'); }
  evidence.checks.push({ label, ...data });
}
async function contrast(page) {
  const tokens = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    return Object.fromEntries(['text', 'muted', 'bg', 'surface', 'top', 'nav-bg', 'action-text', 'brand', 'on-brand', 'received-text', 'received-bg', 'placeholder', 'error', 'error-bg', 'tint', 'requested-text', 'requested-bg', 'approved-text', 'approved-bg'].map(n => [n, css.getPropertyValue('--' + n).trim()]));
  });
  const luminance = hex => {
    const rgb = [1,3,5].map(i => parseInt(hex.slice(i, i+2),16)/255).map(c => c <= .04045 ? c/12.92 : ((c+.055)/1.055)**2.4);
    return rgb.reduce((sum,c,i) => sum + c * [.2126,.7152,.0722][i], 0);
  };
  const pairs = [['text','bg'],['text','surface'],['muted','bg'],['muted','top'],['muted','nav-bg'],['action-text','surface'],['on-brand','brand'],['received-text','received-bg'],['placeholder','surface'],['error','error-bg'],['action-text','tint'],['requested-text','requested-bg'],['approved-text','approved-bg'],['requested-text','surface'],['approved-text','surface']];
  const result = pairs.map(([f,b]) => {
    const a=luminance(tokens[f]), z=luminance(tokens[b]);
    const ratio=(Math.max(a,z)+.05)/(Math.min(a,z)+.05);
    assert(ratio >= 4.5, `${f}/${b} text contrast too low: ${ratio}`);
    return { foreground: tokens[f], background: tokens[b], pair: `${f}/${b}`, ratio: Number(ratio.toFixed(2)) };
  });
  assert.equal(tokens.bg, '#F7F8FA'); assert.equal(tokens.surface, '#FFFFFF'); assert.equal(tokens.top, '#FFFFFF'); assert.equal(tokens.brand, '#267D77');
  fs.writeFileSync(path.join(out, 'contrast.json'), JSON.stringify(result, null, 2));
  evidence.contrast = result;
}
async function bottom(page, label, selector, shot) {
  await page.evaluate(() => window.scrollTo(0, document.scrollingElement.scrollHeight));
  await check(page, label, selector);
  if (shot) await page.screenshot({ path: path.join(out, shot) });
}
async function fill(page, note) {
  await page.locator('#reason').selectOption({ label: '家庭安排' });
  await page.locator('#note').fill(note);
  await page.locator('#attachment').selectOption({ label: '證明.pdf' });
}
async function switchStudent(page, id) {
  await page.locator('#student').click(); await settle(page);
  assert(await page.locator('#student-dialog').evaluate(el => el.open));
  await page.locator(`[data-student="${id}"]`).focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('#student').getAttribute('aria-expanded'), 'false');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'student');
}
async function scale(page, value) {
  await page.locator('.review summary').click(); await settle(page);
  await page.locator('#text-scale').selectOption(value);
  await page.locator('.review summary').click(); await settle(page);
  await page.evaluate(() => document.fonts.ready);
  await settle(page);
}

async function selected(page, date) {
  assert.equal(await page.locator('.calendar-day[aria-pressed=true]').getAttribute('data-date'), date);
}
async function calendarCheck(page, label) {
  await check(page, label);
  assert(await page.locator('.calendar-day').evaluateAll(els => els.every(el => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight)), label + ': date clipping');
  assert.equal(await page.locator('.calendar-day[tabindex="0"]').count(), 1);
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  evidence.browser = browser.version();
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 430, height: 932 }]) {
      const key = `${viewport.width}x${viewport.height}`;
      const page = await browser.newPage({ viewport });
      page.on('pageerror', e => evidence.consoleErrors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') evidence.consoleErrors.push(m.text()); });
      page.on('request', r => evidence.requests.push({ method: r.method(), url: r.url() }));
      await page.goto(base);
      await calendarCheck(page, key + ' week initial mixed states');
      assert.equal(await page.locator('[data-action=calendar-toggle]').innerText(), '');
      assert.equal(await page.locator('[data-action=calendar-toggle]').getAttribute('aria-label'), '展開月曆');
      assert.equal(await page.locator('#student .student-switch').innerText(), '');
      assert.equal(await page.locator('.student-strip > .student .hint').count(), 0);
      assert.equal(await page.locator('.today-label').count(), 2);
      const compact = await page.locator('.lesson').first().evaluate(el => ({height:el.getBoundingClientRect().height,padding:getComputedStyle(el).padding,timeBorder:getComputedStyle(el.querySelector('.lesson-schedule')).borderRightWidth}));
      assert(compact.height < 300, 'compact first class card');
      assert.equal(compact.padding,'16px'); assert.equal(compact.timeBorder,'0px');
      assert(await page.locator('.lesson-cta').first().evaluate(el => el.getBoundingClientRect().bottom < document.querySelector('.bottom-nav').getBoundingClientRect().top), 'first class action visible in first screen');
      assert.equal(await page.locator('.bottom-nav a[aria-current=page]').evaluate(el=>getComputedStyle(el,'::before').height),'3px');
      evidence.checks.push({label:key+' compact UI',...compact,iconCalendar:true,iconStudent:true,todayLabels:2});
      await selected(page, '2026-09-24');
      assert.equal(await page.locator('.lesson').count(), 2);
      assert.equal(await page.locator('.lesson').first().getAttribute('href'), '#detail/l4');
      assert.equal(await page.locator('.lesson [data-status=requested]').count(), 1);
      assert.equal(await page.locator('.lesson [data-status=approved]').count(), 1);
      assert.equal(await page.locator('[data-date="2026-09-24"] .date-mark').count(), 2);
      assert.match(await page.locator('[data-date="2026-09-24"]').getAttribute('aria-label'), /請假申請.*請假已獲準/);
      assert.equal(await page.locator('[data-date]').first().getAttribute('data-date'), '2026-09-21');
      if (!evidence.contrast) await contrast(page);
      await page.screenshot({ path: path.join(out, key + '-01-week.png') });
      await page.locator('.lesson').first().screenshot({ path: path.join(out, key + '-approved-class.png') });
      await page.locator('.lesson').last().screenshot({ path: path.join(out, key + '-requested-class.png') });
      await page.locator('[data-action=calendar-toggle]').click(); await settle(page);
      assert.equal(await page.locator('[data-action=calendar-toggle]').getAttribute('aria-label'), '收起月曆');
      await selected(page, '2026-09-24');
      assert.equal(await page.locator('[data-date]').count(), 35);
      await calendarCheck(page, key + ' month');
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(out, key + '-02-month.png') });
      await page.locator('[data-action=calendar-next]').click(); await settle(page); await selected(page, '2026-10-24');
      assert.equal(await page.locator('.empty h2').innerText(), '這天沒有課堂');
      await page.locator('[data-action=calendar-prev]').click(); await settle(page); await selected(page, '2026-09-24');
      await page.locator('[data-date="2026-08-31"]').click(); await settle(page);
      await page.locator('[data-action=calendar-next]').click(); await settle(page); await selected(page, '2026-09-30');
      await page.locator('[data-action=calendar-today]').click(); await settle(page); await selected(page, '2026-09-24');
      await page.locator('[data-action=calendar-toggle]').click(); await settle(page);
      await page.locator('[data-action=calendar-next]').click(); await settle(page); await selected(page, '2026-10-01');
      await page.locator('[data-action=calendar-prev]').click(); await settle(page); await selected(page, '2026-09-24');
      await page.locator('[data-date="2026-09-24"]').focus(); await page.keyboard.press('ArrowRight'); await selected(page, '2026-09-25');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.date), '2026-09-25');
      await page.keyboard.press('ArrowDown'); await selected(page, '2026-10-02');
      await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowLeft'); await selected(page, '2026-09-24');
      await page.keyboard.press('Space'); await selected(page, '2026-09-24');
      await page.locator('[data-action=calendar-today]').click(); await settle(page); await selected(page, '2026-09-24');
      await page.locator('[data-date="2026-09-25"]').click(); await settle(page);
      await switchStudent(page, 's2'); await selected(page, '2026-09-25');
      assert.equal(await page.locator('.lesson').count(), 0);
      await switchStudent(page, 's1'); await selected(page, '2026-09-25');
      await page.locator('[data-action=calendar-today]').click(); await settle(page);
      await page.locator('#student').click(); await settle(page);
      for (let i=0;i<6;i++) { await page.keyboard.press('Tab'); assert(await page.evaluate(() => !!document.activeElement.closest('dialog'))); }
      await page.keyboard.press('Escape'); assert.equal(await page.evaluate(() => document.activeElement.id), 'student');
      await page.locator('a[href="#detail/l4"]').click(); await settle(page);
      await page.waitForURL(url=>url.hash==='#detail/l4'); await settle(page);
      assert.equal(await page.locator('[data-status=approved]').count(), 1);
      assert((await page.locator('main').innerText()).includes('此課堂請假已獲準。補堂資格尚未確認。'));
      assert.equal(await page.getByRole('link', {name:'申請請假',exact:true}).count(), 0);
      await page.locator('.header .icon-button').click(); await settle(page); await settle(page); await selected(page, '2026-09-24');
      await page.locator('a[href="#detail/l1"]').click(); await settle(page);
      await page.waitForURL(url=>url.hash==='#detail/l1'); await settle(page);
      assert((await page.locator('main').innerText()).includes('收到申請不等於批准請假'));
      await page.locator('.header .icon-button').click(); await settle(page);
      await settle(page);
      await page.locator('[data-date="2026-09-26"]').focus(); await page.keyboard.press('Enter'); await selected(page, '2026-09-26');
      await page.locator('.lesson').focus(); assert.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'solid');
      await page.keyboard.press('Enter'); await page.waitForURL(url => url.hash === '#detail/l2');
      await check(page, key + ' unsubmitted details');
      await page.getByRole('link', {name:/申請請假/}).click(); await settle(page);
      await page.locator('button[type=submit]').click(); await settle(page);
      assert.equal(await page.locator('#reason-error').innerText(), '請選擇一個請假原因。');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'reason');
      await fill(page, '家庭安排，申請當日請假。');
      await page.goBack(); await page.waitForURL(url => url.hash === '#detail/l2');
      await page.goForward(); await page.waitForURL(url => url.hash === '#leave/l2');
      assert.equal(await page.locator('#note').inputValue(), '家庭安排，申請當日請假。');
      assert.equal(await page.locator('#attachment').inputValue(), '證明.pdf');
      await bottom(page, key + ' form bottom', 'button[type=submit]', key + '-03-form-bottom.png');
      const button = await page.locator('button[type=submit]').boundingBox();
      await page.mouse.dblclick(button.x+button.width/2, button.y+button.height/2);
      assert(await page.locator('button[type=submit]').isDisabled());
      await page.waitForURL(url => url.hash === '#success/l2');
      assert.equal(await page.locator('h1').innerText(), '申請已收到');
      assert.equal(await page.locator('[data-status=requested]').count(), 1);
      assert.equal(await page.locator('[data-status=approved]').count(), 0);
      await bottom(page, key + ' success bottom', 'main a.primary', key + '-04-success.png');
      await page.getByRole('link', {name:'查看請假紀錄',exact:true}).click(); await settle(page);
      assert.equal(await page.locator('article.record').count(), 3);
      assert.equal(await page.locator('.record [data-status=requested]').count(), 2);
      await bottom(page, key + ' records bottom', '.record:last-of-type a.secondary', key + '-05-records-bottom.png');
      await page.locator('.record:last-of-type a.secondary').focus(); await page.keyboard.press('Enter');
      await page.waitForURL(url=>url.hash==='#detail/l4'); await settle(page);
      await page.locator('.header .icon-button').click(); await settle(page); await selected(page,'2026-09-24');
      await page.locator('[data-date="2026-09-26"]').click(); await settle(page);
      await page.locator('.bottom-nav a[href="#lessons"]').click(); await settle(page); await selected(page, '2026-09-26');
      assert.equal(await page.locator('[data-date="2026-09-26"] .date-mark.requested').count(), 1);
      await page.locator('.lesson').click(); await settle(page); assert.equal(await page.locator('a[href="#leave/l2"]').count(), 0);
      await page.goto(base + '?review=1#lessons');
      await page.locator('.bottom-nav a[href="#records"]').click(); await settle(page); assert.equal(await page.locator('article.record').count(), 2);
      await page.locator('.bottom-nav a[href="#lessons"]').click(); await settle(page); await selected(page, '2026-09-24');
      await scale(page, '200');
      await calendarCheck(page, key + ' week 200');
      await page.locator('[data-action=calendar-toggle]').click(); await settle(page);
      await calendarCheck(page, key + ' month 200');
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(out, key + '-calendar-200.png'), fullPage:true });
      await page.locator('[data-action=calendar-next]').click(); await settle(page); await selected(page, '2026-10-24');
      await page.locator('[data-action=calendar-today]').click(); await settle(page); await selected(page, '2026-09-24');
      await switchStudent(page, 's2'); await selected(page, '2026-09-24');
      await calendarCheck(page, key + ' long course list 200');
      await page.locator('.lesson').click(); await settle(page); await check(page, key + ' long detail 200');
      await page.getByRole('link', {name:/申請請假/}).click(); await settle(page);
      await fill(page, '長文字換行：'+'LongTextWithoutSpaces'.repeat(15));
      await page.locator('.review summary').click(); await settle(page); await page.locator('#fail-next').check(); await page.locator('.review summary').click(); await settle(page);
      await bottom(page, key + ' long form 200', 'button[type=submit]', key + '-form-200.png');
      await page.locator('button[type=submit]').click(); await settle(page); await page.locator('.error-panel').waitFor();
      assert((await page.locator('#note').inputValue()).includes('LongTextWithoutSpaces'));
      await bottom(page, key + ' retry 200', 'button[type=submit]');
      await page.locator('button[type=submit]').focus(); await page.keyboard.press('Enter');
      await page.waitForURL(url=>url.hash==='#success/l3');
      await bottom(page, key + ' success 200', 'main a.primary', key + '-success-200.png');
      await page.getByRole('link', {name:'查看請假紀錄',exact:true}).click(); await settle(page);
      assert.equal(await page.locator('article.record').count(), 1);
      assert.equal(await page.locator('.record [data-status=requested]').count(), 1);
      await bottom(page, key + ' long records 200', '.record a.secondary', key + '-records-200.png');
      await switchStudent(page,'s1'); assert.equal(await page.locator('article.record').count(),2);
      await page.evaluate(() => window.DEMO_CONTENT.students.find(s=>s.id==='s3').name='林芷澄張雅晴');
      await switchStudent(page,'s3');
      await bottom(page, key + ' empty records 200', '.empty a.secondary');
      await scale(page,'100'); await check(page,key+' short empty page');
      await page.locator('.review summary').click(); await settle(page); await page.locator('#preview-mode').selectOption('loading'); assert.equal(await page.locator('[aria-busy=true]').count(),1);
      await page.locator('#preview-mode').selectOption('error'); await page.getByRole('button',{name:'重新載入'}).click(); await settle(page);
      await page.goto(base+'#leave/l2'); await page.locator('#note').fill('待重整的草稿');
      let prompted=false; page.once('dialog',async dialog=>{prompted=dialog.type()==='beforeunload';await dialog.accept();});
      await page.reload(); assert(prompted); assert.equal(await page.locator('#note').inputValue(),'');
      await page.locator('.header .icon-button').click(); await settle(page); await page.locator('.header .icon-button').click(); await settle(page); await selected(page,'2026-09-26');
      assert.equal(await page.locator('.lesson [data-status]').count(),0);
      evidence.checks.push({label:key+' interactions',passed:['Monday week','mixed statuses','sorted classes','month toggle preserves selection','cross month/week','today','empty day','student preserves selection','keyboard arrows/Enter/Tab/Escape','approved no resubmit','pending disclaimer','draft/back','validation','duplicate guard','new request pending only','date marker synchronizes','reload two seeds/draft cleared','failure retry','loading/error','long name/course/note']});
      await page.close();
    }
    assert.equal(evidence.consoleErrors.length,0);
    assert(evidence.requests.every(r=>r.method==='GET'&&r.url.startsWith(base)));
    fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(evidence,null,2));
    console.log(`PASS: ${evidence.checks.length} checks, calendar/flows at both sizes, 200% text, keyboard, contrast, zero console errors.`);
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
