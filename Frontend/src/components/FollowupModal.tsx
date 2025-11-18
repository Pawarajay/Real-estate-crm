import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lead } from "@/pages/Leads";

export default function FollowupModal({
  lead,
  onClose,
  onSchedule
}: {
  lead: Lead;
  onClose: () => void;
  onSchedule: (updated: Lead) => void;
}) {
  const [date, setDate] = useState(lead.followUp || "");

  function handleSchedule() {
    onSchedule({ ...lead, followUp: date });
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogTitle>Schedule Follow-Up for {lead.name}</DialogTitle>
      <DialogContent>
        <Input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <Button onClick={handleSchedule} disabled={!date}>Save</Button>
      </DialogContent>
    </Dialog>
  );
}
