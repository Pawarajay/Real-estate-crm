import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Lead } from "@/pages/Leads";

export default function AssignLeadModal({
  lead,
  onClose,
  onAssign,
  users
}: {
  lead: Lead;
  onClose: () => void;
  onAssign: (updated: Lead) => void;
  users: string[];
}) {
  const [selected, setSelected] = useState(lead.assignedTo || "");
  function handleAssign() {
    onAssign({...lead, assignedTo: selected});
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogTitle>Assign Lead: {lead.name}</DialogTitle>
      <DialogContent>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger><SelectValue placeholder="Select Agent" /></SelectTrigger>
          <SelectContent>
            {users.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={handleAssign} disabled={!selected}>Assign</Button>
      </DialogContent>
    </Dialog>
  );
}
