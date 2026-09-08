# PWA Academy — Shared-JS Consolidation: Handoff Reference

เอกสารนี้สรุปสถานะโปรเจกต์ ณ จุดที่ย้ายมาแชทใหม่ ใช้เป็นความจำแทนบทสนทนาเดิมที่ทำมาแล้ว

> \\\*\\\*📌 อัปเดตล่าสุด (รอบนี้)\\\*\\\*: เปิดไฟล์ `07\\\_Sum-Borrow1.html` จริงตรงๆ (ไม่ใช่เชื่อเอกสารเดิม) แล้ว
> grep/`node --check` ยืนยันทีละจุดว่า \\\*\\\*3 งานที่เอกสารฉบับก่อนหน้าค้างไว้ในหัวข้อ 4.1 (race condition ใน
> `saveActual07()`, sync รหัส SEC/SUB กับ 06, migration shim) ถูกแก้จริงครบทั้งหมดแล้ว\\\*\\\* — ดูหลักฐานที่
> รายการ #6, #11, #12, #13 ในบทที่ 3 (ทุกจุดยืนยันด้วย grep ตรงบรรทัดจริงในไฟล์)
>
> ⚠️ แต่ระหว่างตรวจสอบพบ \\\*\\\*บั๊กใหม่ที่ไม่เคยมีในเอกสาร\\\*\\\*: `07\\\_Sum-Borrow1.html` มีปุ่ม redirect กลับ
> หน้าหลัก 2 จุด (`showBackConfirmPopup()`, `confirmBack07()`) ที่ยังเขียน `location.href='01.Main-Reports.html'`
> (จุด) แทนที่จะเป็น `01\\\_Main-Reports.html` (ขีดล่าง) — เป็นบั๊กแบบเดียวกับ ledger #14 (ที่เคยแก้ในไฟล์ 05)
> แต่ไม่เคยถูกแก้ในไฟล์ 07 เลย และ gotcha 6.10 เดิมระบุผิดว่า "07 ยืนยันใช้ underscore ตรงกันหมดแล้ว" —
> เพิ่มเป็นรายการ #22 ในบทที่ 3 และเป็นงานเดียวที่เหลือของทั้งโปรเจกต์ตอนนี้ (ดูหัวข้อ 4.1 ใหม่)
>
> ✅ เพิ่มไฟล์ `projects.html` (แท็บ "โครงการ" ใน sidebar) เข้าเอกสารแล้ว — ดูหัวข้อ 1 และ 4.2
>
> ✅ \*\*06\\\_Sum-Training-Expenses.html — เพิ่มปุ่มเลื่อนลำดับรายการบิลขึ้น/ลง (▲▼) และลบฟีเจอร์
> "รวมลำดับกับรายการก่อนหน้า" ออกทั้งหมด\*\*: เดิมถ้าคีย์บิลไม่เรียงตามหมวด ก. (เช่น คีย์หมวด 4-5 ก่อน
> หมวด 1) ตารางรายงานจะขึ้นหมวดไม่เรียงตามลำดับ ก.1→ก.5 เพราะ `sumBuildDoc()` เดินตามลำดับ DOM ของ
> การ์ดตามที่กรอกจริง ไม่ได้ sort ตาม `DYNAMIC\_SEC\_ORDER` เหมือนไฟล์ 07/09 — ตัดสินใจ\*\*ไม่ทำ auto-sort\*\*
> (เสี่ยงชนกับลำดับที่บันทึกไว้ตอน `sumCollectState()`/restore กลับมาแก้ไข) แต่ให้ผู้ใช้กดสลับ DOM จริง
> ในหน้ากรอกบิลแทน ดูรายละเอียดเต็มที่หัวข้อ 4.3 ใหม่ และ ledger #23

## 1\. ภาพรวมระบบ

**ระบบ**: ติดตามงบประมาณและหลักสูตรฝึกอบรม กฝภ.1 (การประปาส่วนภูมิภาค)

**ไฟล์ HTML ทั้งหมด**:

