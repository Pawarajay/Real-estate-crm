import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Upload,
  Search,
  Filter,
  Phone,
  AlertCircle,
  MessageCircle,
  Copy,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  getLeads,
  addLead,
  updateLead,
  deleteLead,
  getWhatsappLeads,
} from "@/lib/leadsApi";
import AddLeadModal from "@/components/AddLeadModal";
import WhatsAppTemplateModal from "@/components/WhatsAppTemplateModal";
import DuplicateAlert from "@/components/DuplicateAlert";
import MergeDuplicatesModal from "@/components/MergeDuplicatesModal";
import BulkImportModal from "@/components/BulkImportModal";
import AssignLeadModal from "@/components/AssignLeadModal";
import FollowupModal from "@/components/FollowupModal";
import { useUser } from "../lib/UserContext";

const statusOptions = [
  "new", "contacted", "site-visit", "negotiation", "converted", "lost",
];
const userOptions = [
  "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh",
];
const tagOptions = ["hot", "priority", "followup", "test"];

export type Lead = {
  id: string | number;
  name: string;
  contact: string;
  email: string;
  source: string;
  status: string;
  assignedTo: string;
  followUp: string;
  tags?: string[] | string;
  customFields?: { [key: string]: any };
  duplicateInfo?: { isDuplicate: boolean; duplicateCount: number };
  metaData?: any;
  createdAt?: string;
};

