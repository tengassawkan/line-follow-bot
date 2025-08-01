console.log('Starting server...');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// 🔐 ใส่ข้อมูลของคุณตรงนี้
const CHANNEL_ACCESS_TOKEN = 'YOUR_LINE_CHANNEL_ACCESS_TOKEN';
const projectId = 'YOUR_PROJECT_ID';
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: path.join(__dirname, 'YOUR_JSON_FILENAME.json')
});

app.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    // 🟢 ผู้ใช้แอดเพื่อน
    if (event.type === 'follow') {
      const replyToken = event.replyToken;

      await axios.post(
        'https://api.line.me/v2/bot/message/reply',
        {
          replyToken: replyToken,
          messages: [
            {
              type: 'template',
              altText: 'กรุณาเลือกภาษาที่ต้องการใช้ / Please select your language',
              template: {
                type: 'confirm',
                text: 'กรุณาเลือกภาษาที่ต้องการใช้ / Please select your language',
                actions: [
                  {
                    type: 'message',
                    label: 'ไทย 🇹🇭',
                    text: 'เลือกภาษา: ไทย'
                  },
                  {
                    type: 'message',
                    label: 'English 🇺🇸',
                    text: 'Language: English'
                  }
                ]
              }
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`
          }
        }
      );
    }

    // 🟠 ผู้ใช้ส่งข้อความ
    if (event.type === 'message' && event.message.type === 'text') {
      const replyToken = event.replyToken;
      const userMessage = event.message.text;

      const sessionId = uuid.v4();
      const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: userMessage,
            languageCode: 'th', // เปลี่ยนเป็น 'en' ได้หากเลือกภาษาอังกฤษ
          }
        }
      };

      try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        await axios.post(
          'https://api.line.me/v2/bot/message/reply',
          {
            replyToken,
            messages: [
              {
                type: 'text',
                text: result.fulfillmentText || '🤖 ขอโทษค่ะ ฉันไม่เข้าใจข้อความนี้'
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`
            }
          }
        );
      } catch (error) {
        console.error('❌ Error from Dialogflow:', error);
      }
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