|ไฟล์|หน้าที่|มี sidebar?|สถานะ migrate|
|-|-|-|-|
|`index.html`|หน้า login|(ไม่เกี่ยว auth guard — เป็นปลายทางตอน redirect)|✅ เสร็จ|
|`01\\\_Main-Reports.html`|รายละเอียดหลักสูตร + ทางเข้าไปแต่ละรายงาน|✅ มี sidebar|✅ เสร็จ|
|`training\\\_courses\\\_gfr1.html`|รายการหลักสูตรทั้งหมด (list)|✅ มี sidebar|✅ เสร็จ|
|`annual-plan.html`|แผนงานที่ส่วนกลางส่งมาให้ตอนต้นปี (read-only)|✅ มี sidebar|✅ เสร็จ|
|`overview.html`|ภาพรวม (dashboard)|✅ มี sidebar|✅ เสร็จ|
|`05\\\_Budgeted-Expenses.html`|ประมาณการค่าใช้จ่าย (งบตามแผนของหลักสูตร)|❌ แค่ `.site-header`|✅ เสร็จ|
|`06\\\_Sum-Training-Expenses.html`|สรุปค่าใช้จ่ายจริง (คีย์ใบเสร็จ)|❌ แค่ `.site-header`|✅ เสร็จ (รอบนี้เพิ่มปุ่มเลื่อนลำดับรายการ ▲▼ ในหน้ากรอกบิล — ดูหัวข้อ 4.3)|
|`07\\\_Sum-Borrow1.html`|สรุปฯ ใบปะหน้า (เทียบแผนกับผล)|❌ แค่ `.site-header`|✅ migrate เสร็จ (auth/date/gsApi/schema/loader/race-condition/SEC-SUB sync ครบ) — ⚠️ **เหลือบั๊กลิงก์เล็กน้อย** ดูหัวข้อ 4.1|
|`08\\\_Form-Pwa-27.html`|ใบหักล้างยืมเงิน (บง.27)|❌ แค่ `.site-header`|✅ เสร็จ|
|`09\\\_V199.html`|ค่าวัสดุเบ็ดเตล็ด (ว.119)|❌ แค่ `.site-header`|✅ เสร็จ|
|`10\\\_PDF-Overview.html`|ภาพรวม PDF ทั้งหมดของหลักสูตร|❌ แค่ `.site-header`|✅ เสร็จ|
|`projects.html`|แท็บ "โครงการ" — เลือกหลักสูตรที่เริ่มจัดอบรมแล้ว/กำลังดำเนินการ ดูสรุปงบประมาณ vs ใช้จริงรายหมวด (bar+donut chart), วิทยากร, สถานะไฟล์ PDF ต่อหลักสูตรแบบ read-only ล้วน (ไม่มีการบันทึกข้อมูลกลับ Sheet เลย)|✅ มี sidebar|✅ เสร็จ (ไฟล์ใหม่ — ดูหัวข้อ 4.2)|

**Backend**: Google Apps Script (`Code.gs`) → อ่าน/เขียน Google Sheets ชื่อ `courses`, `budget`, `actual06`, `actual07`, `vendors`, `annual\\\_plan`

**Shared `js/` modules** (โหลดร่วมกันทุกไฟล์ที่เกี่ยวข้อง):

