const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = 'https://garyman925.github.io/Studio-apps-2026/';
(async () => {
  const browser = await chromium.launch({headless:true});
  const evidence = {date:new Date().toISOString(),base,version:'0.11',checks:[],errors:[]};
  try {
    for (const width of [390,430]) {
      const page = await browser.newPage({viewport:{width,height:width===390?844:932}});
      page.on('pageerror',error=>evidence.errors.push(error.message));
      const response = await page.goto(base+'?v=0.11#settings');
      assert.equal(response.status(),200);
      await page.locator('#settings-text-scale').waitFor();
      assert.match(await page.locator('main').innerText(),/0\.11/);
      assert.equal(await page.locator('.bottom-nav a').count(),3);
      await page.evaluate(()=>document.fonts.ready);
      assert(await page.locator('.brand-logo img').evaluate(el=>el.complete&&el.naturalWidth===161));
      assert(await page.evaluate(()=>document.fonts.check('16px ParentSans')));
      await page.locator('.settings-students summary').click();
      assert.equal(await page.locator('.settings-student-list li').count(),3);
      await page.locator('#settings-text-scale').selectOption('200');
      assert(await page.evaluate(()=>document.scrollingElement.scrollWidth===document.scrollingElement.clientWidth));
      await page.locator('#settings-text-scale').selectOption('100');
      await page.locator('.bottom-nav a[href="#lessons"]').click();
      await page.locator('[data-date="2026-09-26"]').click();
      await page.locator('.lesson').click();
      await page.getByRole('link',{name:/申請請假/}).click();
      await page.locator('button[type=submit]').click();
      await page.locator('#reason-error').waitFor();
      await page.locator('#reason').selectOption({index:1});
      await page.locator('#note').fill('GitHub 線上測試：虛構申請，不連接正式資料。');
      await page.locator('button[type=submit]').click();
      await page.waitForURL(url=>url.hash==='#success/l2');
      assert.equal(await page.locator('h1').innerText(),'申請已收到');
      await page.getByRole('link',{name:'查看請假紀錄',exact:true}).click();
      await page.waitForURL(url=>url.hash==='#records');
      await page.locator('#app[data-page="records"]').waitFor();
      assert.match(await page.locator('main').innerText(),/GitHub 線上測試/);
      await page.screenshot({path:`screenshots/round11/github-${width}-records.png`,fullPage:true});
      evidence.checks.push({width,passed:['HTTP 200','version 0.11','three navigation entries','logo/font loaded','three read-only students','200% no horizontal overflow','validation error','submit success','new request in records']});
      await page.close();
    }
    assert.deepEqual(evidence.errors,[]);
    fs.writeFileSync('screenshots/round11/github-validation.json',JSON.stringify(evidence,null,2)+'\n');
    console.log('PASS: GitHub Pages 0.11, two mobile viewports and leave flow');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
