import axios from "axios";
const API_URL = "http://localhost:4000/api/whatsapp";

export const getTemplates = () => axios.get(`${API_URL}/templates`);
export const sendTemplate = (payload: any) => axios.post(`${API_URL}/send`, payload);

export async function sendWhatsAppMessage({ to, message }: { to: string; message: string }) {
  // Later use official WhatsApp Cloud API

  console.log("SENDING WHATSAPP MSG →", to, message);

  return new Promise((resolve) => setTimeout(resolve, 500));
}



// export async function fetchWhatsAppTemplates(): Promise<string[]> {
//   const res = await fetch("/api/whatsapp/templates");
//   if (!res.ok) throw new Error("Failed template fetch");
//   return res.json();
// }

// export async function sendWhatsAppTemplate(
//   to: string,
//   template: string,
//   params: any
// ): Promise<void> {
//   await fetch("/api/whatsapp/send", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ to, template, params }),
//   }).then(r => {
//     if (!r.ok) throw new Error("Failed to send WhatsApp message");
//   });
// }

// WhatsAppTemplateModal.tsx:97  Uncaught SyntaxError: The requested module '/src/lib/whatsappApi.ts' does not provide an export named 'sendWhatsAppMessage' (at WhatsAppTemplateModal.tsx:97:10)