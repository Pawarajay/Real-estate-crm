// const mongoose = require('mongoose');

// const contactSchema = new mongoose.Schema({
//   whatsappId: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   lastMessage: { type: String, required: true },
// }, { timestamps: true });

// module.exports = mongoose.model('Contact', contactSchema);
const express = require('express');
const router = express.Router();

// GET all contacts
router.get('/', async (req, res) => {
  const db = await req.db;
  try {
    const [rows] = await db.query('SELECT * FROM contacts ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// ADD a contact
router.post('/', async (req, res) => {
  const db = await req.db;
  const { name, whatsappId, lastMessage } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO contacts (name, whatsappId, lastMessage) VALUES (?, ?, ?)',
      [name, whatsappId, lastMessage]
    );
    const [rows] = await db.query('SELECT * FROM contacts WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add contact' });
  }
});

// UPDATE a contact
router.put('/:id', async (req, res) => {
  const db = await req.db;
  const { name, whatsappId, lastMessage } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE contacts SET name=?, whatsappId=?, lastMessage=? WHERE id=?',
      [name, whatsappId, lastMessage, id]
    );
    const [rows] = await db.query('SELECT * FROM contacts WHERE id=?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE a contact
router.delete('/:id', async (req, res) => {
  const db = await req.db;
  const { id } = req.params;
  try {
    await db.query('DELETE FROM contacts WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;
