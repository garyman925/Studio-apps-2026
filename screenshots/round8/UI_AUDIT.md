# Round 8 UI skills 審核

使用frontend-design及web-design-guidelines；規則於2026-10-09重新讀取[官方來源](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)。僅原型本輪檢查，不代表完整產品可及性認證。

## frontend-design：構圖與目視

配色採白色內容／#F7F8FA背景／#267D77操作／琥珀待處理／深青綠獲準；Parent Sans（本地Noto Sans TC）保持26／16／14px層級。結構為滿寬品牌→精簡學生→我的課堂→日曆→選中日→時間與課程。日曆表達有課日期；狀態獨立放課名後，不與科目或日期爭位置。以圖示、字重與淡底強化，不增加整卡色塊或裝飾。

檢視週曆、月曆、兩狀態、表單、成功、紀錄及200%截圖。初版今日與選中日重疊時外框不明顯，最終補內側白環。月曆展開將課堂移到下方屬預期；可收起恢復緊湊週曆。200%日期與圖例自然增高，課堂轉單欄。視覺是否足夠現代、間距和候選色碼仍由設計師評審。

## app.js

- app.js:53 - ✓ 共用requested／approved狀態與圖示；新提交僅requested。
- app.js:59 - 已修正：課堂link可讀名称原缺狀態；補狀態文字，整卡原生a，無嵌套互動。
- app.js:70 - ✓ Intl日期；原生日期button、完整日期／堂數／狀態label、aria-current／pressed、圖例。
- app.js:98 - 已修正：成功說明改用statusNote，避免直接進預載獲準成功route時仍顯示待處理聲明。
- app.js:161 - ✓ 日期箭頭重新選中與恢復焦點，Enter／Space原生操作；學生dialog鍵盤與底部焦點避讓實測。
- app.js:202 - ✓ 原因錯誤聚焦、提交期間鎖定與防重、失敗保留草稿；無API或持久儲存。

## styles.css

- styles.css:94 - ✓ 狀態1rem／600、換行；實際對比申請5.76:1、獲準6.08:1。
- styles.css:103 - ✓ 七欄minmax(0,1fr)、日期自然高度、200%無裁切或橫向溢出。
- styles.css:109 - 已修正：今日選中白環，與一般選中日期可区分；focus-visible保留。
- styles.css:219 - ✓ reduced-motion保留；導航實測高度預留與安全區CSS保留。

## 有意保留的原型範圍／人工項目

- app.js:6 - 日曆日期與展開狀態留頁面記憶體，按方案重整恢復初始狀態；未新增可分享日期URL。
- app.js:133 - 導航ResizeObserver量測保留，確保文字放大與安全區高度預留；此小型原型未做效能基準。
- 真實手機軟鍵盤、安全區、系統文字、VoiceOver／TalkBack及視覺定稿未驗證。桌面200%是文字重排證據，不代替以上結果。
