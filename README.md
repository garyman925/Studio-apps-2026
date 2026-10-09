# 家長課堂 · 評審版 0.11

第十一輪（2026-10-09）：加入設定分頁，底部為課堂／請假紀錄／設定。文字大小100／150／200%即時套用，學生資料唯讀展開，版本0.11與公司網站入口。候選字體改為頁標24px、課名20px、時間18px，保留青綠及淡玫瑰請假卡。五頁流程及記憶體狀態不變，視覺定稿仍待設計師確認。

2026-10-09 設計師授權將0.11同步至 [GitHub](https://github.com/garyman925/Studio-apps-2026)。GitHub Pages使用main分支根目錄，推送後自動發佈；測試入口為 [線上0.11](https://garyman925.github.io/Studio-apps-2026/?v=0.11#lessons)。上線驗證另記於交付紀錄，與本地UI驗收分開。

## 開啟與修改

現有本機伺服器開啟 [本地0.11](http://127.0.0.1:4173/?v=0.11#lessons)。若未啟動，在此資料夾執行 `node server.cjs`。XAMPP啟動Apache後亦可開 [XAMPP版本](http://localhost/studio-apps-2026/?v=0.11#lessons)。無需安裝或建置。4173僅綁定本機；同網段手機測試可使用XAMPP電腦IP/studio-apps-2026/，需Apache及網路可達。

- styles.css：集中色碼、字級、尺寸、日曆及狀態樣式。
- content.js：版本0.11、固定今日2026-09-24、ISO課堂日期、虛構學生及兩筆種子紀錄。
- app.js：日曆、五頁流程、設定頁、三項導航、學生面板與草稿互動。
- [UI Spec](UI_DESIGN_SPEC.md)、[Checklist](docs/UI_Designer_Workflow_Checklist.md)、[驗證紀錄](docs/PROTOTYPE_VALIDATION.md)。

預設9月24日有10:00中文（已獲準）及16:30英語（申請／待處理）。選9月26日可測試未申請課堂→原因錯誤→填寫→提交→成功→紀錄；新狀態只有請假申請。已有狀態只可查看紀錄。附件僅選名稱，不上傳。所有互動僅在頁面記憶體；重新整理恢復100%文字與兩筆初始紀錄，清除新增申請與草稿，未提交草稿會提示離開。

## 評審證據

[第十一輪截圖索引](screenshots/round11/REVIEW.md)：390×844、430×932共28張PNG，含週曆、月曆、兩狀態卡片、表單底部、成功、紀錄底部與200%補充。[實測數據](screenshots/round11/validation.json)：42組版面、18組底部操作及兩尺寸互動結果通過；18組文字對比最低4.90:1。

環境提供Playwright後可執行 `node scripts/validate-round11.cjs`；PLAYWRIGHT_MODULE指定套件位置、DEMO_URL指定本機地址。真實手機鍵盤、安全區、系統文字、螢幕閱讀器、家長UAT及視覺定稿待人工；測試步驟見驗證紀錄。原因必填只為原型測試，正式規則、期限、补堂、附件大小與字數未設定。

以下保留舊版首次發佈紀錄；目前版本以上方0.11入口及交付紀錄為準。
## 舊版線上發佈紀錄與其他開啟方式

2026-10-05 依設計師要求已上傳至 [Studio-apps-2026](https://github.com/garyman925/Studio-apps-2026)，並以 GitHub Pages 提供測試。測試網址：[線上 Demo](https://garyman925.github.io/Studio-apps-2026/)。Pages 設定為 main 分支根目錄，已確認發佈成功，可直接在電腦或手機瀏覽器操作。更新 main 後 Pages 會重新發佈。

線上版本同樣只使用虛構資料及頁面記憶體；重新整理清除本次新增申請並恢復兩筆初始紀錄，不上傳附件或連接正式帳戶。課堂的「今日」仍是固定示例日期 2026年9月24日。

最簡單：用瀏覽器開啟本資料夾的 **index.html**。使用一般 script，不需要安裝或建置。

本機伺服器（目前評審使用此方式）：在本資料夾執行 `node server.cjs`，開啟 http://127.0.0.1:4173 。伺服器只監聽本機、不接受資料提交；白名單包含4個入口檔案及官方Logo。關閉該程序即停止。若 4173 已在使用，先直接開啟現有頁面，不必重複啟動。

手機實機：localhost 指向手機本身，不能直接開啟電腦的 127.0.0.1。若你已有允許私人區域網絡存取的 XAMPP，電腦與手機連同一私人 Wi-Fi，在手機開啟 `http://電腦的區域網絡IP/studio-apps-2026/`。本機伺服器設定未變更；私人網絡方式及真實手機尚未驗證。手機亦可直接使用上述 GitHub Pages 測試網址。

## 評審操作

1. 選陳樂晴，在日曆選9月26日，點課堂 → 申請請假。9月24日兩堂課已預載申請／獲準狀態，只可查看紀錄。
2. 直接提交可查看未填原因錯誤。選原因、填虛構備註、選示例附件（可移除）。
3. 提交後顯示「申請已收到」，查看紀錄。這不是批准，也不承諾補堂。
4. 切換陳樂言看長課程名；林芷澄為無課堂示例。
5. 一般介面不顯示 Demo／虛構資料提示或評審說明。如需驗證状态，開啟 `?review=1#lessons`（本地例如 http://127.0.0.1:4173/?review=1#lessons），每頁底部展開「畫面設定」。可選文字大小及載入／空資料／失敗，表單可設定下一次提交失敗；此控制仍不能取代實機驗收。
6. 返回詳情再進表單會保留草稿；已提交的課堂改為查看紀錄。重新整理清除草稿與新增申請，恢復100%文字及兩筆初始紀錄。

## 修改位置

- `UI_DESIGN_SPEC.md`：已確認決策、候選視覺值、頁面互動及待定業務規則。
- `styles.css`：全部樣式；頂部 `:root` 集中品牌、文字、間距、圓角等 token。元件樣式依 class 集中。
- `content.js`：虛構學生、課堂、主要共用文案、候選原因及示例附件名稱。
- `app.js`：五頁模板、欄位標籤及頁面文案、hash 路由、前端狀態、驗證／防重／失敗重試。沒有框架或後端 API。
- `index.html`：入口、語言、viewport、瀏覽器主題色。
- `server.cjs`：可選的 Node 本機靜態預覽伺服器，不依賴第三方套件。
- `docs/PROTOTYPE_VALIDATION.md`：驗證場景、證據及限制。
- `screenshots/round2/REVIEW.md`：歷史0.2版八張指定截圖及200%文字補充證據。尺寸為390×844／430×932。
- `screenshots/round2/measurements.json`、`typography.json`：14組底部位置量測及實際CSS字級。
- `docs/UI_Designer_Workflow_Checklist.md`：本次已核實的原型項目。原有 `.xlsx` 未修改，避免誤認與 Markdown 已同步。
- `screenshots/final-*.png`：第一輪0.1歷史截圖；`viewport-checks.json`為第一輪15組寬度量測，不代表目前0.2版。
- `screenshots/01-*.png` 至 `18-*.png`：第一轮流程與狀態證據，早於姓名／短頁導覽修正。全頁截圖會捕捉停留在 viewport 的 sticky 導覽；請以 final 截圖及可操作 Demo 評審最終版面。

## 技術選擇與安全邊界

本地沒有既有 App 或元件，所以使用標準 HTML／CSS／JavaScript，零外部依賴、無建置流程，設計師改完刷新即可查看。所有資料只在頁面記憶體；不使用 localStorage、cookies、追蹤或正式帳戶。沒有 fetch、XHR、上傳 input 或提交 endpoint。附件只是虛構名稱，完全不讀取檔案。原因必填只為 Demo 錯誤狀態示範，正式規則未確認。

歷史：2026-09-24 接手時本地資料夾沒有獨立 .git，Git 向上找到 C:/ 的空 repository；未修改該上層 repository，當時也沒有推送。2026-10-05 本次建立專案自己的 repository，使用設計師新指定的 Studio-apps-2026。原始需求附件及原始 XLSX 保留在本地，不納入此公開 Demo repo；相關驗證紀錄仍保留當時的歷史說明。UI Spec 原稿與 B 圖缺少，已在 Spec 記錄。
