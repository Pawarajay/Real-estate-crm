const express = require('express');
const router = express.Router();
const axios = require('axios');

const WHATSAPP_API_URL = `https://api.aoc-portal.com/v1/whatsapp`;
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ADMIN_PHONE_NUMBER = process.env.ADMIN_PHONE_NUMBER;
const AXIOS_CONFIG = WHATSAPP_API_TOKEN ? { headers: { 'apikey': WHATSAPP_API_TOKEN } } : {};

// --- WhatsApp Message Sender ---
async function sendWhatsappMessage(to, text) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) return;
  const data = {
    recipient_type: "individual",
    from: WHATSAPP_PHONE_NUMBER_ID,
    to,
    type: 'text',
    text: { body: text }
  };
  try {
    await axios.post(WHATSAPP_API_URL, data, AXIOS_CONFIG);
  } catch (error) {
    console.error('WhatsApp send error:', error.response?.data || error.message);
  }
}

// --- Webhook: Store WhatsApp Lead and Notify ---
router.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const db = await req.db;

  const body = req.body;
  if (body.channel !== 'whatsapp' || !body.messages) return;

  const message = body.messages;
  const from = body.contacts.recipient;
  const profileName = body.contacts?.profileName || 'Unknown Name';
  const userMessage = (message.type === 'text' && message.text?.body) ? message.text.body.trim() : null;

  if (!userMessage) return;

  try {
    const [existingArr] = await db.query('SELECT * FROM contacts WHERE whatsappId=?', [from]);
    let existingContact = existingArr[0];

    if (!existingContact) {
      // Save new contact
      await db.query(
        'INSERT INTO contacts (whatsappId, name, lastMessage) VALUES (?, ?, ?)',
        [from, profileName, userMessage]
      );

      // Admin notification
      if (ADMIN_PHONE_NUMBER) {
        const adminNotification = `🔔 New WhatsApp Message!\n\n👤 *From:* ${profileName}\n📞 *Number:* ${from}\n💬 *Message:* ${userMessage}`;
        const adminNumbers = ADMIN_PHONE_NUMBER.split(',');
        for (const number of adminNumbers) {
          const trimmedNumber = number.trim();
          if (trimmedNumber) await sendWhatsappMessage(trimmedNumber, adminNotification);
        }
      }

      // User confirmation
      await sendWhatsappMessage(from, "Thank you for your message! We have received it and will get back to you shortly.");
    } else {
      // Update last message
      await db.query('UPDATE contacts SET lastMessage=? WHERE whatsappId=?', [userMessage, from]);
    }
  } catch (error) {
    console.error("❌ Webhook error:", error);
  }
});

// --- API: Get WhatsApp Contacts ---
router.get('/', async (req, res) => {
  const db = await req.db;
  try {
    const [contacts] = await db.query('SELECT * FROM contacts ORDER BY createdAt DESC');
    res.json(contacts);
  } catch {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

module.exports = router;
