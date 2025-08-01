console.log('Starting server...');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// 🔐 ใส่ Channel Access Token ที่คุณได้จาก LINE Developers Console
const CHANNEL_ACCESS_TOKEN = 'N9MdAkeCqg6kMk2LgwkTl6dy9yhba10ec4l9w5APzRy3SpSfZlur4dfDtQ/CUVQa2p16LaE1kpyGOgOO9jzYy8q5ouh1o+J19/hIQTmPzyEaSMOI3Dh/SJjytIoFm0j5IOT3S/ommuDPGpuXcE4GNQdB04t89/1O/w1cDnyilFU=';

app.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    // 🟢 กรณีผู้ใช้แอดบอทเป็นเพื่อน
    if (event.type === 'follow') {
      const replyToken = event.replyToken;

      await axios.post(
        'https://api.line.me/v2/bot/message/reply',
        {
          replyToken: replyToken,
          messages: [
            {
              type: 'text',
              text: '👋 สวัสดีค่ะ ขอบคุณที่เพิ่มเพื่อน! พิมพ์ "เมนู" เพื่อเริ่มใช้งานได้นะคะ 😊'
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

    // 🟠 ถ้าผู้ใช้ส่งข้อความ
    if (event.type === 'message' && event.message.type === 'text') {
      const replyToken = event.replyToken;
      const userMessage = event.message.text;

      await axios.post(
        'https://api.line.me/v2/bot/message/reply',
        {
          replyToken: replyToken,
          messages: [
            {
              type: 'text',
              text: `คุณพิมพ์ว่า: ${userMessage}`
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
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('✅ Server is running on port', PORT);
});
