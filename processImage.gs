function processImage(base64Image) {
  const visionAPIKey = PropertiesService.getScriptProperties().getProperty('Cloud_Vision_api_key');
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${visionAPIKey}`;

  const payload = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: "TEXT_DETECTION" }]
      }
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    if (result.responses && result.responses[0] && result.responses[0].fullTextAnnotation && result.responses[0].fullTextAnnotation.text) {
      const detectedText = result.responses[0].fullTextAnnotation.text;
      Logger.log(detectedText);
      const organizedData = processWithGemini(detectedText);
      saveToSpreadsheet(organizedData);
      return "レシートの取込が完了しました。"; // 成功メッセージを返す
    } else {
      Logger.log("Vision APIからのレスポンスにテキストが含まれていません:" + JSON.stringify(result));
      return "テキストの抽出に失敗しました。画像が不鮮明な可能性があります。"; // エラーメッセージを返す
    }
  } catch (error) {
    Logger.log("エラーが発生しました:" + error);
    return "処理中にエラーが発生しました：" + error.message; // エラーメッセージを返す
  }
}
