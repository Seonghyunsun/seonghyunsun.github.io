// Google 시트 > 확장 프로그램 > Apps Script 에 붙여넣고 웹앱으로 배포한다.
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSheet().appendRow([
    new Date(), d.name, d.attend === "yes" ? "참석" : "불참",
    d.attend === "yes" ? d.count : "", d.meal === "yes" ? "식사" : d.meal === "no" ? "식사 안 함" : "", d.message
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
