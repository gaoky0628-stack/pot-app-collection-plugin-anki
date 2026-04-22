// main.js
async function collection(source, target, options = {}) {
  const { config, utils, setResult } = options;
  const { http } = utils;
  const { fetch, Body } = http;

  // 1. 读取用户配置
  const port = config.get("port") || "8765";
  const deck = config.get("deck") || "Default";
  const model = config.get("model") || "Basic"; // 如果你增加了 model 配置

  // 2. 构造 AnkiConnect 请求体
  const requestBody = {
    action: "addNote",
    version: 6,
    params: {
      note: {
        deckName: deck,
        modelName: model,
        fields: {
          Front: source,   // 单词/句子原文
          Back: target     // 翻译/解释
        },
        options: {
          allowDuplicate: false,
          duplicateScope: "deck"
        },
        tags: ["pot-app"]  // 可添加标签便于管理
      }
    }
  };

  try {
    // 3. 发送请求到 AnkiConnect
    const response = await fetch(`http://127.0.0.1:${port}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: Body.json(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`网络错误: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(`AnkiConnect 返回错误: ${result.error}`);
    }

    // 4. 可选：通过 setResult 显示成功提示（如果 Pot 支持）
    if (setResult) {
      setResult(`已添加到牌组 "${deck}"`);
    }

    return true;
  } catch (error) {
    // 5. 错误处理：将错误信息显示给用户
    if (setResult) {
      setResult(`添加失败: ${error.message}`);
    }
    // 抛出错误让 Pot 记录日志
    throw error;
  }
}
