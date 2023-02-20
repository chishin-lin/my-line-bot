require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
// 引入openai sdk
const { Configuration, OpenAIApi } = require('openai');
//LINE Bot設定介面中的channelAccessToken與channelSecret
const config = {
  channelAccessToken:
    '8oe585e7mBCatmL4TXwEdZ7V9IlXqK8Nw97ERw8IMbmJry/e/zlL8iKAolAV4xb2lRJH3hMMu+WJf6XxI9MqOYmgtS2OFXNyMrKDCRUsEWkW95pQNmx9+lxA7OH4eCzVlgYFcf7Dxk+SCOcTAgMVNAdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'cd3b213e25876e5d237aca4acd2b8048',
};

const client = new line.Client(config);

const app = express();

const OPENAI_API_KEY = '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';
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

app.post('/callback', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

const handleEvent = async (event) => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const message = {
    type: 'text',
    text: await chatgpt(event.message.text), //讓chatgpt處理回應的訊息
  };
  console.log('replyMessage is ==', message);
  return client.replyMessage(event.replyToken, message);
};

//創建chatgpt函式處理使用者輸入的訊息
const chatgpt = async (userInput) => {
  console.log('userInput is ', userInput);
  try {
    //對chatGPT發送請求
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: userInput,
      temperature: 0.5,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    // 取得回覆
    console.log(completion.data.choices[0].text);
    //返回回覆
    return completion.data.choices[0].text;
  } catch (error) {
    if (error.response) {
      console.log('error.response.status = ', error.response.status);
      console.log('error.response.data = ', error.response.data);
    } else {
      console.log('error.message = ', error.message);
    }
  }
};

app.listen(process.env.PORT || 3000, () => {
  console.log('LINE Bot server is running!');
});
