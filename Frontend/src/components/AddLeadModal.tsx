import { useState, useEffect } from "react";

// Add more custom keys here if you want them in the modal UI
const defaultCustomKeys = [
  { key: "propertyType", label: "Property Type" },
  { key: "budget", label: "Budget" },
  { key: "location", label: "Location" },
  { key: "timeline", label: "Timeline" }
];

type Lead = {
  id?: number;
  name: string;
  contact: string;
  email: string;
  source: string;
  status: string;
  assignedTo: string;
  followUp: string;
  tags?: string[];
  customFields?: { [key: string]: any };
};

type Props = {
  onClose: () => void;
  onSubmit: (lead: Lead) => void;
  existingLead?: Lead | null;
  error?: string | null;
};

const statusOptions = ["new", "contacted", "site-visit", "negotiation", "converted", "lost"];
const userOptions = [
  "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh" // Example users/roles
];

export default function AddLeadModal({ onClose, onSubmit, existingLead, error }: Props) {
  const [form, setForm] = useState<Lead>(
    existingLead || {
      name: "",
      contact: "",
      email: "",
      source: "",
      status: "new",
      assignedTo: "",
      followUp: "",
      tags: [],
      customFields: {}
    }
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => { setLocalError(error || null); }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle dynamic custom fields
  const handleCustomFieldChange = (key: string, value: any) =>
    setForm({ ...form, customFields: { ...form.customFields, [key]: value } });

  // Tag logic
  const handleTagAdd = () => {
    if (tagInput && !form.tags?.includes(tagInput)) {
      setForm({ ...form, tags: [...(form.tags || []), tagInput] });
      setTagInput("");
    }
  };
  const handleTagRemove = (tag: string) => {
    setForm({ ...form, tags: (form.tags || []).filter((t) => t !== tag) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic front-end validation
    if (!form.name || !form.contact || !form.email || !form.source || !form.assignedTo) {
      setLocalError("All fields except followUp/tags are required!");
      return;
    }
    setLocalError(null);
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-[370px]">
        <h2 className="text-xl mb-4">{existingLead ? "Edit Lead" : "Add New Lead"}</h2>
        {localError && <div className="text-red-600 mb-2">{localError}</div>}
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border px-2 py-1 mb-2 w-full"/>
        <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} className="border px-2 py-1 mb-2 w-full"/>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border px-2 py-1 mb-2 w-full"/>
        <input name="source" placeholder="Source" value={form.source} onChange={handleChange} className="border px-2 py-1 mb-2 w-full"/>
        <select name="status" value={form.status} onChange={handleChange} className="border px-2 py-1 mb-2 w-full">
          {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="border px-2 py-1 mb-2 w-full">
          <option value="">Assign to...</option>
          {userOptions.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <input name="followUp" type="date" value={form.followUp || ""} onChange={handleChange} className="border px-2 py-1 mb-2 w-full"/>
        {/* Custom fields */}
        {defaultCustomKeys.map(field => (
          <input
            key={field.key}
            placeholder={field.label}
            value={form.customFields?.[field.key] || ""}
            onChange={e => handleCustomFieldChange(field.key, e.target.value)}
            className="border px-2 py-1 mb-2 w-full"
          />
        ))}
        {/* Tags */}
        <div className="mb-2 flex gap-2 flex-wrap">
          {(form.tags || []).map(tag => (
            <span key={tag} className="bg-gray-200 rounded px-2 py-1 text-sm flex items-center">
              {tag} <button type="button" onClick={() => handleTagRemove(tag)} className="ml-1 text-red-600">&times;</button>
            </span>
          ))}
          <input
            placeholder="Add tag"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            className="border px-2 py-1 w-[80px]"
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleTagAdd(); } }}
          />
          <button type="button" onClick={handleTagAdd} className="bg-blue-200 px-2 py-1 rounded">Add</button>
        </div>
        <div className="mt-4 flex gap-3">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{existingLead ? "Update" : "Add"}</button>
          <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
