// ============================================================
//  TMS_TrainingData — Google Apps Script (Web API)
//  Spreadsheet ID: 1huHgY3tWOdzWV3i0-rkseZbMGGsup-FhcEuDS8L0mLc
// ============================================================

const SPREADSHEET_ID = '1huHgY3tWOdzWV3i0-rkseZbMGGsup-FhcEuDS8L0mLc';
const SS = SpreadsheetApp.openById(SPREADSHEET_ID);

// ── Sheet names ──────────────────────────────────────────────
const SH = {
  COURSES     : 'courses',
  BUDGET      : 'budget',
  ACTUAL06    : 'actual06',
  ACTUAL07    : 'actual07',
  VENDORS     : 'vendors',
  ANNUAL_PLAN : 'annual_plan',   // ← เพิ่มใหม่ (งาน D — แผนงานประจำปี, read-only จากฝั่งเว็บ)
};

// ── Column definitions ────────────────────────────────────────
const COL_COURSES = [
  'no','course','batch','courseNum','year','planId',   // ← เพิ่ม 'planId' (ผูกรุ่นนี้กับแผนงานประจำปี)
  'dateStart','dateEnd','location',
  'pdf05','pdf05SavedAt',
  'pdf06','pdf06SavedAt',
  'pdf07','pdf07SavedAt',
  'pdf08','pdf08SavedAt',
  'pdf09','pdf09SavedAt',
  'savedAt'
];

const COL_BUDGET = [
  'no',
  'secFuel',
  's11','s12','sec1',
  's21','sec2',
  'secLump','lRate','lVeh','lDays',
  'secVenue','secVenueMeeting','secVenueVip','secVenueStaff',
  's31','s32','s33','sec3',
  'r31','p31','m31','d31',
  'r32','p32','m32','d32',
  'sD','rD','pD','mD','dD',
  's41','s42','s43','sec4',
  'sec5','sec6','secInternal',
  'secPres','pres1','pres2','pres3',
  'gorTotal',
  'bb1','bb2','bb3','korTotal',
  'budgetTotal',
  'grandTotal',
  'in_allowance',
  'in_lodging',
  'in_travel',
  'in_payroll',
  'spkJson',
  'savedAt'
];

const COL_ACTUAL06 = [
  'no',
  'secFuel',
  'sec1','sec1_1','sec1_2','sec2',
  'secLump',
  'secVenue','secVenueMeeting','secVenueVip','secVenueStaff',
  'sec3_1','sec3_2','sec3Dinner','sec3_3','sec3',
  'sec4_1','sec4_2','sec4_3','sec4',
  'secExtHonor','secExtLodging','secExtTravel','secExt','sec5',
  'secIntHonor','secInt',   // ← เพิ่มใหม่ (งาน A.3 — ค่าสมนาคุณวิทยากรภายในที่ยังต้องผ่านไฟล์ 06)
  'grandTotal',
  'totalVal','totalVat','totalWht',
  'rowsJson',
  'savedAt'
];

const COL_ACTUAL07 = [
  'no',
  'a_fuel',
  'a_1_1','a_1_2',
  'a_2_1',
  'a_lump',
  'a_venue_meet','a_venue_vip','a_venue_staff',
  'a_3_1','a_food_dinner','a_3_2','a_3_3',
  'a_4_1','a_4_2','a_4_3',
  'a_b1','a_b2','a_b3',
  'a_in_1','a_in_2','a_in_3','a_in_payroll',
  'a_pres_1','a_pres_2','a_pres_3',
  'trainees_approved','trainees_actual',
  'spkActualJson',
  'grandTotal',
  'refund',
  'savedAt'
];

const COL_VENDORS = [
  'label',
  'name',
  'branch',
  'taxid',
  'addr1',
  'tambon',
  'amphoe',
  'province',
  'zip',
  'useCount',
  'updatedAt',
  'category'
];

