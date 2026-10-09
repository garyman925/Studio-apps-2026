# 第六輪 skills 審核

frontend-design：先以學習行程構圖制定左時間／右課程、緊湊身份列、Noto Sans TC本地字體及白色內容，再看實際截圖修正時間拆行與摘要換行。沒有新增功能或裝飾圖片。現代感仍由設計師確認，不以操作測試代替。

web-design-guidelines來源（2026-10-09重新讀取）：https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

- styles.css:2 — 本地字體、swap及variable weight；index.html有preload，實際font載入通過。
- styles.css:89 — 行程grid與時間nowrap；200%改單欄，長文字可換行。
- styles.css:114 — 日期／時間兩欄，不用固定高度；200%單欄。
- styles.css:151 — 紀錄標籤與內容分欄，長備註min-width:0及換行保留。
- app.js:125 — 修正main焦點被帶到頁底；首屏scrollY=0及跳過連結已驗證。
- app.js:44 — 課堂仍為單一語意a，保留明確入口，沒有巢狀互動。

沿用學生dialog、焦點循環、表單label與錯誤、提交中status、草稿提示、動態導航留白、減少動態及品牌圖alt／尺寸。30組版面、12組底部操作、完整流程與鍵盤證據在validation.json。完整字體約5.4MB；不使用CDN，但正式產品的分片／快取待評估。手機、螢幕閱讀器及視覺簽核未驗收。
