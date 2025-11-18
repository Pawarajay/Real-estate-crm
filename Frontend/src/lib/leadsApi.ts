import axios from "axios";

const API_BASE = "/api/leads";
const CONTACTS_BASE = "/api/contacts";

// --- Lead CRUD ---
export const getLeads = (config?: any) => axios.get(API_BASE, config);
export const getLead = (id: number) => axios.get(`${API_BASE}/${id}`);
export const addLead = (data: any) => axios.post(API_BASE, data);
export const updateLead = (id: number, data: any) => axios.put(`${API_BASE}/${id}`, data);
export const deleteLead = (id: number) => axios.delete(`${API_BASE}/${id}`);

// --- Bulk Import handler ---
export async function addBulkLeads(formData: FormData) {
  const res = await fetch(`${API_BASE}/import`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Bulk import failed");
}

// --- Get WhatsApp Leads (Mongo/Meta) ---
export async function getWhatsappLeads(): Promise<any[]> {
  const res = await fetch(CONTACTS_BASE);  // Always use /api/contacts
  if (!res.ok) throw new Error("Failed to fetch WhatsApp leads");
  return res.json();
}
