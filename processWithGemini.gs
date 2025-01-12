function processWithGemini(detectedText) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('gemini_api_key'); // Gemini APIキーを設定
  const model = "gemini-pro"; // または gemini-ultra など利用可能なモデル名
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const prompt = `これは日本の小売店のレシートの画像をOCR解析した結果です。\n
商品名と金額と税率を下記の条件で整理し、JSON形式の**配列**で**のみ**出力してください。Markdownのコードブロック(\`\`\`)、説明文、補足など、JSONデータ以外のレスポンスは一切不要です。\n
■半角・全角のスペースも含めないでください。\n
JSON形式:\n
[\n
{"name": "商品名", "price": 金額, "tax": "税率"},\n
{"name": "商品名", "price": 金額, "tax": "税率"},\n
...\n
]\n
例：\n
[\n
{"name": "ジャガビーうすしお 特", "price": 209},\n
{"name": "Mクロワッサンカス", "price": 99}\n
]\n
のように、JSON配列で出力してください。他の形式での出力は不要です。\n
■金額がマイナスになっているものは割引として扱い、割引も含めてください。\n
その場合のルールは、nameは"割引"で固定し、金額をマイナス数値をそのまま表示し、税率は空白で固定してください。\n
以下にそのパターンの例を示します\n
{"name": "割引", "price": 金額,"tax": ""}\n
■税率には8か10のみで出力し、税率が不明な場合は空白で出力してください。\n

:\n${detectedText}`;

  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey // APIキーをヘッダーに設定
  };
  const payload = {
    'contents': [{
      'parts': [{
        'text': prompt
      }]
    }]
  };
  //   var payload = {
  //   'contents': [{
  //     'parts': [
  //       {
  //         'text': prompt
  //       }
  //     ]
  //   }]
  // };

  const options = {
    'payload': JSON.stringify(payload),
    'contentType': 'application/json', // contentTypeの指定は必須
    'method': 'POST',
    'headers': headers,
    'muteHttpExceptions': true,
  };
  Logger.log(JSON.stringify(options));

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const responseBody = response.getContentText();
    Logger.log(JSON.stringify(responseBody));

    if (statusCode >= 200 && statusCode < 300) {
      // 成功
      const result = JSON.parse(responseBody);
      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        try {
          Logger.log("生データ"+result.candidates[0].content.parts[0].text);
          const organizedData = JSON.parse(result.candidates[0].content.parts[0].text.replace(" ","").replace("`","").replace("json",""));
          Logger.log("organizedData" + organizedData);
          Logger.log("Geminiの出力(JSON): " + JSON.stringify(organizedData));
          return organizedData;
        } catch (jsonError) {
          Logger.log("JSONパースエラー: " + jsonError);
          Logger.log("Geminiの出力(文字列): " + result.candidates[0].content.parts[0].text);
          return { error: "JSONパースに失敗しました。Geminiの出力を確認してください。" };
        }
      } else {
        Logger.log("Geminiからのレスポンス形式が不正です: " + responseBody);
        return { error: "Geminiからのレスポンス形式が不正です。" };
      }

    } else {
      // エラー
      Logger.log(`APIリクエストエラー: ステータスコード ${statusCode}, レスポンス: ${responseBody}`);
      return { error: `APIリクエストに失敗しました。ステータスコード: ${statusCode}, メッセージ: ${responseBody}` };
    }

  } catch (fetchError) {
    Logger.log("UrlFetchApp.fetchエラー: " + fetchError);
    return { error: "UrlFetchApp.fetchでエラーが発生しました。" };
  }
}
