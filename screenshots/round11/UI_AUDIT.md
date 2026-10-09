# Round 11 UI skills 審核

2026-10-09；已讀frontend-design與web-design-guidelines，並重新讀取[官方規則](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)。本輪為本地原型審核，不代表完整產品可及性認證。

## frontend-design：字體、分組与目視

配色延續品牌#267D77、白色#FFFFFF、背景#F7F8FA、請假卡#FFF4F4、正文#252A34、次要#626773。字體維持本地Noto Sans TC：頁標24px／600、課名20px／600、時間18px／500、狀態16px／500、正文16px、次要14px。設定不再堆卡片，改為小型分組標題、原生控制與細線；底部齒輪與其餘線條圖示同系統。

構圖：品牌→學生→設定→顯示／學生資料／關於與支援→三項導航。設定沒有無效通知／帳戶選項；公司網站是實際外部連結，版本由content.js統一來源。學生資料為唯讀原生details，不新增修改操作。

目視設定首頁、200%設定底部與新字級課堂列表。初版放大導航出現「請假紀／錄」，修正為「請假／紀錄」，並重跑全部驗證；沒有縮小字體以硬塞三欄。200%導航高度141.78px，内容預留166px。視覺定稿仍由設計師確認。

## app.js

- app.js:53 - ✓ #settings路由獨立；返回課堂保留日期，既有五頁仍可進入。
- app.js:111 - ✓ 文字大小有label、獨立id與name；三學生資料唯讀，native details支援Enter。
- app.js:111 - ✓ 公司網站target=_blank／noopener noreferrer、可讀名稱註明另開分頁；攔截回應驗證新頁正確URL，非外站內容驗收。
- app.js:128 - 已修正：課堂選中判斷排除設定，三項導航只有一個aria-current；子頁歸課堂。
- app.js:147 - ✓ 文字大小與評審控制共用狀態，100／150／200雙向同步；不重新渲染輸入表單，草稿与設定焦點保留。

## styles.css

- styles.css:42 - ✓ h1 24px／600；課名20px／600、時間18px／500與狀態500實測。
- styles.css:217 - 已修正：導航文字keep-all與wbr按詞換行，200%無横向溢出。
- styles.css:233 - ✓ 白色分組列表與細分隔線，原生select／summary至少48px操作。
- styles.css:249 - ✓ 詳情完整時間與列表／摘要／紀錄使用同一候選時間尺寸。

42組版面、18組到底操作、18組文字對比（最低4.90:1）、完整日曆／請假／草稿／防重／失敗重試及鍵盤回歸通過；console error=0。證據validation.json、contrast.json、28張PNG及validate-round11.cjs。

## 人工及原型邊界

實機軟鍵盤、安全區、系統文字、VoiceOver／TalkBack、家長UAT、外部網站實際內容載入及視覺定稿待人工；步驟見驗證紀錄。文字大小與資料只在記憶體，重整恢復初始值；未新增儲存、API、通知、語言或正式帳戶。導航高度仍使用既有ResizeObserver，未做效能基準。只本地，未commit／push／部署。