function isOverdue(followUp?: string) {
  if (!followUp) return false;
  try {
    const fDate = new Date(followUp);
    const today = new Date(new Date().toISOString().slice(0, 10));
    return fDate < today;
  } catch {
    return false;
  }
}
function statusClass(status: string) {
  switch (status) {
    case "new": return "bg-blue-100 text-blue-800";
    case "contacted": return "bg-indigo-100 text-indigo-800";
    case "site-visit": return "bg-amber-100 text-amber-800";
    case "negotiation": return "bg-yellow-100 text-yellow-800";
    case "converted": return "bg-green-100 text-green-800";
    case "lost": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}
function addDuplicateInfo(leadsData: any): Lead[] {
  if (!Array.isArray(leadsData)) return [];
  return leadsData.map((lead) => {
    let tagsArray: string[] = [];
    if (Array.isArray(lead.tags)) {
      tagsArray = lead.tags;
    } else if (typeof lead.tags === "string" && lead.tags.length > 0) {
      try { tagsArray = JSON.parse(lead.tags); } catch { tagsArray = []; }
    }
    const duplicateMatches = leadsData.filter((l) => {
      const validName = (l.name || "").trim() !== "" && (lead.name || "").trim() !== "";
      const validContact = (l.contact || "").trim() !== "" && (lead.contact || "").trim() !== "";
      const sameName = validName && (l.name || "").toLowerCase().trim() === (lead.name || "").toLowerCase().trim();
      const sameContact = validContact && (l.contact || "").toLowerCase().trim() === (lead.contact || "").toLowerCase().trim();
      return (sameName || sameContact) && l.id !== lead.id;
    });
    return {
      ...lead,
      tags: tagsArray,
      duplicateInfo: {
        isDuplicate: duplicateMatches.length > 0,
        duplicateCount: duplicateMatches.length,
      },
    };
  });
}

export default function Leads() {
  const { user, logout } = useUser();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [assignedTo, setAssignedTo] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalLead, setModalLead] = useState<Lead | null>(null);
  const [waModalLead, setWAModalLead] = useState<Lead | null>(null);
  const [showDuplicateFilter, setShowDuplicateFilter] = useState(false);
  const [quickAdd, setQuickAdd] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [assignLead, setAssignLead] = useState<Lead | null>(null);
  const [followUpLead, setFollowUpLead] = useState<Lead | null>(null);
  const [duplicateAlertLead, setDuplicateAlertLead] = useState<Lead | null>(null);
  const [mergeModal, setMergeModal] = useState<{ primary: Lead | null; duplicates: Lead[] }>({ primary: null, duplicates: [] });
  const [showWhatsappOnly, setShowWhatsappOnly] = useState(false);

  useEffect(() => { fetchLeads(); },
    [statusFilter, search, assignedTo, selectedTag, user]
  );

  async function fetchLeads() {
    setLoading(true);
    let params: any = {};
    if (statusFilter !== "all") params.status = statusFilter;
    if (search.trim().length > 0) params.search = search;
    if (user?.role === "admin" && assignedTo !== "all") params.assignedTo = assignedTo;
    if (selectedTag !== "all") params.tag = selectedTag;
    if (user?.role === "agent") params.assignedTo = user.displayName;
    try {
      const res = await getLeads({ params });
      let regularLeads: Lead[] = [];
      if (Array.isArray(res.data)) {
        regularLeads = addDuplicateInfo(res.data);
      } else {
        setError("Failed to load regular leads (invalid server data)");
        setLeads([]); setLoading(false); return;
      }
      let whatsappLeadsNormalized: Lead[] = [];
      try {
        const whatsappLeads = await getWhatsappLeads();
        if (Array.isArray(whatsappLeads)) {
          whatsappLeadsNormalized = whatsappLeads.map((contact) => ({
            id: contact.id, name: contact.name, contact: contact.whatsappId, email: "",
            source: "WhatsApp", status: "new", assignedTo: "", followUp: "",
            tags: [], customFields: {}, metaData: { lastMessage: contact.lastMessage, createdAt: contact.createdAt },
            createdAt: contact.createdAt,
          }));
        }
      } catch (waErr) { }
      let mergedLeads = [...regularLeads, ...whatsappLeadsNormalized];
      if (user?.role === "agent") {
        mergedLeads = mergedLeads.filter(
          (l) => l.assignedTo && l.assignedTo === user.displayName
        );
      }
      setLeads(addDuplicateInfo(mergedLeads));
      setError(null);
    } catch {
      setError("Failed to load leads!");
    } finally {
      setLoading(false);
    }
  }
  function handleAddLead(lead: Omit<Lead, "id">) {
    setLoading(true);
    addLead(lead)
      .then((res) => {
        setLeads((prev) => addDuplicateInfo([...prev, res.data]));
        setShowModal(false); setQuickAdd(false); setError(null);
      })
      .catch((err) => setError(err?.response?.data?.error || "Failed to add lead!"))
      .finally(() => setLoading(false));
  }
  function handleUpdateLead(lead: Lead) {
    setLoading(true);
    updateLead(lead.id, lead)
      .then((res) => {
        setLeads((prev) => addDuplicateInfo(prev.map((l) => (l.id === lead.id ? res.data : l))));
        setShowModal(false); setAssignLead(null); setFollowUpLead(null); setError(null);
      })
      .catch((err) => setError(err?.response?.data?.error || "Failed to update lead!"))
      .finally(() => setLoading(false));
  }
  function handleDeleteLead(id: number) {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      setLoading(true);
      deleteLead(id)
        .then(() => setLeads((prev) => addDuplicateInfo(prev.filter((l) => l.id !== id))))
        .catch(() => setError("Failed to delete lead!"))
        .finally(() => setLoading(false));
    }
  }
  function handleBulkImportSuccess() { setShowBulkImport(false); fetchLeads(); }
  function openAddModal() { setModalLead(null); setShowModal(true); setError(null); }
  function openEditModal(lead: Lead) { setModalLead(lead); setShowModal(true); setError(null); }
  function openMergeModal(lead: Lead) {
    const duplicates = leads.filter((l) => {
      const validName = (l.name || "").trim() !== "" && (lead.name || "").trim() !== "";
      const validContact = (l.contact || "").trim() !== "" && (lead.contact || "").trim() !== "";
      const sameName = validName && (l.name || "").toLowerCase().trim() === (lead.name || "").toLowerCase().trim();
      const sameContact = validContact && (l.contact || "").toLowerCase().trim() === (lead.contact || "").toLowerCase().trim();
      return (sameName || sameContact) && l.id !== lead.id;
    });
    if (duplicates.length === 0) { setError("No duplicates found for this lead"); return; }
    setMergeModal({ primary: lead, duplicates });
  }
  function handleMergeComplete() { fetchLeads(); setMergeModal({ primary: null, duplicates: [] }); setError(null); }
  function handleCloseLead(lead: Lead) { handleUpdateLead({ ...lead, status: "closed" }); }
  function copyToClipboard(text?: string) {
    if (!text) return;
    if (navigator && "clipboard" in navigator) {
      navigator.clipboard.writeText(text).catch(() => {
        const inp = document.createElement("input"); document.body.appendChild(inp);
        inp.value = text; inp.select(); document.execCommand("copy"); inp.remove();
      });
    } else {
      const inp = document.createElement("input"); document.body.appendChild(inp);
      inp.value = text; inp.select(); document.execCommand("copy"); inp.remove();
    }
  }

  let filteredLeads = leads;
  if (showDuplicateFilter) {
    filteredLeads = leads.filter((l) => l.duplicateInfo?.isDuplicate);
  }
  if (showWhatsappOnly) {
    filteredLeads = filteredLeads.filter(l => l.source === "WhatsApp");
  }
  const duplicateCount = leads.filter((l) => l.duplicateInfo?.isDuplicate).length;

  return (
    <div className="p-3 sm:p-4 space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground">Track and manage your sales leads</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-start md:justify-end w-full md:w-auto">
          <Button onClick={openAddModal} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
          <Button onClick={() => setQuickAdd(true)} variant="outline" disabled={loading}>
            <Calendar className="mr-2 h-4 w-4" />
            Quick Add
          </Button>
          <Button onClick={() => setShowBulkImport(true)} variant="outline" disabled={loading}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button
            variant={showWhatsappOnly ? "default" : "outline"}
            onClick={() => setShowWhatsappOnly(v => !v)}
            disabled={loading}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {showWhatsappOnly ? "Show All Leads" : "Show WhatsApp Only"}
          </Button>
          <Button variant="outline" onClick={logout} disabled={loading}>
            Logout
          </Button>
        </div>
      </div>

      {/* Duplicate Alert Banner */}
      {duplicateCount > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-yellow-600" size={18} />
                <span className="text-yellow-800 font-semibold">
                  ⚠️ {duplicateCount} potential duplicate lead(s) found
                </span>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  size="sm"
                  variant={showDuplicateFilter ? "default" : "outline"}
                  onClick={() => setShowDuplicateFilter(!showDuplicateFilter)}
                  disabled={loading}
                >
                  {showDuplicateFilter ? "Show All" : "View Duplicates"}
                </Button>
                <Button size="sm" variant="ghost" onClick={fetchLeads} disabled={loading}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3 flex-wrap">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads by name, contact, etc."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
              <SelectTrigger className="w-full md:w-[130px] min-w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {user?.role === "admin" && (
              <Select value={assignedTo} onValueChange={setAssignedTo} disabled={loading}>
                <SelectTrigger className="w-full md:w-[160px] min-w-[140px]">
                  <SelectValue placeholder="Assigned To" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {userOptions.map((userName) => (
                    <SelectItem key={userName} value={userName}>
                      {userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={selectedTag} onValueChange={setSelectedTag} disabled={loading}>
              <SelectTrigger className="w-full md:w-[130px] min-w-[120px]">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {tagOptions.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchLeads} disabled={loading} className="whitespace-nowrap">
              <Filter className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap gap-2 items-center">
            Leads ({filteredLeads.length})
            {showDuplicateFilter && <span className="text-sm text-yellow-600">(Duplicates Only)</span>}
            {showWhatsappOnly && <span className="text-blue-600 text-sm">[WhatsApp Only]</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6">Loading...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No leads found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[730px]">
                <thead>
                  <tr className="border-b whitespace-nowrap">
                    <th className="text-left py-2 px-2 font-medium">Name</th>
                    <th className="text-left py-2 px-2 font-medium">Contact</th>
                    <th className="text-left py-2 px-2 font-medium">Email</th>
                    <th className="text-left py-2 px-2 font-medium">Source</th>
                    <th className="text-left py-2 px-2 font-medium">Status</th>
                    <th className="text-left py-2 px-2 font-medium">Assigned</th>
                    <th className="text-left py-2 px-2 font-medium">Follow-up</th>
                    <th className="text-left py-2 px-2 font-medium">Created</th>
                    <th className="text-left py-2 px-2 font-medium">Last Msg</th>
                    <th className="text-left py-2 px-2 font-medium">Dup</th>
                    <th className="text-left py-2 px-2 font-medium">Tags</th>
                    <th className="text-left py-2 px-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`border-b hover:bg-muted/50 transition ${lead.duplicateInfo?.isDuplicate ? "bg-yellow-50" : ""}`}
                    >
                      <td className="py-2 px-2">
                        <div className="font-medium truncate max-w-[130px]">{lead.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{lead.email}</div>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs">{lead.contact || "-"}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-xs text-muted-foreground">{lead.email || "-"}</td>
                      <td className="py-2 px-2">
                        <Badge
                          variant={
                            lead.source === "Meta Ad"
                              ? "destructive"
                              : lead.source === "WhatsApp"
                                ? "secondary"
                                : "outline"
                          }
                          className={lead.source === "WhatsApp" ? "bg-green-100 text-green-900" : ""}
                        >
                          {lead.source || "-"}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">
                        <Badge className={statusClass(lead.status)}>
                          {lead.status ? lead.status.replace("-", " ") : "-"}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-xs">{lead.assignedTo || "-"}</td>
                      <td className="py-2 px-2 text-xs">
                        <span className={isOverdue(lead.followUp) ? "text-red-600 font-bold" : ""}>
                          {lead.followUp || "-"}
                        </span>
                        {isOverdue(lead.followUp) && (
                          <AlertCircle
                            className="inline ml-1 text-red-600"
                            size={16}
                            title="Follow-up overdue"
                          />
                        )}
                      </td>
                      <td className="py-2 px-2 text-xs text-muted-foreground max-w-[120px] truncate">
                        {lead.createdAt
                          ? new Date(lead.createdAt).toLocaleString()
                          : lead.metaData?.createdAt
                            ? new Date(lead.metaData.createdAt).toLocaleString()
                            : "-"}
                      </td>
                      <td className="py-2 px-2 text-xs text-blue-700 max-w-[110px] truncate">
                        {lead.source === "WhatsApp" && lead.metaData?.lastMessage
                          ? lead.metaData.lastMessage
                          : "-"}
                      </td>
                      <td className="py-2 px-2 text-xs">
                        {lead.duplicateInfo?.isDuplicate ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDuplicateAlertLead(lead)}
                            title={`${lead.duplicateInfo.duplicateCount} duplicates`}
                            disabled={loading}
                            className="p-1"
                          >
                            <span className="font-semibold text-yellow-700">{lead.duplicateInfo.duplicateCount}</span>
                          </Button>
                        ) : <span>-</span>}
                      </td>
                      <td className="py-2 px-2 text-xs max-w-[90px] truncate">
                        {lead.tags && Array.isArray(lead.tags) && lead.tags.length > 0 ? (
                          lead.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block bg-blue-100 text-blue-700 rounded px-1 mr-0.5 text-xs"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex flex-row flex-wrap gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditModal(lead)} disabled={loading} title="Edit" className="p-1">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteLead(lead.id as number)} disabled={loading} title="Delete" className="p-1">
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setWAModalLead(lead)} disabled={loading} title="Send WhatsApp" className="p-1">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => copyToClipboard(lead.contact)} disabled={loading} title="Copy Contact" className="p-1">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setAssignLead(lead)} disabled={loading} title="Assign" className="p-1">
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setFollowUpLead(lead)} disabled={loading} title="Follow-Up" className="p-1">
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleCloseLead(lead)} disabled={loading} title="Close" className="p-1">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          {lead.duplicateInfo?.isDuplicate && (
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => openMergeModal(lead)}
                              disabled={loading}
                              title="Merge Duplicates"
                              className="p-1"
                            >
                              Merge
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showModal && (
        <AddLeadModal
          onClose={() => setShowModal(false)}
          onSubmit={modalLead ? handleUpdateLead : handleAddLead}
          existingLead={modalLead}
          error={error}
        />
      )}
      {quickAdd && (
        <AddLeadModal
          onClose={() => setQuickAdd(false)}
          onSubmit={handleAddLead}
          existingLead={null}
          error={error}
        />
      )}
      {showBulkImport && (
        <BulkImportModal onClose={() => setShowBulkImport(false)} onImport={handleBulkImportSuccess} />
      )}
      {assignLead && (
        <AssignLeadModal
          lead={assignLead}
          onClose={() => setAssignLead(null)}
          onAssign={handleUpdateLead}
          users={userOptions}
        />
      )}
      {followUpLead && (
        <FollowupModal lead={followUpLead} onClose={() => setFollowUpLead(null)} onSchedule={handleUpdateLead} />
      )}
      {waModalLead && <WhatsAppTemplateModal lead={waModalLead} onClose={() => setWAModalLead(null)} />}
      {duplicateAlertLead && <DuplicateAlert lead={duplicateAlertLead} onClose={() => setDuplicateAlertLead(null)} />}
      {mergeModal.primary && mergeModal.duplicates.length > 0 && (
        <MergeDuplicatesModal
          primary={mergeModal.primary}
          duplicates={mergeModal.duplicates}
          onClose={() => setMergeModal({ primary: null, duplicates: [] })}
          onMergeComplete={handleMergeComplete}
        />
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}
