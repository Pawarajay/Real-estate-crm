// import { useState, useEffect } from "react";
// import { getTemplates, sendTemplate } from "../lib/whatsappApi";
// import { Lead } from "../pages/Leads";

// type Props = {
//   lead: Lead;
//   onClose: () => void;
// };

// export default function WhatsAppTemplateModal({ lead, onClose }: Props) {
//   const [templates, setTemplates] = useState<any[]>([]);
//   const [selected, setSelected] = useState<number | null>(null);
//   const [templateData, setTemplateData] = useState<any>({});
//   const [sent, setSent] = useState<string | null>(null);
//   const [sending, setSending] = useState(false);

//   useEffect(() => {
//     getTemplates().then(res => setTemplates(res.data));
//   }, []);

//   function handleSelect(id: number) {
//     setSelected(id);
//     setTemplateData({});
//     setSent(null);
//   }

//   function handleChange(e: any) {
//     setTemplateData({ ...templateData, [e.target.name]: e.target.value });
//   }

//   function handleSend() {
//     setSending(true);
//     sendTemplate({ lead, templateId: selected, templateData })
//       .then(res => setSent("Message sent! Preview: " + res.data.message))
//       .catch(() => setSent("Failed to send!"))
//       .finally(() => setSending(false));
//   }

//   const chosenTemplate = templates.find(t => t.id === selected);

//   return (
//     <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded shadow w-[360px] relative">
//         <button
//           className="absolute right-4 top-3 text-gray-400 hover:text-black"
//           onClick={onClose}
//         >
//           &times;
//         </button>
//         <h2 className="text-lg mb-4 font-semibold">Send WhatsApp Template</h2>
//         <div className="mb-2">
//           <label className="block text-sm mb-1">Select template:</label>
//           <select className="w-full border px-2 py-1" value={selected || ""} onChange={e => handleSelect(Number(e.target.value))}>
//             <option value="">Choose template</option>
//             {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
//           </select>
//         </div>
//         {chosenTemplate && (
//           <>
//             <div className="mb-2 text-sm bg-gray-100 p-2 rounded">Template: {chosenTemplate.text}</div>
//             {chosenTemplate.text.match(/{\w+}/g)?.map(match => {
//               const field = match.replace(/[{}]/g, "");
//               return (
//                 <input
//                   key={field}
//                   name={field}
//                   placeholder={field}
//                   className="border px-2 py-1 mb-2 w-full"
//                   value={templateData[field] || lead[field] || ""}
//                   onChange={handleChange}
//                 />
//               );
//             })}
//             <button
//               className="bg-green-600 text-white px-4 py-2 rounded"
//               onClick={handleSend}
//               disabled={sending}
//             >
//               {sending ? "Sending..." : "Send WhatsApp"}
//             </button>
//           </>
//         )}
//         {sent && <div className="mt-2 text-green-600">{sent}</div>}
//       </div>
//     </div>
//   );
// }


"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Lead } from "@/app/leads/page";
import { sendWhatsAppMessage } from "@/lib/whatsappApi";

const templates = [
  {
    id: "intro",
    label: "Introduction Message",
    content: "Hi {{name}}, hope you're doing great! We received your inquiry. When can we connect?"
  },
  {
    id: "followup",
    label: "Follow-up Message",
    content: "Hi {{name}}, just checking in regarding your interest. Let me know if you need any help."
  },
  {
    id: "offer",
    label: "Offer / Pricing Message",
    content: "Hi {{name}}, here are the package details you requested. Let me know your thoughts."
  }
];

export default function WhatsAppTemplateModal({
  lead,
  onClose
}: {
  lead: Lead;
  onClose: () => void;
}) {

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [message, setMessage] = useState("");

  function handleTemplateChange(id: string) {
    setSelectedTemplate(id);

    const t = templates.find(t => t.id === id);
    if (!t) return;

    const msg = t.content.replace("{{name}}", lead.name);
    setMessage(msg);
  }

  async function sendMessage() {
    try {
      await sendWhatsAppMessage({
        to: lead.contact,
        message
      });

      alert("Message sent successfully!");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to send message.");
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send WhatsApp Message to {lead.name}</DialogTitle>
        </DialogHeader>

        {/* Template Selector */}
        <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Message Box */}
        <Textarea
          className="min-h-[120px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={sendMessage}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



//advanced code
// import { useState, useEffect } from "react";
// import { Modal, Button, Select, SelectItem, Textarea } from "@/components/ui/your-modal-and-inputs";
// import { sendWhatsAppTemplate, fetchWhatsAppTemplates } from "@/lib/whatsappApi";

// interface Props {
//   lead: { name: string; contact: string; id: number };
//   onClose: () => void;
// }
// export default function WhatsAppTemplateModal({ lead, onClose }: Props) {
//   const [templates, setTemplates] = useState<string[]>([]);
//   const [selected, setSelected] = useState<string>("");
//   const [params, setParams] = useState<{ [k: string]: string }>({});
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<string | null>(null);

//   useEffect(() => {
//     fetchWhatsAppTemplates().then(setTemplates);
//   }, []);

//   function handleSend() {
//     setLoading(true);
//     sendWhatsAppTemplate(lead.contact, selected, params)
//       .then(() => setResult("Message sent!"))
//       .catch(() => setResult("Failed to send."))
//       .finally(() => setLoading(false));
//   }

//   return (
//     <Modal open onClose={onClose} title="Send WhatsApp Template">
//       <div>
//         <Select value={selected} onValueChange={setSelected}>
//           <SelectItem value="">Select a template</SelectItem>
//           {templates.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
//         </Select>
//       </div>
//       {/* For demo: param input for template variables */}
//       <div>
//         <Textarea
//           placeholder="Message params as JSON"
//           value={JSON.stringify(params)}
//           onChange={e => setParams(JSON.parse(e.target.value))}
//         />
//       </div>
//       <Button onClick={handleSend} disabled={!selected || loading}>Send</Button>
//       {result && <div className="mt-2">{result}</div>}
//     </Modal>
//   );
// }
