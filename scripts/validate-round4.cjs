// Browser acceptance for the local parent app. Requires Playwright supplied by the environment.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve(__dirname, '../screenshots/round4');
const base = process.env.DEMO_URL || 'http://127.0.0.1:4173/';
const evidence = { round: 4, date: '2026-10-09', browser: '', checks: [], consoleErrors: [], requests: [] };
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
async function check(page, label, selector) {
  await settle(page);
  const data = await page.evaluate(selector => {
    const nav = document.querySelector('.bottom-nav').getBoundingClientRect();
    const el = selector && document.querySelector(selector), box = el?.getBoundingClientRect();
    const scroll = document.scrollingElement;
    const logo = document.querySelector('.brand-logo img');
    return { viewport: { width: innerWidth, height: innerHeight }, noOverflow: scroll.scrollWidth === scroll.clientWidth,
      scrollY, maxScroll: scroll.scrollHeight - scroll.clientHeight, atBottom: Math.abs(scrollY - (scroll.scrollHeight - scroll.clientHeight)) <= 2,
      navHeight: nav.height, navTop: nav.top, mainBottomPadding: getComputedStyle(document.querySelector('main')).paddingBottom,
      button: box && { top: box.top, bottom: box.bottom, clear: box.top >= 0 && box.bottom <= nav.top - 8,
        hit: el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)) },
      logoLoaded: logo.complete && logo.naturalWidth === 161 && logo.naturalHeight === 65,
      typography: { heading: getComputedStyle(document.querySelector('h1')).fontSize, secondary: getComputedStyle(document.querySelector('.hint')).fontSize, date: document.querySelector('.class-date') && getComputedStyle(document.querySelector('.class-date')).fontSize },
      colors: { background: getComputedStyle(document.querySelector('.app')).backgroundColor, navigation: getComputedStyle(document.querySelector('.bottom-nav')).backgroundColor },
      containsDemoNotices: /Demo|虛構|示例|評審/.test(document.body.innerText) };
  }, selector);
  assert(data.noOverflow, label + ': horizontal overflow');
  assert(data.logoLoaded, label + ': logo missing');
  assert(!data.containsDemoNotices, label + ': old notices');
  if (selector) { assert(data.atBottom, label + ': not scrolled to end'); assert(data.button.clear && data.button.hit, label + ': operation blocked'); }
  evidence.checks.push({ label, ...data });
}
async function contrast(page) {
  const tokens = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement);
    return Object.fromEntries(['text', 'muted', 'bg', 'surface', 'top', 'nav-bg', 'action-text', 'brand', 'on-brand', 'received-text', 'received-bg', 'placeholder', 'error', 'error-bg'].map(n => [n, css.getPropertyValue('--' + n).trim()]));
  });
  const luminance = hex => {
    const rgb = [1,3,5].map(i => parseInt(hex.slice(i, i+2),16)/255).map(c => c <= .04045 ? c/12.92 : ((c+.055)/1.055)**2.4);
    return rgb.reduce((sum,c,i) => sum + c * [.2126,.7152,.0722][i], 0);
  };
  const pairs = [['text','bg'],['text','surface'],['muted','bg'],['muted','top'],['muted','nav-bg'],['action-text','surface'],['on-brand','brand'],['received-text','received-bg'],['placeholder','surface'],['error','error-bg']];
  const result = pairs.map(([f,b]) => {
    const a=luminance(tokens[f]), z=luminance(tokens[b]);
    const ratio=(Math.max(a,z)+.05)/(Math.min(a,z)+.05);
    assert(ratio >= 4.5, `${f}/${b} text contrast too low: ${ratio}`);
    return { foreground: tokens[f], background: tokens[b], pair: `${f}/${b}`, ratio: Number(ratio.toFixed(2)) };
  });
  assert.equal(tokens.bg, '#F4F2F6'); assert.equal(tokens.surface, '#F7F4FA'); assert.equal(tokens.top, '#EEE8F5'); assert.equal(tokens.brand, '#9C29B2');
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
async function scale(page, value) {
  await page.locator('.review summary').click();
  await page.locator('#text-scale').selectOption(value);
  await page.locator('.review summary').click();
  await settle(page);
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
      page.on('console', m => { if (['error', 'warning'].includes(m.type())) evidence.consoleErrors.push(m.text()); });
      page.on('request', r => evidence.requests.push({ method: r.method(), url: r.url() }));
      const logoResponse = await page.request.get(base + 'assets/i-learner-logo.png');
      assert.equal(logoResponse.status(), 200); assert.equal(logoResponse.headers()['content-type'], 'image/png');
      const logoHead = await page.request.head(base + 'assets/i-learner-logo.png'); assert.equal(logoHead.status(), 200);
      const blocked = await page.request.post(base + 'assets/i-learner-logo.png'); assert.equal(blocked.status(), 404);
      await page.goto(base);
      await check(page, key + ' list');
      if (!evidence.contrast) await contrast(page);
      assert.equal(await page.locator('.brand-logo img').evaluate(el => getComputedStyle(el).width), '108px');
      assert.equal(await page.locator('.lesson a, .lesson button, .lesson select').count(), 0);
      const first = await page.locator('.lesson').first().boundingBox(), nav = await page.locator('.bottom-nav').boundingBox();
      assert(first.y + first.height < nav.y, 'first class action should be in first screen');
      await page.screenshot({ path: path.join(out, key + '-01-lessons.png') });
      await page.locator('#student').focus(); await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('href')), '#detail/l1');
      assert.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'solid');
      await page.keyboard.press('Enter'); await page.waitForURL(url => url.hash === '#detail/l1');
      await check(page, key + ' details'); assert.equal(await page.locator('.details-card .detail-line').count(), 4);
      await page.screenshot({ path: path.join(out, key + '-detail.png') });
      await page.getByRole('link', { name: '申請請假' }).click();
      await page.locator('button[type=submit]').click();
      assert.equal(await page.locator('#reason-error').innerText(), '請選擇一個請假原因。');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'reason');
      await fill(page, '家庭安排，申請當日請假。');
      await page.goBack(); await page.waitForURL(url => url.hash === '#detail/l1'); await page.goForward(); await page.waitForURL(url => url.hash === '#leave/l1');
      assert.equal(await page.locator('#note').inputValue(), '家庭安排，申請當日請假。');
      assert.equal(await page.locator('#attachment').inputValue(), '證明.pdf');
      await page.locator('#note').focus(); await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => document.activeElement.id), 'attachment');
      await bottom(page, key + ' form 100', 'button[type=submit]', key + '-02-form-bottom.png');
      const button = await page.locator('button[type=submit]').boundingBox();
      await page.mouse.dblclick(button.x + button.width/2, button.y + button.height/2);
      assert(await page.locator('button[type=submit]').isDisabled());
      await page.waitForURL(url => url.hash === '#success/l1'); await check(page, key + ' success');
      assert((await page.locator('main').innerText()).includes('收到申請不等於批准請假，亦不代表獲得補堂資格。'));
      const successButton = await page.locator('main a.primary').boundingBox(), successNav = await page.locator('.bottom-nav').boundingBox();
      assert(successButton.y + successButton.height < successNav.y, 'success primary action in first screen');
      await page.screenshot({ path: path.join(out, key + '-03-success.png') });
      await page.getByRole('link', { name: '查看請假紀錄', exact: true }).click();
      await page.waitForURL(url => url.hash === '#records'); await page.locator('article.record').waitFor();
      assert.equal(await page.locator('article.record').count(), 1);
      await bottom(page, key + ' records 100', '.record a.secondary', key + '-04-records-bottom.png');
      await page.locator('.record a.secondary').focus(); await page.keyboard.press('Enter'); await page.waitForURL(url => url.hash === '#detail/l1');
      await page.goto(base + '?review=1#lessons');
      await page.locator('#student').selectOption('s2'); await scale(page, '200');
      await check(page, key + ' long list 200');
      await page.locator('.lesson').click(); await check(page, key + ' long details 200');
      await page.getByRole('link', { name: '申請請假' }).click();
      await fill(page, '長文字換行驗證：' + 'LongTextWithoutSpaces'.repeat(15) + '。保留學生及課堂資料。');
      await page.locator('.review summary').click(); await page.locator('#fail-next').check(); await page.locator('.review summary').click();
      await bottom(page, key + ' long form 200', 'button[type=submit]', key + '-form-200.png');
      await page.locator('button[type=submit]').click();
      await page.locator('.error-panel').waitFor(); assert((await page.locator('#note').inputValue()).includes('LongTextWithoutSpaces'));
      await bottom(page, key + ' retry 200', 'button[type=submit]');
      await page.locator('button[type=submit]').focus(); await page.keyboard.press('Enter');
      await page.waitForURL(url => url.hash === '#success/l3'); await check(page, key + ' long success 200');
      await page.getByRole('link', { name: '查看請假紀錄', exact: true }).click();
      await page.waitForURL(url => url.hash === '#records'); await page.locator('article.record').waitFor();
      assert((await page.locator('article.record').innerText()).includes('LongTextWithoutSpaces'));
      await bottom(page, key + ' long records 200', '.record a.secondary', key + '-records-200.png');
      await page.locator('#student').selectOption('s1'); assert.equal(await page.locator('article.record').count(), 0);
      await page.locator('#student').selectOption('s3'); await bottom(page, key + ' empty records 200', '.empty a.secondary', key + '-empty-200.png');
      await scale(page, '100'); await check(page, key + ' empty records 100');
      await page.locator('.review summary').click(); await page.locator('#preview-mode').selectOption('loading'); assert(await page.locator('[aria-busy=true]').count());
      await page.locator('#preview-mode').selectOption('error'); await page.getByRole('button', { name: '重新載入' }).click(); assert(await page.locator('.empty').count());
      await page.reload(); assert.equal(await page.evaluate(() => document.documentElement.dataset.textScale || '100'), '100');
      await page.close();
    }
    assert.equal(evidence.consoleErrors.length, 0);
    assert(evidence.requests.every(r => r.method === 'GET' && r.url.startsWith(base)));
    fs.writeFileSync(path.join(out, 'validation.json'), JSON.stringify(evidence, null, 2));
    console.log(`PASS: ${evidence.checks.length} layout checks, both complete flows, keyboard, drafts, duplicate guard, retry, states, logo and console.`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