// ── annual_plan — admin กรอกเองผ่าน Google Sheets โดยตรง เว็บอ่านอย่างเดียว (read-only) ──
const COL_ANNUAL_PLAN = [
  'planId','year','program','section','name','type','target','people',
  'form','quarter','times','days','operation','travel','plan','note','savedAt'
];

// ============================================================
//  ENTRY POINTS
// ============================================================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    let p = e.parameter || {};
    
    if (e.postData && e.postData.contents) {
      try {
        const bodyData = JSON.parse(e.postData.contents);
        p = Object.assign({}, p, bodyData);
      } catch (err) {}
    }

    const action = p.action || '';
    let result;

    const parseData = () => {
      if (typeof p.data === 'object') return p.data;
      if (typeof p.data === 'string') return JSON.parse(p.data);
      return p;
    };

    switch (action) {
      case 'saveCourse':
      case 'updateCourseField':
        result = upsertRow(SH.COURSES, COL_COURSES, parseData());
        break;

      case 'saveBudget':
        result = upsertRow(SH.BUDGET, COL_BUDGET, parseData());
        break;

      case 'saveActual06':
        result = upsertRow(SH.ACTUAL06, COL_ACTUAL06, parseData());
        break;

      case 'saveActual07':
      case 'updateActual07Field':
        result = upsertRow(SH.ACTUAL07, COL_ACTUAL07, parseData());
        break;

      case 'updatePdfUrl':
        const pdfData = parseData();
        const targetSheet = pdfData.sheetName || SH.COURSES;
        let targetCols = COL_COURSES;
        if (targetSheet === SH.BUDGET) targetCols = COL_BUDGET;
        else if (targetSheet === SH.ACTUAL06) targetCols = COL_ACTUAL06;
        else if (targetSheet === SH.ACTUAL07) targetCols = COL_ACTUAL07;

        result = upsertRow(targetSheet, targetCols, pdfData);
        break;

      case 'getVendors':
        result = getAllRows(SH.VENDORS, COL_VENDORS);
        break;

      case 'saveVendor':
        result = upsertVendor(parseData());
        break;

      case 'getAll':
        result = {
          courses  : getAllRows(SH.COURSES,   COL_COURSES),
          budget   : getAllRows(SH.BUDGET,    COL_BUDGET),
          actual06 : getAllRows(SH.ACTUAL06,  COL_ACTUAL06),
          actual07 : getAllRows(SH.ACTUAL07,  COL_ACTUAL07),
        };
        break;

      case 'getCourses':
        result = { courses: getAllRows(SH.COURSES, COL_COURSES) };
        break;

      // ── งาน D: แผนงานประจำปี (read-only) ──────────────────────
      case 'getAnnualPlan':
        result = getAllRows(SH.ANNUAL_PLAN, COL_ANNUAL_PLAN);
        break;

      case 'getPlanSummary':
        result = getPlanSummary();
        break;
      // ──────────────────────────────────────────────────────────

      case 'getByNo':
        const no = p.no || (p.data ? JSON.parse(p.data).no : '');
        result = {
          course   : getRowByNo(SH.COURSES,   COL_COURSES,   no),
          budget   : getRowByNo(SH.BUDGET,    COL_BUDGET,    no),
          actual06 : getRowByNo(SH.ACTUAL06,  COL_ACTUAL06,  no),
          actual07 : getRowByNo(SH.ACTUAL07,  COL_ACTUAL07,  no),
        };
        break;

      case 'deleteCourse':
        const delNo = p.no || (p.data ? JSON.parse(p.data).no : '');
        deleteRowByNo(SH.COURSES,   delNo);
        deleteRowByNo(SH.BUDGET,    delNo);
        deleteRowByNo(SH.ACTUAL06,  delNo);
        deleteRowByNo(SH.ACTUAL07,  delNo);
        result = { deleted: delNo };
        break;

      case 'login':
        result = checkLogin(p.user, p.pass);
        break;

      // 📌 วางตรงนี้ได้เลยครับ (ก่อนหน้า default)
      case 'debugPdf':
        const rawData = p.data ? JSON.parse(p.data) : {};
        const testSheetName = rawData.sheetName || SH.COURSES;
        const testSheet = SS.getSheetByName(testSheetName);
        
        if (!testSheet) {
          result = { error: 'ไม่พบ Sheet ชื่อ: ' + testSheetName };
          break;
        }

        const sheetHeaders = testSheet.getRange(1, 1, 1, testSheet.getLastColumn())
                                     .getValues()[0]
                                     .map(h => String(h).trim());

        result = {
          receivedData: rawData,             // ข้อมูลที่ส่งมาจากหน้าเว็บ
          targetSheet: testSheetName,        // Sheet ที่กำลังจะบันทึก
          headersInSheet: sheetHeaders,      // คอลัมน์ที่มีอยู่จริงใน Sheet แถวที่ 1
          hasNoColumn: sheetHeaders.includes('no'),
          hasPdf08Column: sheetHeaders.includes('pdf08'),
          hasPdf08SavedAtColumn: sheetHeaders.includes('pdf08SavedAt')
        };
        break;

      default:
        result = { error: 'Unknown or missing action: ' + action };
    }

    return jsonResponse({ ok: true, data: result });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ============================================================
