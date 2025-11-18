import { AlertCircle } from "lucide-react";

type Props = {
  isDuplicate: boolean;
  duplicateCount: number;
  leadName: string;
};

export default function DuplicateAlert({ isDuplicate, duplicateCount, leadName }: Props) {
  if (!isDuplicate) return null;

  return (
    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
      <AlertCircle size={14} />
      <span>Possible duplicate ({duplicateCount})</span>
    </div>
  );
}
