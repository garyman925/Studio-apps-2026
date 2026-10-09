# UI skills 審核 · 第五輪

使用frontend-design先制定白色內容／淺灰背景、課堂時間優先、系統字體與字重層級、學生身份一致的方案，再實作及檢視瀏覽器截圖。沒有新增圖片裝飾或功能。

web-design-guidelines規則來源（2026-10-09讀取）：https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md 。檢查本地index.html、app.js及styles.css；以下為修正後結果，非全面認證。

- app.js:82 — 原生學生select改語意button＋有名稱dialog；目前選項aria-pressed。
- app.js:95 — 修正面板Tab邊界焦點，Escape／關閉恢復觸發按鈕；瀏覽器鍵盤通過。
- app.js:94 — 增加跳至主要內容；Logo有尺寸、alt、優先載入及品牌translate=no。
- app.js:67 — 表單有label／name、autocomplete=off、錯誤聚焦、提交中鎖定與status。
- app.js:174 — 未提交草稿離開文件提示；App內草稿保留，瀏覽器重新整理已測試。
- styles.css:85 — 可操作卡片hover可辨識，移除整圈紫色邊框；focus-visible仍清楚。
- styles.css:91 — 時間數字對齊，明確字級／行高；長文字與200%通過。
- styles.css:72 — 跳過連結只在焦點時顯示；dialog內可捲動、背景原生隔離。
- index.html:6 — 瀏覽器主題色與白色頂部一致，沒有禁止縮放。

保留適用範圍：靜態虛構課堂日期不是實時日期；固定導航量度為文字放大與安全區預留，並非大型列表渲染；沒有影片、拖拉、SSR或深色模式。系統字體無CDN，沒有新增font下載。原因選項／正式必填仍待確認。人工手機與螢幕閱讀器驗證未勾選。

skills安裝於C:/Users/Nebula-Gary/.codex/skills/frontend-design及web-design-guidelines，後續回合可用；應用不依賴skills或測試工具。