//  CORE HELPERS
// ============================================================

/**
 * ฟังก์ชันเพิ่มหรือแก้ไขข้อมูลแถวใน Sheet
 * ✅ อัปเดตเฉพาะ Field ที่ตรงกับ Header เดิมที่มีอยู่ใน Sheet เท่านั้น
 */
function upsertRow(sheetName, cols, data) {
  const sheet   = getSheet(sheetName);
  let   no      = String(data.no || '').trim();
  if (!no) throw new Error('no (เลขที่หลักสูตร) ว่างเปล่า — ไม่บันทึก');

  const allValues = sheet.getDataRange().getValues();
  const headers   = allValues[0].map(h => String(h).trim());
  const noColIdx  = headers.indexOf('no');
  if (noColIdx < 0) throw new Error('ไม่พบคอลัมน์ "no" ใน Sheet: ' + sheetName);

  const tz = SS.getSpreadsheetTimeZone() || 'Asia/Bangkok';

  const formatVal = (v, headerName) => {
    if (v === null) return '';
    if (v instanceof Date) {
      return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
    }
    if (typeof v === 'string' && (headerName === 'dateStart' || headerName === 'dateEnd')) {
      if (v.includes('T')) {
        const d = new Date(v);
        if (!isNaN(d.getTime())) {
          return Utilities.formatDate(d, tz, 'yyyy-MM-dd');
        }
      }
    }
    if (typeof v === 'object') return JSON.stringify(v);
    if (headerName === 'no') return "'" + String(v);
    return v;
  };

  // 1. ตรวจสอบว่ามีข้อมูลเดิมอยู่แล้วหรือไม่ (Update)
  for (let i = 1; i < allValues.length; i++) {
    if (String(allValues[i][noColIdx]).trim() === no) {
      const existingRow = allValues[i];

      const updatedRow = headers.map((h, colIdx) => {
        if (data[h] === undefined) {
          return existingRow[colIdx] !== undefined ? existingRow[colIdx] : '';
        }
        return formatVal(data[h], h);
      });

      sheet.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
      return { action: 'updated', no, row: i + 1 };
    }
  }

  // 2. ถ้ายังไม่มี ให้สร้างแถวใหม่ (Insert/Append)
  const newRow = headers.map(h => {
    const v = data[h];
    if (v === undefined) return '';
    return formatVal(v, h);
  });

  sheet.appendRow(newRow);
  return { action: 'inserted', no };
}

