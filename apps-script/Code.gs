// Google 시트 > 확장 프로그램 > Apps Script 에 붙여넣고 웹앱으로 배포한다.
function safeCell(v) {
  var s = String(v === undefined || v === null ? "" : v).slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var attending = d.attend === "yes";
  var count = attending ? Math.min(Math.max(parseInt(d.count, 10) || 1, 1), 10) : "";
  SpreadsheetApp.getActiveSheet().appendRow([
    new Date(), safeCell(d.name), attending ? "참석" : "불참", count,
    attending ? (d.meal === "yes" ? "식사" : d.meal === "no" ? "식사 안 함" : "") : "",
    safeCell(d.message)
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
