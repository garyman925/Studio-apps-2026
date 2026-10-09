# Round 10 UI skills 審核

2026-10-09，沿用frontend-design並以web-design-guidelines重新讀取[官方規則](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)。本輪只改課堂列表，不改請假業務流程。

## frontend-design：構圖與目視

配色：品牌#267D77、白卡#FFFFFF、背景#F7F8FA、請假卡候選#FFF4F4、正文#252A34、次要#626773。Parent Sans保持本地Noto Sans TC；時間20px／600、課名18px／600、狀態16px、資料14px。閱讀順序：時間＋右侧狀態→科目／課名／英文→導師／地點→查看詳情。

刪除重複今日label、科目底色及陰影，讓整卡淡玫瑰底只表達「與請假流程相關」，批准與待處理仍由不同文字／圖示識別。一般課堂白底。200%時間保持單一字級，狀態自然移到下一行並靠右；沒有省略課名或資料。目視390首頁、兩種卡片及200%整頁，另驗證430版面。首卡224.47px，相較第九輪264.84px減少40.37px。

## app.js

- app.js:61 - 已修正：完整時間單一span，右側共用statusBadge；今日label移除。
- app.js:61 - ✓ has-leave以有紀錄為條件，涵蓋requested／approved；一般课保留白底。原生link、狀態可讀名稱與詳情入口保留。
- app.js:55 - ✓ 狀態文字／圖示不靠底色單独表達，requested保留待處理。

## styles.css

- styles.css:16 - ✓ 新底色token #FFF4F4；正文13.36:1、次要5.26:1、操作6.33:1。
- styles.css:136 - 已修正：請假整卡背景，常態無陰影；hover邊線與focus-visible保留。
- styles.css:138 - ✓ flex-wrap、右側狀態margin-left:auto；200%無橫向溢出。
- styles.css:141 - 已修正：科目次要文字無底塊，減少裝飾。
- styles.css:143 - 已修正：時間統一20px／600／同色，數字對齊，無結束時間小字。

18組文字對比最低4.90:1，32組版面及16組到底操作通過；完整日曆／請假／草稿／防重／失敗重試／鍵盤回歸通過，console error=0。證據validation.json、contrast.json及22張PNG。

實機軟鍵盤、安全區、系統文字、螢幕閱讀器、家長對底色與狀態的理解及視覺定稿仍待人工；桌面200%不代替實機結果。原型日曆狀態URL與導航量測策略沿用，不新增API或儲存。只本地更新，未commit／push／部署。