function upsertVendor(data) {
  const sheet = getSheet(SH.VENDORS);
  const label = String(data.label || '').trim();
  if (!label) throw new Error('label (ชื่อเรียกร้าน/ที่อยู่) ว่างเปล่า — ไม่บันทึก');

  const allValues = sheet.getDataRange().getValues();
  const headers   = allValues[0].map(h => String(h).trim());
  const labelIdx  = headers.indexOf('label');
  const useCntIdx = headers.indexOf('useCount');
  if (labelIdx < 0) throw new Error('ไม่พบคอลัมน์ "label" ใน Sheet: ' + SH.VENDORS);

  const normLabel = label.toLowerCase();
  const now = new Date().toISOString();

  for (let i = 1; i < allValues.length; i++) {
    if (String(allValues[i][labelIdx]).trim().toLowerCase() === normLabel) {
      const prevUseCount = Number(allValues[i][useCntIdx]) || 0;
      const row = headers.map((h, idx) => {
        if (h === 'useCount') return prevUseCount + 1;
        if (h === 'updatedAt') return now;
        if (h === 'label') return allValues[i][labelIdx];
        const v = data[h];
        return (v !== undefined && v !== '') ? v : allValues[i][idx];
      });
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { action: 'updated', label };
    }
  }

  const newRow = headers.map(h => {
    if (h === 'useCount') return 1;
    if (h === 'updatedAt') return now;
    const v = data[h];
    return v !== undefined ? v : '';
  });
  sheet.appendRow(newRow);
  return { action: 'inserted', label };
}

function formatCellValue(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, SS.getSpreadsheetTimeZone() || 'Asia/Bangkok', 'yyyy-MM-dd');
  }
  if (typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))) {
    try { return JSON.parse(v); } catch (e) { return v; }
  }
  return v;
}

function getAllRows(sheetName, cols) {
  const sheet  = getSheet(sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0].map(h => String(h).trim());
  return values.slice(1)
    .filter(row => String(row[0]).trim() !== '')
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = formatCellValue(row[i] !== undefined ? row[i] : '');
      });
      return obj;
    });
}

function getRowByNo(sheetName, cols, no) {
  const sheet   = getSheet(sheetName);
  const values  = sheet.getDataRange().getValues();
  const headers = values[0].map(h => String(h).trim());
  const noIdx   = headers.indexOf('no');
  if (noIdx < 0) return null;

  const noStr     = String(no).trim();
  const noNumeric = String(Number(noStr));

  for (let i = 1; i < values.length; i++) {
    const cellStr = String(values[i][noIdx]).trim();
    if (cellStr === noStr || String(Number(cellStr)) === noNumeric) {
      const obj = {};
      headers.forEach((h, i2) => {
        obj[h] = formatCellValue(values[i][i2] !== undefined ? values[i][i2] : '');
      });
      return obj;
    }
  }
  return null;
}

function deleteRowByNo(sheetName, no) {
  const sheet  = getSheet(sheetName);
  const values = sheet.getDataRange().getValues();
  const targetNo = String(no).trim();
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][0]).trim() === targetNo) {
      sheet.deleteRow(i + 1);
    }
  }
}

/**
 * getPlanSummary — สรุปยอด "อนุมัติ" (budget) และ "ใช้จริง" (actual06/actual07)
 * รวมข้าม "รุ่น" (no) ทั้งหมดที่ผูกกับ planId เดียวกัน คืนเป็น object เดียว keyed ด้วย planId
 * ให้หน้า overview ดึงข้อมูลทั้งปีงบได้ในคำขอเดียว ไม่ต้องยิง getByNo ทีละรุ่น
 *
 * ⚠️ budget.gorTotal ในชีตหมายถึง "ก. เฉพาะเงินยืม" เท่านั้น (ไม่รวมวิทยากรภายใน/ประธานในพิธี)
 * ก. รวมทั้งหมดจริงๆ ต้องคำนวณจาก grandTotal - korTotal แทน (ดู comment ในไฟล์ 05)
 */
