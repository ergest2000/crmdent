import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Filter, Edit, Trash2, Eye, UserCheck, Phone, Mail, MessageSquare } from "lucide-react";
import { ExportMenu } from "@/components/ExportMenu";
import { exportPDF, exportCSV } from "@/lib/export-utils";
import { useLeadStore, type Lead, type LeadStatus, type Channel } from "@/stores/lead-store";
import { usePatientStore } from "@/stores/patient-store";
import { staffMembers } from "@/lib/mock-data";
import { channelLabels, channelColors, leadStatusLabels, leadStatusColors } from "@/lib/leads-data";
import { LeadDialog } from "@/components/LeadDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const allStatuses: LeadStatus[] = ["new", "contacted", "consulting", "waiting", "converted", "lost"];
const allChannels: Channel[] = ["whatsapp", "facebook", "instagram", "email", "referral" as Channel];

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);

  const { leads, loading, fetchLeads, messages, fetchMessages, updateLeadStatus, convertToPatient } = useLeadStore();
  const addPatient = usePatientStore((s) => s.addPatient);

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
        (l.phone || "").includes(search) ||
        (l.email || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      const matchChannel = channelFilter === "all" || l.channel === channelFilter;
      return matchSearch && matchStatus && matchChannel;
    });
  }, [leads, search, statusFilter, channelFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("leads").delete().eq("id", deleteId);
    if (!error) {
      toast({ title: "Lead u fshi" });
      fetchLeads();
    }
    setDeleteId(null);
  };

  const handleConvert = async (lead: Lead) => {
    const nameParts = lead.name.split(" ");
    const firstName = nameParts[0] || lead.name;
    const lastName = nameParts.slice(1).join(" ") || "";

    addPatient({
      firstName,
      lastName,
      dateOfBirth: "",
      phone: lead.phone || "",
      email: lead.email || "",
      allergies: [],
      status: "active",
      lastVisit: new Date().toISOString().split("T")[0],
      balance: 0,
    });

    await convertToPatient(lead.id);
    toast({ title: `${lead.name} u konvertua në pacient!` });
    setViewLead(null);
  };

  const handleViewLead = (lead: Lead) => {
    setViewLead(lead);
    fetchMessages(lead.id);
  };

  const leadMessages = useMemo(() => {
    if (!viewLead) return [];
    return messages.filter((m) => m.lead_id === viewLead.id).sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [messages, viewLead]);

  // Stats
  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    consulting: leads.filter((l) => l.status === "consulting").length,
    converted: leads.filter((l) => l.status === "converted").length,
    lost: leads.filter((l) => l.status === "lost").length,
  }), [leads]);

  const getStaffName = (id: string | null) => {
    if (!id) return "—";
    const s = staffMembers.find((st) => st.id === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  return (
    <div className="p-6 space-y-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground">{leads.length} kontakte potenciale</p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            onExportPDF={() => {
              const config = { title: "Leads", filename: "leads", columns: [
                { header: "Emri", key: "name" }, { header: "Telefoni", key: "phone" }, { header: "Email", key: "email" }, { header: "Platforma", key: "channel" }, { header: "Statusi", key: "status" }, { header: "Data", key: "date" },
              ], data: filtered.map((l) => ({ name: l.name, phone: l.phone || "—", email: l.email || "—", channel: channelLabels[l.channel], status: leadStatusLabels[l.status], date: new Date(l.created_at).toLocaleDateString("sq-AL") })) };
              exportPDF(config);
            }}
            onExportCSV={() => {
              const config = { title: "Leads", filename: "leads", columns: [
                { header: "Emri", key: "name" }, { header: "Telefoni", key: "phone" }, { header: "Email", key: "email" }, { header: "Platforma", key: "channel" }, { header: "Statusi", key: "status" }, { header: "Data", key: "date" },
              ], data: filtered.map((l) => ({ name: l.name, phone: l.phone || "—", email: l.email || "—", channel: channelLabels[l.channel], status: leadStatusLabels[l.status], date: new Date(l.created_at).toLocaleDateString("sq-AL") })) };
              exportCSV(config);
            }}
          />
          <Button size="sm" className="gap-1.5" onClick={() => { setEditLead(null); setDialogOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> Shto Lead
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { label: "Totali", value: stats.total, color: "text-foreground" },
          { label: "Të rinj", value: stats.new, color: "text-blue-600" },
          { label: "Kontaktuar", value: stats.contacted, color: "text-amber-600" },
          { label: "Konsultim", value: stats.consulting, color: "text-purple-600" },
          { label: "Konvertuar", value: stats.converted, color: "text-emerald-600" },
          { label: "Humbur", value: stats.lost, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="rounded-card bg-card shadow-subtle p-3 text-center">
            <p className={`text-lg font-semibold font-mono ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Kërko me emër, telefon ose email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | "all")}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Statusi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha</SelectItem>
            {allStatuses.map((s) => (
              <SelectItem key={s} value={s}>{leadStatusLabels[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as Channel | "all")}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Platforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha</SelectItem>
            {allChannels.map((ch) => (
              <SelectItem key={ch} value={ch}>{channelLabels[ch]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-card bg-card shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Duke ngarkuar...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Kontakti</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Telefon / Email</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Platforma</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Statusi</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Përgjegjës</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Data</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((lead, i) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...clinicalTransition, delay: i * 0.02 }}
                  className="hover:bg-muted/30 transition-colors duration-150 cursor-pointer group"
                  onClick={() => handleViewLead(lead)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <p className="text-sm font-medium text-foreground">{lead.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {lead.phone && <p className="text-sm text-foreground flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{lead.phone}</p>}
                    {lead.email && <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</p>}
                    {!lead.phone && !lead.email && <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${channelColors[lead.channel]}`}>
                      {channelLabels[lead.channel]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${leadStatusColors[lead.status]}`}>
                      {leadStatusLabels[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{getStaffName(lead.assigned_to)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(lead.created_at).toLocaleDateString("sq-AL")}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); handleViewLead(lead); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Shiko">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setEditLead(lead); setDialogOpen(true); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edito">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      {lead.status !== "converted" && (
                        <button onClick={(e) => { e.stopPropagation(); handleConvert(lead); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-emerald-600 transition-colors" title="Konverto në Pacient">
                          <UserCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(lead.id); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" title="Fshi">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">Nuk u gjet asnjë lead.</div>
        )}
      </div>

      {/* Lead Dialog */}
      <LeadDialog open={dialogOpen} onOpenChange={setDialogOpen} editLead={editLead} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmo fshirjen</AlertDialogTitle>
            <AlertDialogDescription>Jeni i sigurt që doni të fshini këtë lead? Ky veprim nuk mund të kthehet.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Fshi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Lead Profile */}
      <Dialog open={!!viewLead} onOpenChange={(v) => { if (!v) setViewLead(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {viewLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {viewLead.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-base">{viewLead.name}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      {channelLabels[viewLead.channel]} · {new Date(viewLead.created_at).toLocaleDateString("sq-AL")}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* Lead info */}
              <div className="grid grid-cols-2 gap-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">Telefoni</p>
                  <p className="text-sm text-foreground">{viewLead.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{viewLead.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Statusi</p>
                  <Select value={viewLead.status} onValueChange={(v) => {
                    updateLeadStatus(viewLead.id, v as LeadStatus);
                    setViewLead({ ...viewLead, status: v as LeadStatus });
                  }}>
                    <SelectTrigger className="h-8 text-xs w-[160px] mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {allStatuses.map((s) => (
                        <SelectItem key={s} value={s}>{leadStatusLabels[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Përgjegjës</p>
                  <p className="text-sm text-foreground">{getStaffName(viewLead.assigned_to)}</p>
                </div>
                {viewLead.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Shënime</p>
                    <p className="text-sm text-foreground">{viewLead.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 py-2">
                <Button size="sm" variant="outline" onClick={() => { setViewLead(null); setEditLead(viewLead); setDialogOpen(true); }}>
                  <Edit className="h-3.5 w-3.5 mr-1.5" /> Edito
                </Button>
                {viewLead.status !== "converted" && (
                  <Button size="sm" onClick={() => handleConvert(viewLead)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                    <UserCheck className="h-3.5 w-3.5" /> Konverto në Pacient
                  </Button>
                )}
                {viewLead.status === "converted" && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md">
                    <UserCheck className="h-3.5 w-3.5" /> I konvertuar në pacient
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="border-t border-border/50 pt-4 mt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Historiku i komunikimit ({leadMessages.length})</p>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {leadMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-lg px-3 py-2 ${
                        msg.direction === "outbound" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.direction === "outbound" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {new Date(msg.timestamp).toLocaleString("sq-AL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {leadMessages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nuk ka mesazhe ende.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
