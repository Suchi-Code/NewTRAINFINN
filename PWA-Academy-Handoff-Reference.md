PWA Academy — Shared-JS Consolidation: Handoff Reference
เอกสารนี้สรุปสถานะโปรเจกต์ ณ จุดที่ย้ายมาแชทใหม่ ใช้เป็นความจำแทนบทสนทนาเดิมที่ทำมาแล้ว
> ✅ เพิ่มไฟล์ `projects.html` (แท็บ "โครงการ" ใน sidebar) เข้าเอกสารแล้ว — ดูหัวข้อ 1 และ 4.2

ภาพรวมระบบ
ระบบ: ติดตามงบประมาณและหลักสูตรฝึกอบรม กฝภ.1 (การประปาส่วนภูมิภาค)
ไฟล์ HTML ทั้งหมด:
ไฟล์	หน้าที่	มี sidebar?
`index.html`	หน้า login	(ไม่เกี่ยว auth guard — เป็นปลายทางตอน redirect)
`01\\\\\\\\\\\\\\\_Main-Reports.html`	รายละเอียดหลักสูตร + ทางเข้าไปแต่ละรายงาน	✅ มี sidebar
`training\\\\\\\\\\\\\\\_courses\\\\\\\\\\\\\\\_gfr1.html`	รายการหลักสูตรทั้งหมด (list)	✅ มี sidebar
`annual-plan.html`	แผนงานที่ส่วนกลางส่งมาให้ตอนต้นปี	✅ มี sidebar
`overview.html`	ภาพรวม (dashboard)	✅ มี sidebar
`05\\\\\\\\\\\\\\\_Budgeted-Expenses.html`	ประมาณการค่าใช้จ่าย (งบตามแผนของหลักสูตร)	❌ แค่ `.site-header`
`06\\\\\\\\\\\\\\\_Sum-Training-Expenses.html`	สรุปค่าใช้จ่ายจริง (คีย์ใบเสร็จ)	❌ แค่ `.site-header`
`07\\\\\\\\\\\\\\\_Sum-Borrow1.html`	สรุปฯ ใบปะหน้า (เทียบแผนกับผล)	❌ แค่ `.site-header`
`08\\\\\\\\\\\\\\\_Form-Pwa-27.html`	ใบหักล้างยืมเงิน (บง.27)	❌ แค่ `.site-header`
`09\\\\\\\\\\\\\\\_V199.html`	ค่าใช้จ่ายตาม ว.119	❌ แค่ `.site-header`
`10\\\\\\\\\\\\\\\_PDF-Overview.html`	ภาพรวม PDF ทั้งหมดของหลักสูตร	✅ มี sidebar
`projects.html`	แท็บ "โครงการ" — เลือกหลักสูตรที่เริ่มจัดอบรมแล้ว/กำลังดำเนินการ ดูสรุปงบประมาณ vs ใช้จริงรายหมวด (bar+donut chart), วิทยากร, สถานะไฟล์ PDF ต่อหลักสูตรแบบ read-only ล้วน (ไม่มีการบันทึกข้อมูลกลับ Sheet เลย)	✅ มี sidebar
|`settings.html`||✅ มี sidebar|
Backend: Google Apps Script (`Code.gs`) → อ่าน/เขียน Google Sheets ชื่อ `courses`, `budget`, `actual06`, `actual07`, `vendors`, `annual\\\\\\\_plan`
Shared `js/` modules (โหลดร่วมกันทุกไฟล์ที่เกี่ยวข้อง):
`config.js` — `APP\\\\\\\_CONFIG` (Supabase URL/key, GAS_URL, PDF_SERVER_URL, PDF_BUCKET) — ต้องโหลดก่อนไฟล์อื่นเสมอ
`auth.js` — `checkAuth()` (guard เข้าหน้า, redirect ไป index.html ถ้าไม่ login), `loadCurrentUser()` (เติมชื่อผู้ใช้ที่ sidebar #userName/#userSub — ใช้ได้เฉพาะไฟล์ที่มี sidebar จริง)
`date-th.js` — `DateTH.normalize()`, `DateTH.format()`, `DateTH.formatRange()` (คุมเรื่อง timezone UTC+7 + Excel serial date)
`gas-api.js` — `gsApi(action, data, no)` (error-handling แบบ swallow-return-null ไม่ throw), `showGsLoader()`/`hideGsLoader()`/`showGsStatus()`, `saveReportPdf(courseNo, reportKey, blob)` (อัปโหลด PDF versioning + เขียนลิงก์กลับ Sheet อัตโนมัติ)
`schema.js` — `SchemaTH.SEC`/`SUB`/`SEC\\\\\\\_OPTS`/`SUB\\\\\\\_OPTS`/`DYNAMIC\\\\\\\_SEC\\\\\\\_ORDER`/`LOAN\\\\\\\_SECTIONS`/`getActiveSections(rows,toggles,budget)`/`computeMajorNumbers(rows,toggles,budget)`/`SHEET\\\\\\\_FIELD\\\\\\\_MAP`
ไฟล์ที่โหลด `schema.js` (มีโครงสร้างข้อมูลแบบ sec/sub): 06, 07, 09 เท่านั้น — 05 ใช้ระบบ
checkbox+field ID คงที่ ไม่มี sec/sub ให้ map จึงไม่ต้องโหลด (ตรวจแล้ว ไม่มี dead import ในไฟล์จริง)
`projects.html` ก็ไม่โหลด `schema.js` เช่นกัน แม้จะอ่านข้อมูล budget/actual07 ก็ตาม — เพราะเป็นหน้า
read-only ล้วนที่อ่านชื่อคอลัมน์ Sheet แบบแบน (`b.secFuel`, `a7.a\\\\\\\_1\\\\\\\_1`, `a7.a\\\\\\\_venue\\\\\\\_meet` ฯลฯ) ตรงๆ
ผ่าน object `CATS` ของตัวเอง ไม่เคยเขียนกลับ Sheet และไม่เคยต้อง map sec/sub → ไม่ dead import เช่นกัน
---
2. Pattern การย้ายไฟล์เข้า shared js/ (สำหรับอ้างอิงเวลาทำไฟล์ใหม่ในอนาคต)
2.1 Head script tags (ลำดับสำคัญ ห้ามสลับ)
```html
<script src="js/config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/auth.js"></script>
<script src="js/date-th.js"></script>
<script src="js/gas-api.js"></script>
<script src="js/schema.js"></script>
<script>checkAuth();</script>
</head>
```
ไฟล์ที่ ไม่มี sidebar (05,06,07,08,09,10): เรียกแค่ `checkAuth()` ไม่ต้องเรียก `loadCurrentUser()`
ไฟล์ที่ มี sidebar (01, training_courses_gfr1, annual-plan, overview, projects, settings): เรียกทั้ง `checkAuth()` และ `loadCurrentUser()`
(หมายเหตุ: `index.html` เป็นหน้า login เอง ไม่โหลด auth.js/checkAuth()/loadCurrentUser() เลย เพราะเป็นปลายทางตอน redirect ไม่ใช่หน้าที่ต้อง guard)
2.2 PDF export/upload
Endpoint สร้าง PDF (Puppeteer): ใช้ `APP\\\\\\\_CONFIG.PDF\\\\\\\_SERVER\\\\\\\_URL` (`.../generate-pdf`)
บันทึกไฟล์ผ่าน `saveReportPdf(courseNo, 'pdfXX', blob)` — versioning + เขียนลิงก์กลับ Sheet
คอลัมน์ `pdfXX`/`pdfXXSavedAt` อัตโนมัติในตัว — ห้ามเรียก `updateCourseField`/`updatePdfUrl` ซ้ำเอง
2.3 Race condition pattern ที่ต้องเช็คทุกไฟล์ (ดู gotcha 6.6)
ฟังก์ชัน save ทุกตัวต้องเป็น `async function`, ใช้ `await gsApi(...)` ก่อนค่อยตัดสินใจ popup/redirect
ห้าม ใช้ `gsApi(...).then(...)` แบบ fire-and-forget ควบคู่กับ `setTimeout(popup, ms)` เดามั่ว —
✅ ทุกไฟล์  แก้ให้เป็น `async`/`await` ครบแล้ว (ยืนยันด้วย grep ในรอบตรวจสอบล่าสุด)
---
3. Bug ledger — เจอแล้ว/แก้แล้ว (ยืนยันกับไฟล์จริงล่าสุดแล้วทุกรายการ)
#	บั๊ก	พบในไฟล์	สถานะ (ยืนยันกับไฟล์จริง)
1			

4. งานที่เหลือ
4.1 `projects.html` — ไฟล์ใหม่ที่เพิ่งเพิ่มเป็นแท็บ "โครงการ" ใน sidebar
หน้า read-only ล้วน ไม่มีการเขียนกลับ Sheet เลยสักฟังก์ชันเดียว

4.2 `06\\\\\\\_Sum-Training-Expenses.html`
---
5. Domain business rules ที่ต้องรู้ก่อนแก้โค้ด (สำคัญ — พลาดแล้วงบจะเพี้ยน)
ค่าเดินทาง/ที่พักวิทยากรภายใน + ค่าเดินทางประธานในพิธี = เงินโอนให้หน่วยงานต้นสังกัดโดยตรง → อนุมัติ = ใช้จริงเสมอ ไม่ต้องผ่านใบเสร็จในไฟล์ 06 (คีย์ไว้ตั้งแต่ไฟล์ 05 แล้ว re-use ไปที่ 07 ตรงๆ) — เหตุผลที่ `SUB\\\\\\\_OPTS\\\\\\\['int']` เหลือแค่ `INT\\\\\\\_HONORARIUM` ตัวเดียว
แผน (planned) มาจากตาราง annual-plan (ส่วนกลางกำหนดตอนต้นปี, คีย์ `planId`) — อนุมัติ (approved) มาจาก `budget.budgetTotal` ที่ผู้ใช้คีย์เองตอนจัดอบรม (ชีต `budget`) — ใช้จริง (actual) มาจาก `actual07.grandTotal` (fallback `actual06.grandTotal`) — 3 ค่านี้อยู่คนละชีตกัน คนละเวลากรอก
Join key ระหว่างแผนกับผลจริง: ต้องผ่าน `courses.planId` (ไม่ใช่ `courseNum` เดี่ยวๆ เพราะเลขอาจไม่ตรงกันข้ามปี) → 1 `planId` อาจมีหลาย `no` (รุ่น) ต้อง sum ข้ามรุ่นเอง (ดู `getPlanSummary()` ใน Code.gs ที่ทำ join+sum นี้ให้แล้ว)
field name ระดับ Google Sheet column ไม่เปลี่ยนเวลารีแฟกเตอร์ (`sec3\\\\\\\_1`, `a\\\\\\\_in\\\\\\\_1` ฯลฯ ยังคงเดิม) — เปลี่ยนแค่ชั้น JS abstraction (`SchemaTH.SEC`/`SUB`) เท่านั้น
---
6. Known gotchas — cross-file
6.1 `actual06.grandTotal` vs `actual07.grandTotal` คนละความหมาย ห้ามใช้สลับกัน
`actual06.grandTotal` = เฉพาะ "ก. เงินยืมทดลองจ่าย" ตาม `LOAN\\\\\\\_SECTIONS`
`actual07.grandTotal` = ยอดรวมทั้งหมดจริง (ก.+ข. รวม INT/ประธาน)
ใช้ `actualGrand`/`actualGorTotal` (จาก a07) เป็น "ใช้จริงทั้งหมด" เสมอ ห้ามใช้ `actualGorLoan`
6.2 `getPlanSummary()` นับเฉพาะ course ที่มี `planId` ผูกไว้ ที่เหลือหายเงียบ
รุ่น/หลักสูตรที่ไม่ผูก planId จะไม่ถูกนับในยอดอนุมัติ/ใช้จริงของแผนใดเลย ไม่มี error — มี soft warning
(`#unlinkedNote`) ใน overview.html แล้ว
6.3 `COL\\\\\\\_\\\\\\\*` array ใน Code.gs ไม่ใช่ schema validation จริง
แก้ header ใน Sheet ทุกครั้งต้องอัปเดต `COL\\\\\\\_\\\\\\\*` ใน Code.gs คู่กันเสมอด้วยตนเอง ไม่มี validation อัตโนมัติ
6.4 Type coercion ของตัวเลข/ปีจาก Google Sheets
ทุกฟิลด์ตัวเลขจาก Sheet ต้อง parseInt/parseFloat ก่อนใช้ comparison หรือคำนวณเสมอ
6.5 วันที่ timezone UTC+7 ต้องผ่าน `DateTH.normalize()` เท่านั้น ห้ามเขียน parser ใหม่
ทุกไฟล์ migrate ครบแล้ว (ยืนยันแล้วทั้ง 05–10) — อย่าย้อนกลับไปเขียน local Date parser ใหม่ในไฟล์ในอนาคต
6.6 Race condition pattern: `.then()` ไม่ await ก่อน redirect/popup
ทุกฟังก์ชัน save ต้องเป็น `async` + `await gsApi(...)` — ✅ ยืนยันแล้วว่าทุกไฟล์ (รวม `saveActual07()`
ในไฟล์ 07) แก้ตาม pattern นี้ครบแล้ว ไม่มีไฟล์ไหนเหลือ `.then()` แบบ fire-and-forget คู่กับ
`setTimeout(popup, ms)` อีกต่อไป
6.7 ไม่มีเนื้อหาเพิ่มเติม
6.8 ทุกไฟล์ที่เรียก gsApi() ต้องใช้ showGsLoader()/hideGsLoader() overlay กลาง
ยืนยันแล้วว่าทุกไฟล์ (รวม annual-plan.html, 10_PDF-Overview.html, projects.html) ใช้ pattern นี้ครบแล้ว
ไม่มีไฟล์ไหนใช้ข้อความ inline ("กำลังโหลด...") แบบ text-only อีกต่อไป
6.9 ตัวเลขหลักล้านบาทที่ย่อ ("x ลบ.") ต้องแสดงทศนิยม 3 ตำแหน่งเสมอ
`(n/1e6).toFixed(3)+' ลบ.'` — ยืนยันแล้วว่า overview.html และ annual-plan.html ใช้ตรงกัน
6.10 ชื่อไฟล์เป็น underscore เสมอ (เช่น `01\\\\\\\_Main-Reports.html`)
⚠️ แก้ไขจากที่เคยระบุผิด: ไฟล์ 07 (`showBackConfirmPopup()`, `confirmBack07()`) ยังมี
`location.href='01.Main-Reports.html'` (จุด) หลงเหลืออยู่ 2 จุด — ไม่ใช่ทุกไฟล์ underscore ครบหมดแล้ว
อย่างที่เคยเขียนไว้ ดู ledger #22 (ไม่มี subsection ในหัวข้อ 4 อธิบายเพิ่ม — แก้ตรงๆ ตาม
คำอธิบายในตาราง ledger ได้เลย) — ไฟล์อื่นที่เหลือ (05,06,08,09,10) ยืนยันแล้วว่า
underscore ถูกต้องครบทุกจุด
6.11 overview.html sidebar ใช้ชื่อ class ต่างจากไฟล์อื่น (cosmetic — ยังไม่แก้ ไม่กระทบการทำงาน)
`.side-nav`/`.side-nav-label`/`.side-user` แทน `.nav`/`.nav-label`/`.user` — ทำงานถูกต้องเพราะมี CSS
ของตัวเอง แต่ทำให้ refactor CSS sidebar ให้ใช้ไฟล์เดียวร่วมกันไม่ได้จนกว่าจะ rename class ก่อน