function getPlanSummary() {
  const courses  = getAllRows(SH.COURSES,  COL_COURSES);
  const budgets  = getAllRows(SH.BUDGET,   COL_BUDGET);
  const actual06 = getAllRows(SH.ACTUAL06, COL_ACTUAL06);
  const actual07 = getAllRows(SH.ACTUAL07, COL_ACTUAL07);

  // 1) จับคู่ no -> planId จากชีต courses (เฉพาะแถวที่มี planId กรอกไว้แล้ว)
  const noToPlanId = {};
  courses.forEach(c => {
    const no = String(c.no || '').trim();
    const planId = String(c.planId || '').trim();
    if (no && planId) noToPlanId[no] = planId;
  });

  // 2) ทำ index no -> row ของแต่ละชีต (อ่านครั้งเดียว ไม่ loop ซ้อน)
  const budgetByNo = {};
  budgets.forEach(b => { const no = String(b.no||'').trim(); if (no) budgetByNo[no] = b; });
  const actual06ByNo = {};
  actual06.forEach(a => { const no = String(a.no||'').trim(); if (no) actual06ByNo[no] = a; });
  const actual07ByNo = {};
  actual07.forEach(a => { const no = String(a.no||'').trim(); if (no) actual07ByNo[no] = a; });

  // 3) รวมยอดของทุก no ที่ผูกกับ planId เดียวกัน
  const summary = {};
  Object.keys(noToPlanId).forEach(no => {
    const planId = noToPlanId[no];
    if (!summary[planId]) {
      summary[planId] = {
        planId,
        runsTotal: 0, runsDone: 0,
        approvedGorLoan: 0, approvedGorTotal: 0, approvedKor: 0, approvedGrand: 0,
        actualGorLoan: 0,   actualGorTotal: 0,   actualKor: 0,   actualGrand: 0,
      };
    }
    const s = summary[planId];
    s.runsTotal++;

    const b = budgetByNo[no];
    if (b) {
      const gorLoan    = Number(b.gorTotal)   || 0;  // เงินยืม (ตามชื่อฟิลด์จริงในชีต)
      const korTotal   = Number(b.korTotal)   || 0;
      const grandTotal = Number(b.grandTotal) || 0;
      s.approvedGorLoan  += gorLoan;
      s.approvedKor      += korTotal;
      s.approvedGrand    += grandTotal;
      s.approvedGorTotal += (grandTotal - korTotal);   // ก.รวมทั้งหมด = รวมทั้งสิ้น - ข.
    }

    const a6 = actual06ByNo[no];
    if (a6) {
      s.actualGorLoan += Number(a6.grandTotal) || 0;   // actual06.grandTotal = ก.เงินยืมใช้จริง อยู่แล้วตามนิยาม LOAN_SECTIONS
    }

    const a7 = actual07ByNo[no];
    if (a7) {
      const grand07 = Number(a7.grandTotal) || 0;
      const kor07   = (Number(a7.a_b1)||0) + (Number(a7.a_b2)||0) + (Number(a7.a_b3)||0);
      s.actualKor      += kor07;
      s.actualGrand    += grand07;
      s.actualGorTotal += (grand07 - kor07);
      s.runsDone++;   // นับว่า "จัดจริงแล้ว" เมื่อมีการบันทึกไฟล์ 07 ของรุ่นนั้น
    }
  });

  return summary;
}

function getSheet(name) {
  const sheet = SS.getSheetByName(name);
  if (!sheet) throw new Error('ไม่พบ Sheet: ' + name);
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
//  LOGIN
// ============================================================

function checkLogin(user, pass) {
  if (!user || !pass) {
    return { ok: false, msg: 'กรุณากรอกข้อมูลให้ครบ' };
  }

  const props = PropertiesService.getScriptProperties();
  const raw   = props.getProperty('TMS_USERS');

  if (!raw) {
    return { ok: false, msg: 'ไม่พบข้อมูลผู้ใช้งาน — กรุณาติดต่อผู้ดูแลระบบ' };
  }

  try {
    const users = JSON.parse(raw);
    if (users[String(user).trim()] === String(pass)) {
      return { ok: true, msg: 'เข้าสู่ระบบสำเร็จ' };
    } else {
      return { ok: false, msg: 'รหัสผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' };
    }
  } catch (e) {
    return { ok: false, msg: 'ข้อผิดพลาดระบบ: ' + e.message };
  }
}
