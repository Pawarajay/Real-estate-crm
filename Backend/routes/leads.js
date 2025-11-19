const express = require('express');
const router = express.Router();

// Get all leads
router.get('/', async (req, res) => {
  const db = await req.db;
  try {
    const [rows] = await db.query('SELECT * FROM leads ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Add lead
router.post('/', async (req, res) => {
  const db = await req.db;
  const { name, contact, email, source, status, assignedTo, followUp, tags } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO leads (name, contact, email, source, status, assignedTo, followUp, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, contact, email, source, status, assignedTo, followUp, JSON.stringify(tags || [])]
    );
    const [rows] = await db.query('SELECT * FROM leads WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add lead' });
  }
});

router.put('/:id', async (req, res) => {
  const db = await req.db;
  const { name, contact, email, source, status, assignedTo, followUp, tags } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE leads SET name=?, contact=?, email=?, source=?, status=?, assignedTo=?, followUp=?, tags=? WHERE id=?',
      [name, contact, email, source, status, assignedTo, followUp, JSON.stringify(tags || []), id]
    );
    const [rows] = await db.query('SELECT * FROM leads WHERE id=?', [id]);
    res.json(rows[0]);
  
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lead' });

  }
});

router.delete('/:id', async (req, res) => {
  const db = await req.db;
  const { id } = req.params;
  try {
    await db.query('DELETE FROM leads WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

module.exports = router;
