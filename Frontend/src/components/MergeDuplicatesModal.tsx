import { useState } from "react";
import { mergeDuplicates } from "@/lib/duplicateApi";
import { Lead } from "@/pages/Leads";

type Props = {
  primaryLead: Lead;
  duplicateLeads: Lead[];
  onClose: () => void;
  onMerge: () => void;
};

export default function MergeDuplicatesModal({
  primaryLead,
  duplicateLeads,
  onClose,
  onMerge,
}: Props) {
  const [selectedSecondary, setSelectedSecondary] = useState<number | null>(null);
  const [merging, setMerging] = useState(false);
  const [message, setMessage] = useState("");

  function handleMerge() {
    if (!selectedSecondary) {
      setMessage("Please select a lead to merge");
      return;
    }
    setMerging(true);
    mergeDuplicates(primaryLead.id, selectedSecondary)
      .then(() => {
        setMessage("Leads merged successfully!");
        setTimeout(() => {
          onMerge();
          onClose();
        }, 1000);
      })
      .catch(() => setMessage("Failed to merge leads"))
      .finally(() => setMerging(false));
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Merge Duplicate Leads</h2>
        <div className="mb-4">
          <p className="text-sm mb-2">
            <strong>Keep:</strong> {primaryLead.name} ({primaryLead.contact})
          </p>
          <p className="text-sm mb-3 font-semibold">Merge with:</p>
          {duplicateLeads.length > 0 ? (
            <select
              className="w-full border px-2 py-1"
              value={selectedSecondary || ""}
              onChange={(e) => setSelectedSecondary(Number(e.target.value))}
            >
              <option value="">-- Select lead to remove --</option>
              {duplicateLeads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} ({lead.contact}) - {lead.email}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-500">No duplicates found</p>
          )}
        </div>
        {message && (
          <div
            className={`text-sm mb-3 ${
              message.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}
        <div className="flex gap-2">
          <button
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-50"
            onClick={handleMerge}
            disabled={merging || !selectedSecondary}
          >
            {merging ? "Merging..." : "Merge"}
          </button>
          <button
            className="flex-1 bg-gray-300 text-black px-3 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