* `config.js` — `APP\\\_CONFIG` (Supabase URL/key, GAS\_URL, PDF\_SERVER\_URL, PDF\_BUCKET) — **ต้องโหลดก่อนไฟล์อื่นเสมอ**
* `auth.js` — `checkAuth()` (guard เข้าหน้า, redirect ไป index.html ถ้าไม่ login), `loadCurrentUser()` (เติมชื่อผู้ใช้ที่ sidebar #userName/#userSub — **ใช้ได้เฉพาะไฟล์ที่มี sidebar จริง**)
* `date-th.js` — `DateTH.normalize()`, `DateTH.format()`, `DateTH.formatRange()` (คุมเรื่อง timezone UTC+7 + Excel serial date)
* `gas-api.js` — `gsApi(action, data, no)` (error-handling แบบ swallow-return-null ไม่ throw), `showGsLoader()`/`hideGsLoader()`/`showGsStatus()`, `saveReportPdf(courseNo, reportKey, blob)` (อัปโหลด PDF versioning + เขียนลิงก์กลับ Sheet อัตโนมัติ)
* `schema.js` — `SchemaTH.SEC`/`SUB`/`SEC\\\_OPTS`/`SUB\\\_OPTS`/`DYNAMIC\\\_SEC\\\_ORDER`/`LOAN\\\_SECTIONS`/`getActiveSections(rows,toggles,budget)`/`computeMajorNumbers(rows,toggles,budget)`/`SHEET\\\_FIELD\\\_MAP`

ไฟล์ที่โหลด `schema.js` (มีโครงสร้างข้อมูลแบบ sec/sub): **06, 07, 09** เท่านั้น — 05 ใช้ระบบ
checkbox+field ID คงที่ ไม่มี sec/sub ให้ map จึงไม่ต้องโหลด (ตรวจแล้ว ไม่มี dead import ในไฟล์จริง)

`projects.html` **ก็ไม่โหลด `schema.js`** เช่นกัน แม้จะอ่านข้อมูล budget/actual07 ก็ตาม — เพราะเป็นหน้า
read-only ล้วนที่อ่านชื่อคอลัมน์ Sheet แบบแบน (`b.secFuel`, `a7.a\\\_1\\\_1`, `a7.a\\\_venue\\\_meet` ฯลฯ) ตรงๆ
ผ่าน object `CATS` ของตัวเอง ไม่เคยเขียนกลับ Sheet และไม่เคยต้อง map sec/sub → ไม่ dead import เช่นกัน

\---

## 2\. Pattern การย้ายไฟล์เข้า shared js/ (สำหรับอ้างอิงเวลาทำไฟล์ใหม่ในอนาคต)

### 2.1 Head script tags (ลำดับสำคัญ ห้ามสลับ)

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

ไฟล์ที่ **ไม่มี sidebar** (05,06,07,08,09,10): เรียกแค่ `checkAuth()` **ไม่ต้องเรียก** `loadCurrentUser()`
ไฟล์ที่ **มี sidebar** (01, training\_courses\_gfr1, annual-plan, overview, projects): เรียกทั้ง `checkAuth()` และ `loadCurrentUser()`
(หมายเหตุ: `index.html` เป็นหน้า login เอง ไม่โหลด auth.js/checkAuth()/loadCurrentUser() เลย เพราะเป็นปลายทางตอน redirect ไม่ใช่หน้าที่ต้อง guard)

### 2.2 PDF export/upload

Endpoint สร้าง PDF (Puppeteer): ใช้ `APP\\\_CONFIG.PDF\\\_SERVER\\\_URL` (`.../generate-pdf`)
บันทึกไฟล์ผ่าน `saveReportPdf(courseNo, 'pdfXX', blob)` — versioning + เขียนลิงก์กลับ Sheet
คอลัมน์ `pdfXX`/`pdfXXSavedAt` อัตโนมัติในตัว — ห้ามเรียก `updateCourseField`/`updatePdfUrl` ซ้ำเอง

### 2.3 Race condition pattern ที่ต้องเช็คทุกไฟล์ (ดู gotcha 6.6)

ฟังก์ชัน save ทุกตัวต้องเป็น `async function`, ใช้ `await gsApi(...)` ก่อนค่อยตัดสินใจ popup/redirect
**ห้าม** ใช้ `gsApi(...).then(...)` แบบ fire-and-forget ควบคู่กับ `setTimeout(popup, ms)` เดามั่ว —
✅ ทุกไฟล์ (รวม 07 `saveActual07()`) แก้ให้เป็น `async`/`await` ครบแล้ว (ยืนยันด้วย grep ในรอบตรวจสอบล่าสุด)

\---

## 3\. Bug ledger — เจอแล้ว/แก้แล้ว (ยืนยันกับไฟล์จริงล่าสุดแล้วทุกรายการ)

|#|บั๊ก|พบในไฟล์|สถานะ (ยืนยันกับไฟล์จริง)|
|-|-|-|-|
|1|`getAnnualPlan` action ไม่มีใน Code.gs ทำให้ dropdown "ผูกกับแผนงานประจำปี" ว่างเปล่าเงียบๆ|training\_courses\_gfr1 / Code.gs|✅ แก้แล้ว — มี `SH.ANNUAL\\\_PLAN`, `COL\\\_ANNUAL\\\_PLAN`, case handler ใน Code.gs|
|2|`schema.js.getActiveSections()` เช็คแค่ `extHasSpeakers` ไม่เช็ค `extHasAmount` (budget.sec5/sec6)|schema.js|✅ แก้แล้ว — มี param `budget` ตัวที่ 3|
|3|`schema.js` ขาด `SUB.FOOD\\\_LUNCH`/`SUB.FOOD\\\_SNACK`|schema.js|✅ แก้แล้ว|
|4|`schema.js.getActiveSections()` ขาดเช็ค `intHasSpeakers`|schema.js|✅ แก้แล้ว|
|5|`06.buildGs06Payload()` คำนวณ `secIntLodging`/`secIntTravel` ค้างอยู่|06|✅ **แก้แล้ว** (แก้ไปแล้วจริง — ลบออก มีคอมเมนต์ยืนยันในไฟล์ 06 ปัจจุบัน)|
|6|07: `gsApi('saveActual07',...).then()` ไม่ await + `setTimeout(popup,400)` เดามั่ว|07|✅ **แก้แล้วจริง (ยืนยันรอบนี้)** — `saveActual07()` ปัจจุบันเป็น `async function` และมี `await gsApi('saveActual07', gsData07)` ก่อนตัดสินใจ toast/popup จริง (grep: บรรทัด `async function saveActual07(){` และ `const saveResult = await gsApi('saveActual07', gsData07);`) — `showBackConfirmPopup()` ถูกเรียกหลัง await resolve เท่านั้น|
|7|07: `PDF\\\_SERVICE\\\_URL` ใช้ endpoint เก่า `/pdf` + `uploadPdfToSupabase()` ของตัวเอง|07|✅ แก้แล้ว — ยืนยันใช้ `APP\\\_CONFIG.PDF\\\_SERVER\\\_URL` + `saveReportPdf(courseNo,'pdf07',blob)` จริง|
|8|07: มีฟังก์ชัน date ท้องถิ่นซ้ำกับ `date-th.js`|07|✅ แก้แล้ว — `isoTh()`/`isoThRange()` เป็น wrapper เรียก `DateTH.format/formatRange` จริง|
|9|08: `window.\\\_\\\_courseNo08` ไม่เคยถูกตั้งค่า|08|✅ แก้แล้ว — ยืนยัน `window.\\\_\\\_courseNo08 = no08;` มีอยู่จริงใน `DOMContentLoaded`|
|10|05/06/09: อัปโหลด PDF สำเร็จแต่ไม่เขียนลิงก์กลับ Sheet|05,06,09|✅ แก้แล้วทั้ง 3 ไฟล์ — ยืนยันทุกไฟล์ใช้ `saveReportPdf(courseNo,'pdfXX',blob)` แล้ว|
|11|06 refactor (SEC/SUB → SchemaTH) แล้ว แต่ 07 ยังอ่านคีย์เก่า (`by06\\\['1']`,`\\\['2']`,`\\\['3']`,`\\\['4']`) ตรงๆ|06(เขียน)/07(อ่าน)|✅ **แก้แล้วจริง (ยืนยันรอบนี้)** — `applyActuals07()` ปัจจุบันใช้ `by06\[SchemaTH.SEC.FUEL]`, `by06\[SchemaTH.SEC.OFFICE]`, `by06\[SchemaTH.SEC.MISC]`, `by06\[SchemaTH.SEC.LUMP]`, `by06\[SchemaTH.SEC.VENUE]`, `by06\[SchemaTH.SEC.FOOD]`, `by06\[SchemaTH.SEC.STAFF\\\_TRAVEL]`, `by06\[SchemaTH.SEC.EXT]` ครบ (grep ยืนยันบรรทัดจริง) ไม่มี `by06\\\['1']` เหลืออยู่แม้แต่จุดเดียว|
|12|actual06.rowsJson ของคอร์สเก่า (ก่อน 06 refactor) ยังใช้รหัสเก่า — 07 ต้องมี migration shim รองรับด้วย|06,07|✅ **แก้แล้วจริง (ยืนยันรอบนี้)** — พบ `LEGACY\\\_SEC07\\\_MAP`, `LEGACY\\\_SUB07\\\_MAP`, `function migrateLegacyRow07(r)` ในไฟล์จริง และถูกเรียกใช้ทั้งใน `computeBySectionFromRows()`, `applyActuals07()`, และ `\\\_autoLoadGs07()`|
|13|`\\\_autoLoadGs07()` เงื่อนไข `if (sec==='5')` ไม่เคย match แถวไหนเลยเพราะแถววิทยากรภายนอกแท็ก `sec:'ext'`|07|✅ **แก้แล้วจริง (ยืนยันรอบนี้)** — `\\\_autoLoadGs07()` เลิกสร้าง manual `bySection` object แบบคีย์ตัวเลขล้วนไปแล้ว เปลี่ยนไปเรียก `computeBySectionFromRows(rows06)` ตัวเดียวกับที่ `applyActuals07()`/`applySlot07()` ใช้อยู่แทน (grep ยืนยันไม่พบ `sec==='5'`/`bySection\\\['5']`/`by06\\\['1'\|'2'\|'3'\|'4'\\]` เหลืออยู่เลยในไฟล์)|
|14|Popup ปุ่ม "ใช่"/"💾 บันทึก" ใน 05 ลิงก์ไป '01.Main-Reports.html' (จุด) แทน '01\_Main-Reports.html' (ขีดล่าง)|05|✅ แก้แล้ว — ยืนยันไฟล์ 05 ปัจจุบันใช้ underscore ทั้งสองจุด|
|15|Sidebar "ภาพรวม" tab เป็น href="#" (ลิงก์ตาย)|01,training\_courses\_gfr1,annual-plan|✅ แก้แล้ว — ยืนยันชี้ไป `overview.html` ทั้ง 3 ไฟล์|
|16|index.html MAIN\_URL ชี้ไป training\_courses\_gfr1.html หลัง login|index.html|✅ แก้แล้ว — ยืนยัน `MAIN\\\_URL = 'overview.html'`|
|17|overview.html ปุ่มยุบ/ขยาย sidebar ไม่ทำงาน (ไม่มี CSS `.sidebar.collapsed`)|overview.html|✅ แก้แล้ว — ยืนยันมี CSS + `toggleSidebar()` sync กับไฟล์อื่นแล้ว|
|18|08: ทั้งไฟล์ไม่มี auth guard เลยสักบรรทัด (เอกสารก่อนหน้าเคยระบุผิดว่าเสร็จแล้ว)|08|✅ แก้แล้วจริงในรอบที่ผ่านมา — ยืนยัน config.js/auth.js/checkAuth() + saveReportPdf ครบถ้วนในไฟล์ปัจจุบัน|
|19|09: `SEC\\\_OPTS`/`getActiveSections`/`computeMajorNumbers` ก็อปวางซ้ำจาก 06 เวอร์ชันก่อน refactor (รหัสเก่า)|09|✅ แก้แล้ว — ยืนยันเป็น alias ของ `SchemaTH.\\\*` ครบ พร้อม `LEGACY\\\_SEC09\\\_MAP`/`migrateLegacyRow09()`|
|20|09: `toISODate()` ใช้ local timezone Date methods แทน UTC|09|✅ แก้แล้ว — ยืนยัน `toISODate`/`fmtDate`/`fmtDateRange` เป็น wrapper เรียก `DateTH.\\\*` ทั้งหมด|
|21|07: มี loader overlay ท้องถิ่น (`\\\_showLoader07`ฯลฯ) ก็อปวางซ้ำทั้งที่โหลด js/gas-api.js อยู่แล้ว|07|✅ แก้แล้ว — ยืนยันไม่พบฟังก์ชันท้องถิ่นเหล่านี้ในไฟล์ปัจจุบัน ใช้ `showGsLoader/hideGsLoader/showGsStatus` จาก shared แทนครบ 9 จุด|
|22|07: `showBackConfirmPopup()` และ `confirmBack07()` เขียน `location.href='01.Main-Reports.html'` (จุด) แทนที่จะเป็น `01\\\_Main-Reports.html` (ขีดล่าง) — คลิกปุ่ม "กลับหน้าหลัก"/"ไม่บันทึก" แล้วเจอ 404 เพราะไฟล์จริงชื่อ `01\\\_Main-Reports.html`|07|⚠️ **พบใหม่ในรอบนี้ ยังไม่ได้แก้** — grep `Main-Reports` ในไฟล์ 07 เจอ 2 จุด (บรรทัด `location.href='01.Main-Reports.html'` ในทั้งสองฟังก์ชัน) ไม่มีจุดไหนในไฟล์ใช้ underscore เลย บั๊กแบบเดียวกับ ledger #14 ที่เคยแก้ในไฟล์ 05 แต่ไม่เคยถูกแก้ในไฟล์ 07 — ดูหัวข้อ 4.1 ใหม่|
|23|06: การกรอกรายการบิลไม่เรียงตามหมวด ก. (เช่น กรอกหมวด 4-5 ก่อนหมวด 1-3) ทำให้ตารางรายงาน/PDF ขึ้นหมวดไม่เรียงลำดับ ก.1→ก.x เพราะ `sumBuildDoc()` เดินตามลำดับ DOM ของการ์ดที่กรอกจริง ไม่ sort ตาม `DYNAMIC\\\_SEC\\\_ORDER`|06|✅ **แก้แล้ว (รอบนี้)** — เพิ่มปุ่ม ▲▼ ในการ์ดแต่ละใบของหน้ากรอกบิล (`sumMoveRow(id,dir)`) ให้ผู้ใช้สลับตำแหน่ง DOM จริงเองก่อนบันทึก แทนการ auto-sort (ดูเหตุผลที่หัวข้อ 4.3) พร้อมลบฟีเจอร์ checkbox "รวมลำดับกับรายการก่อนหน้า" (`.sum-merge-label`/`\\\_merge`/`row.merge`/`isMerged`) ออกทั้งหมด เพราะความหมาย "รายการก่อนหน้า" จะเปลี่ยนทุกครั้งที่สลับลำดับ ทำให้ merge state ผิดเพี้ยนได้ง่าย|
|24|05: ข้อ ข. (ค่าใช้จ่ายในการเดินทางของผู้เข้ารับการฝึกอบรม) ไม่มี checkbox ควบคุมเลย ทั้งที่ไฟล์ 07 (`applySlot07()`) เขียนโค้ดรองรับ `TOGGLES07.kor = t.kor !== false` ไว้แล้วล่วงหน้า (อ่านจาก `budget.spkJson.toggles.kor`) แต่ 05 ไม่เคยส่งค่านี้มาจริง ทำให้ 05 บังคับแสดงข้อ ข. เต็มหมวดตลอดเวลา ไม่ว่าหลักสูตรนั้นจะมีค่าใช้จ่ายผู้เข้าอบรมหรือไม่|05|✅ แก้แล้ว — เพิ่ม checkbox `chk\_kor` ที่หัวข้อ ข. (ค่าเริ่มต้นติ๊กไว้เสมอ ตามข้อกำหนดเดิม) ผูกเข้า `onCondChange()`/`hasKor()` ควบคุมการแสดง/ซ่อนฟิลด์กรอกในฟอร์ม และผูกเข้า `buildTable()`/`computeBudget()` ให้ตัดทั้งหมวด ข. (หัวข้อ/รายการย่อย/ยอดรวมข้อ ข./แถว "รวม ก.และข.") ออกจากตารางรายงานทั้งหมดเมื่อปิดไว้ — ถ้าปิด แถว "รวม ก." จะกลายเป็นแถวปิดท้ายตาราง (double-bottom) แทน ล้อ pattern เดียวกับที่ 07 เตรียมรองรับไว้แล้ว พร้อมบันทึกค่า `toggles.kor` ลง `spkJson` และ restore ค่ากลับตอนโหลดข้อมูลเก่า (fallback เป็น `true` ถ้าไม่เคยมีค่าเก็บไว้ กันหลักสูตรเก่าที่บันทึกไว้ก่อนมี checkbox นี้เสียหาย)|
|25|05: มีข้อความ/ตัวเลขตัวอย่าง (sample/demo data) ค้างอยู่ใน HTML ต้นฉบับของบล็อก "ข้อมูลหลักสูตร" — ชื่อหลักสูตร "ความปลอดภัยในการทำงานเกี่ยวกับสารเคมีอันตราย และการตอบโต้กรณีเกิดเหตุฉุกเฉิน", รุ่นที่ "1-3/69", เลขที่หลักสูตร "01320829", วันที่ "26 พฤษภาคม 2569", สถานที่ "...ชัยนาท" รวมถึง "..." ท้าย `<title>` หน้า — ทำให้หลักสูตรใหม่ที่ยังไม่โหลดข้อมูลจริงเห็นข้อมูลตัวอย่างเหล่านี้ค้างอยู่ในฟอร์ม|05|✅ แก้แล้ว — เคลียร์ค่า `value` ของทั้ง 5 ช่องเป็นค่าว่างทั้งหมด และตัด "..." ออกจาก `<title>`|



## 4\. งานที่เหลือ

### 4.1 `projects.html` — ไฟล์ใหม่ที่เพิ่งเพิ่มเป็นแท็บ "โครงการ" ใน sidebar

หน้า read-only ล้วน ไม่มีการเขียนกลับ Sheet เลยสักฟังก์ชันเดียว — โครงสร้างตรงตาม pattern เดียวกับ
`overview.html`/`annual-plan.html`:

* โหลด shared js/ ครบ (`config.js` → supabase SDK → `auth.js` → `date-th.js` → `gas-api.js`) พร้อม
`checkAuth()` และ `loadCurrentUser()` (มี sidebar จริง) — **ไม่โหลด `schema.js`** เพราะไม่เคย map sec/sub
เอง อ่านชื่อคอลัมน์ Sheet แบบแบนตรงๆ ผ่าน object `CATS` ของตัวเอง (ดูหัวข้อ 1 ท้ายตารางไฟล์)
* ดึงข้อมูลด้วย `gsApi('getAll')` ครั้งเดียว (ดึงทั้ง courses/budget/actual06/actual07 พร้อมกัน) แล้ว
index ด้วย `no` เอง — ไม่ยิง `getByNo` ซ้ำทีละหลักสูตรเหมือนไฟล์อื่น
* ตรรกะ "แสดงเฉพาะหลักสูตรที่เริ่มจัดแล้ว" ใช้ `DateTH.normalize()`/เทียบ `Date` ตรงๆ (ไม่ได้เขียน parser
วันที่ใหม่เอง) — สอดคล้องกับ gotcha 6.5
* ใช้ `actualGrand`/`a7.grandTotal` (ไม่ใช่ `actual06.grandTotal`) เป็น "ใช้จริงทั้งหมด" ถูกต้องตาม
gotcha 6.1 แล้ว (`renderDetailKPI()` มี fallback ไป `a6.grandTotal` เฉพาะกรณียังไม่มี `actual07` เท่านั้น)

ยังไม่พบบั๊กในไฟล์นี้จากการตรวจเบื้องต้น (ตรวจแบบอ่านโค้ด ยังไม่ได้ตรวจลึกเท่าไฟล์อื่นในโปรเจกต์ —
ควรตรวจซ้ำอีกรอบด้วย grep/`node --check` แบบเดียวกับที่ทำกับไฟล์ 07 ถ้าจะเริ่มแก้ไขไฟล์นี้ต่อ)

**สรุป**: งานที่เหลือทั้งโปรเจกต์ตอนนี้มีแค่ ledger #22 (บั๊กลิงก์เล็กจุดเดียวในไฟล์ 07) เท่านั้น

### 4.2 `06\\\_Sum-Training-Expenses.html` — ปุ่มเลื่อนลำดับรายการบิล ▲▼ (แทนที่ checkbox "รวมลำดับ")

**ปัญหาเดิม**: หน้ากรอกบิล (`sumAddRow()`) ให้ผู้ใช้กด "+ เพิ่มรายการ" กรอกไปเรื่อยๆ ตามลำดับที่สะดวก
(เช่น ตามใบเสร็จที่หยิบมาได้ ไม่ได้เรียงตามหมวด ก.) แต่ `sumBuildDoc()` (ฟังก์ชันสร้างตารางรายงาน/PDF)
เดินตามลำดับ DOM ของการ์ดตรงๆ ไม่ได้ sort ตาม `SchemaTH.DYNAMIC\\\_SEC\\\_ORDER` เหมือนไฟล์ 07/09
(ที่มี `secOrderIdx()` sort ก่อน build) ผลคือถ้าคีย์หมวด 4-5 ก่อนหมวด 1-3 ตารางที่ออกมาจะขึ้นหมวด
4-5 ก่อน 1-3 ตามไปด้วย ทั้งที่กติกาบัญชีต้องเรียง ก.1→ก.x เสมอ

**ทางเลือกที่พิจารณาแล้วไม่เลือก**: auto-sort ตาม `DYNAMIC\\\_SEC\\\_ORDER` ตอน build ตาราง (แบบเดียวกับ
07/09) — ถูกตัดออกเพราะ `sumCollectState()` (ใช้ตอนบันทึกลง Sheet) กับ `sumBuildDoc()` (ใช้ตอนดู
ตัวอย่าง/PDF) ต่างก็อ่านลำดับ DOM ของ `#sm\_rows` เป็นความจริงเดียวกัน ถ้า sort แยกกันคนละจุด จะทำให้
ลำดับที่ "บันทึกลง `rowsJson`" กับ "ลำดับที่แสดงในตาราง" ไม่ตรงกัน แล้วพอเปิดคอร์สเก่ากลับมาแก้ไข
(`restoreRowsFromGs()`) การ์ดจะโผล่มาคนละลำดับกับตอนดูรายงานครั้งก่อน

**ทางที่เลือกทำจริง**: ให้ผู้ใช้กดปุ่ม ▲▼ สลับตำแหน่ง **DOM node จริง** ของการ์ดในหน้ากรอกบิลเอง
ก่อนกดบันทึก — วิธีนี้ทำให้ DOM order เป็นความจริงหนึ่งเดียวที่ทุกจุดอ่านตรงกันเสมอ (renumber, save,
build ตาราง, restore) ไม่มีจุดไหนหลุด sync:

* **`sumMoveRow(id, dir)`** (ใหม่) — `dir=-1` เลื่อนขึ้น (`insertBefore(card, prevSibling)`),
`dir=1` เลื่อนลง (`insertBefore(nextSibling, card)`) แล้วเรียก `sumRenumber()` + `sumCalc()` ทันที
* **`sumRenumber()`** — ตัดโค้ด merge ทั้งหมดออก เหลือแค่ใส่เลขลำดับ `รายการที่ N` ตาม index จริง
และ disable ปุ่ม ▲ ของการ์ดแรกสุด / ปุ่ม ▼ ของการ์ดสุดท้าย กันสลับเกินขอบ
* ปุ่ม ▲▼ อยู่ใน `.sum-row-top` ของแต่ละการ์ด (id `${id}\_up` / `${id}\_down`), CSS ใหม่คือ
`.sum-order-btns`/`.sum-order-btn`

**ลบฟีเจอร์ checkbox "รวมลำดับกับรายการก่อนหน้า" ออกทั้งหมด** (เหตุผล: ความหมาย "รายการก่อนหน้า"
จะเปลี่ยนไปทันทีที่สลับลำดับด้วยปุ่ม ▲▼ ทำให้ merge state ผิดเพี้ยนได้ง่ายเมื่อผู้ใช้ทั้งสลับลำดับ
และติ๊ก merge พร้อมกัน) — จุดที่ถูกลบ: `.sum-merge-label` (CSS), `${id}\\\_merge` checkbox (HTML
template ใน `sumAddRow()`), logic คำนวณ `isMerged`/`displaySeq` ใน `sumRenumber()`, `row.merge`
ใน `sumCollectState()`, `isMerged`/`seq` logic ใน `sumBuildDoc()` (ตอนนี้ `seq++` ทุกแถวตรงๆ ไม่มี
merge อีกต่อไป), และการ restore `r.merge` ใน `restoreRowsFromGs()`

**พฤติกรรมที่ต้องรู้**:

* การสลับลำดับ **ไม่ auto-save** — ต้องกด "บันทึกแบบร่าง" (`sumSave()`) เองเสมอ เหมือนแก้ตัวเลข
ในบิลแล้วไม่กดบันทึก ถ้าปิดหน้า/รีเฟรชโดยไม่บันทึก ลำดับที่สลับไว้จะหายไป
* ลำดับที่บันทึกไว้ล่าสุด (ผ่าน `rowsJson`) จะเป็นลำดับที่การ์ดโผล่มาตอนเปิดไฟล์กลับเข้ามาแก้ไข
ครั้งถัดไปเป๊ะ (`restoreRowsFromGs()` สร้างการ์ดตามลำดับ array ที่เก็บไว้)
* คอร์สเก่าที่เคยบันทึก `row.merge:true` ไว้ก่อนรอบแก้นี้ จะไม่มีผลอะไรอีกต่อไปตอนโหลดกลับมา (field
ถูก ignore เฉยๆ ไม่ error) แต่ยอดเงินรวม/ลำดับหมวดในตารางจะคำนวณใหม่ตามลำดับ DOM ปกติ ไม่กระทบ
ความถูกต้องของยอดเงิน กระทบแค่ไม่มี merge visual (แถบสีส้ม) อีกต่อไปเท่านั้น

\---

## 5\. Domain business rules ที่ต้องรู้ก่อนแก้โค้ด (สำคัญ — พลาดแล้วงบจะเพี้ยน)

1. **ค่าเดินทาง/ที่พักวิทยากรภายใน + ค่าเดินทางประธานในพิธี** = เงินโอนให้หน่วยงานต้นสังกัดโดยตรง → **อนุมัติ = ใช้จริงเสมอ** ไม่ต้องผ่านใบเสร็จในไฟล์ 06 (คีย์ไว้ตั้งแต่ไฟล์ 05 แล้ว re-use ไปที่ 07 ตรงๆ) — เหตุผลที่ `SUB\\\_OPTS\\\['int']` เหลือแค่ `INT\\\_HONORARIUM` ตัวเดียว
2. **แผน (planned)** มาจากตาราง annual-plan (ส่วนกลางกำหนดตอนต้นปี, คีย์ `planId`) — **อนุมัติ (approved)** มาจาก `budget.budgetTotal` ที่ผู้ใช้คีย์เองตอนจัดอบรม (ชีต `budget`) — **ใช้จริง (actual)** มาจาก `actual07.grandTotal` (fallback `actual06.grandTotal`) — 3 ค่านี้อยู่คนละชีตกัน คนละเวลากรอก
3. **Join key ระหว่างแผนกับผลจริง**: ต้องผ่าน `courses.planId` (ไม่ใช่ `courseNum` เดี่ยวๆ เพราะเลขอาจไม่ตรงกันข้ามปี) → 1 `planId` อาจมีหลาย `no` (รุ่น) ต้อง sum ข้ามรุ่นเอง (ดู `getPlanSummary()` ใน Code.gs ที่ทำ join+sum นี้ให้แล้ว)
4. **field name ระดับ Google Sheet column ไม่เปลี่ยนเวลารีแฟกเตอร์** (`sec3\\\_1`, `a\\\_in\\\_1` ฯลฯ ยังคงเดิม) — เปลี่ยนแค่ชั้น JS abstraction (`SchemaTH.SEC`/`SUB`) เท่านั้น

\---

## 6\. Known gotchas — cross-file

### 6.1 `actual06.grandTotal` vs `actual07.grandTotal` คนละความหมาย ห้ามใช้สลับกัน

* `actual06.grandTotal` = เฉพาะ "ก. เงินยืมทดลองจ่าย" ตาม `LOAN\\\_SECTIONS`
* `actual07.grandTotal` = ยอดรวมทั้งหมดจริง (ก.+ข. รวม INT/ประธาน)
* ใช้ `actualGrand`/`actualGorTotal` (จาก a07) เป็น "ใช้จริงทั้งหมด" เสมอ ห้ามใช้ `actualGorLoan`

### 6.2 `getPlanSummary()` นับเฉพาะ course ที่มี `planId` ผูกไว้ ที่เหลือหายเงียบ

รุ่น/หลักสูตรที่ไม่ผูก planId จะไม่ถูกนับในยอดอนุมัติ/ใช้จริงของแผนใดเลย ไม่มี error — มี soft warning
(`#unlinkedNote`) ใน overview.html แล้ว

### 6.3 `COL\\\_\\\*` array ใน Code.gs ไม่ใช่ schema validation จริง

แก้ header ใน Sheet ทุกครั้งต้องอัปเดต `COL\\\_\\\*` ใน Code.gs คู่กันเสมอด้วยตนเอง ไม่มี validation อัตโนมัติ

### 6.4 Type coercion ของตัวเลข/ปีจาก Google Sheets

ทุกฟิลด์ตัวเลขจาก Sheet ต้อง parseInt/parseFloat ก่อนใช้ comparison หรือคำนวณเสมอ

### 6.5 วันที่ timezone UTC+7 ต้องผ่าน `DateTH.normalize()` เท่านั้น ห้ามเขียน parser ใหม่

ทุกไฟล์ migrate ครบแล้ว (ยืนยันแล้วทั้ง 05–10) — อย่าย้อนกลับไปเขียน local Date parser ใหม่ในไฟล์ในอนาคต

### 6.6 Race condition pattern: `.then()` ไม่ await ก่อน redirect/popup

ทุกฟังก์ชัน save ต้องเป็น `async` + `await gsApi(...)` — ✅ ยืนยันแล้วว่าทุกไฟล์ (รวม `saveActual07()`
ในไฟล์ 07) แก้ตาม pattern นี้ครบแล้ว ไม่มีไฟล์ไหนเหลือ `.then()` แบบ fire-and-forget คู่กับ
`setTimeout(popup, ms)` อีกต่อไป

### 6.7 (รวมเข้ากับ ledger ในหัวข้อ 3 แล้ว — ไม่มีเนื้อหาเพิ่มเติม)

### 6.8 ทุกไฟล์ที่เรียก gsApi() ต้องใช้ showGsLoader()/hideGsLoader() overlay กลาง

ยืนยันแล้วว่าทุกไฟล์ (รวม annual-plan.html, 10\_PDF-Overview.html, projects.html) ใช้ pattern นี้ครบแล้ว
ไม่มีไฟล์ไหนใช้ข้อความ inline ("กำลังโหลด...") แบบ text-only อีกต่อไป

### 6.9 ตัวเลขหลักล้านบาทที่ย่อ ("x ลบ.") ต้องแสดงทศนิยม 3 ตำแหน่งเสมอ

`(n/1e6).toFixed(3)+' ลบ.'` — ยืนยันแล้วว่า overview.html และ annual-plan.html ใช้ตรงกัน

### 6.10 ชื่อไฟล์เป็น underscore เสมอ (เช่น `01\\\_Main-Reports.html`)

⚠️ **แก้ไขจากที่เคยระบุผิด**: ไฟล์ 07 (`showBackConfirmPopup()`, `confirmBack07()`) ยังมี
`location.href='01.Main-Reports.html'` (จุด) หลงเหลืออยู่ 2 จุด — **ไม่ใช่ทุกไฟล์ underscore ครบหมดแล้ว**
อย่างที่เคยเขียนไว้ ดู ledger #22 และหัวข้อ 4.1 — ไฟล์อื่นที่เหลือ (05,06,08,09,10) ยืนยันแล้วว่า
underscore ถูกต้องครบทุกจุด

### 6.11 overview.html sidebar ใช้ชื่อ class ต่างจากไฟล์อื่น (cosmetic — ยังไม่แก้ ไม่กระทบการทำงาน)

`.side-nav`/`.side-nav-label`/`.side-user` แทน `.nav`/`.nav-label`/`.user` — ทำงานถูกต้องเพราะมี CSS
ของตัวเอง แต่ทำให้ refactor CSS sidebar ให้ใช้ไฟล์เดียวร่วมกันไม่ได้จนกว่าจะ rename class ก่อน
---

