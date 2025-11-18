const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const leadsPath = path.join(__dirname, '../leads.json');

function getLeads() {
  if (!fs.existsSync(leadsPath)) return [];
  const content = fs.readFileSync(leadsPath, 'utf8');
  if (!content.trim()) return [];
  try {
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

function setLeads(leads) {
  fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2));
}

// Detect duplicates based on name and phone
function detectDuplicates(leads) {
  const duplicateGroups = {};
  
  leads.forEach(lead => {
    // Normalize name and contact for comparison
    const normalizedName = (lead.name || '').toLowerCase().trim();
    const normalizedContact = (lead.contact || '').toLowerCase().trim();
    
    // Create a composite key
    const key = `${normalizedName}|${normalizedContact}`;
    
    if (!duplicateGroups[key]) {
      duplicateGroups[key] = [];
    }
    duplicateGroups[key].push(lead);
  });
  
  // Filter to only groups with duplicates (2+)
  const duplicates = {};
  Object.keys(duplicateGroups).forEach(key => {
    if (duplicateGroups[key].length > 1) {
      duplicates[key] = duplicateGroups[key];
    }
  });
  
  return duplicates;
}

// GET: Get all duplicate groups
router.get('/', (req, res) => {
  const leads = getLeads();
  const duplicates = detectDuplicates(leads);
  res.json(duplicates);
});

// GET: Get duplicate status for a single lead
router.get('/:leadId', (req, res) => {
  const leadId = Number(req.params.leadId);
  const leads = getLeads();
  const lead = leads.find(l => l.id === leadId);
  
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  
  const duplicates = detectDuplicates(leads);
  const normalizedName = (lead.name || '').toLowerCase().trim();
  const normalizedContact = (lead.contact || '').toLowerCase().trim();
  const key = `${normalizedName}|${normalizedContact}`;
  
  const isDuplicate = duplicates[key] ? duplicates[key] : [];
  
  res.json({
    leadId,
    isDuplicate: isDuplicate.length > 0,
    duplicateGroup: isDuplicate,
    duplicateCount: isDuplicate.length
  });
});

// POST: Merge two leads (keep primary, delete secondary, optionally combine notes)
router.post('/merge', (req, res) => {
  const { primaryLeadId, secondaryLeadId, keepData } = req.body; // keepData = 'primary' or 'secondary'
  
  const leads = getLeads();
  const primaryIdx = leads.findIndex(l => l.id === primaryLeadId);
  const secondaryIdx = leads.findIndex(l => l.id === secondaryLeadId);
  
  if (primaryIdx === -1 || secondaryIdx === -1) {
    return res.status(404).json({ error: 'One or both leads not found' });
  }
  
  const primary = leads[primaryIdx];
  const secondary = leads[secondaryIdx];
  
  // Merge: take primary data, but fill gaps from secondary
  if (!primary.contact && secondary.contact) primary.contact = secondary.contact;
  if (!primary.email && secondary.email) primary.email = secondary.email;
  if (!primary.assignedTo && secondary.assignedTo) primary.assignedTo = secondary.assignedTo;
  
  // Add note about merge
  primary.customFields = primary.customFields || {};
  primary.customFields.mergedWith = `ID: ${secondaryLeadId} (${secondary.name})`;
  primary.customFields.mergeDate = new Date().toISOString();
  
  // Remove secondary lead
  leads.splice(secondaryIdx, 1);
  
  setLeads(leads);
  
  res.json({ success: true, mergedLead: primary });
});

module.exports = router;
