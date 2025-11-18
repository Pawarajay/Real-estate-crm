import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // Replace with your modal/dialog
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { addBulkLeads } from "@/lib/leadsApi";

export default function BulkImportModal({ onClose, onImport }: { onClose: () => void; onImport: () => void }) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!csvFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", csvFile);
    try {
      await addBulkLeads(formData);
      setError(null);
      onImport();
      onClose();
    } catch {
      setError("Failed to import CSV");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogTitle>
        <Upload className="mr-2 h-4 w-4" /> Import Leads (CSV)
      </DialogTitle>
      <DialogContent>
        <Input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
        <Button onClick={handleUpload} disabled={loading || !csvFile}>Import</Button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </DialogContent>
    </Dialog>
  );
}
