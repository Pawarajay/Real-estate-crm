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

router.post('/assign-meta-leads', async (req, res) => {
  const db = await req.db;

  const campaignAgents = {
    "Ad1": ["Rajesh Kumar", "Priya Sharma"],   
    "Ad2": ["Amit Patel", "Sneha Reddy"],
  };

  try {
    let updated = 0;
    for (const campaign of Object.keys(campaignAgents)) {
      const agents = campaignAgents[campaign];

      const [unassignedLeads] = await db.query(
        'SELECT * FROM leads WHERE source = "WhatsApp" AND campaign = ? AND (assignedTo IS NULL OR assignedTo = "" OR assignedTo = "-") ORDER BY createdAt ASC',
        [campaign]
      );

      if (unassignedLeads.length === 0) continue;

      const [latestAssigned] = await db.query(
        'SELECT assignedTo FROM leads WHERE source = "WhatsApp" AND campaign = ? AND assignedTo IS NOT NULL AND assignedTo != "" ORDER BY updatedAt DESC, createdAt DESC LIMIT 1',
        [campaign]
      );
      let lastAgentIndex = 0;
      if (latestAssigned.length) {
        const lastAgentName = latestAssigned[0].assignedTo;
        const idx = agents.indexOf(lastAgentName);
        lastAgentIndex = idx >= 0 ? idx : 0;
      }
      for (let i = 0; i < unassignedLeads.length; i++) {
        const agentIdx = (lastAgentIndex + i + 1) % agents.length;
        const agentName = agents[agentIdx];
        await db.query('UPDATE leads SET assignedTo=? WHERE id=?', [agentName, unassignedLeads[i].id]);
        updated++;
      }
    }
    res.json({ updated, info: "Per-campaign agent round-robin complete!" });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign Meta Ad leads per campaign', details: err.message });
  }
});


module.exports = router;
