function saveToSpreadsheet(organizedData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("calc");
  clearRange();
  

  // ヘッダー行をセット
  sheet.getRange('B1').setValue('商品名');
  sheet.getRange('C1').setValue('金額');
  sheet.getRange('D1').setValue('税率');

  // データを書き込む
  organizedData.forEach((item, index) => {
    sheet.getRange(index + 2, 2).setValue(item['name']);
    sheet.getRange(index + 2, 3).setValue(item['price']);
    sheet.getRange(index + 2, 4).setValue(item['tax']);
  });
}
