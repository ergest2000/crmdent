import { useState, useMemo, useRef, useEffect } from "react";
import {
  MessageSquare, Send, Search, Users, GripVertical, BarChart3,
  Inbox as InboxIcon, Columns3, UserPlus, Phone, Mail,
} from "lucide-react";
import { staffMembers } from "@/lib/mock-data";
import {
  channelLabels, channelColors, leadStatusLabels, leadStatusColors,
} from "@/lib/leads-data";
import { useLeadStore, type LeadStatus, type Channel, type Lead } from "@/stores/lead-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { toast } from "@/hooks/use-toast";

type ViewTab = "inbox" | "pipeline" | "stats";

const pipelineStatuses: LeadStatus[] = ["new", "contacted", "consulting", "waiting", "converted", "lost"];
const allChannels: Channel[] = ["whatsapp", "facebook", "instagram", "email"];

export default function InboxPage() {
  const [view, setView] = useState<ViewTab>("inbox");
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const fetchLeads = useLeadStore((s) => s.fetchLeads);
  const loading = useLeadStore((s) => s.loading);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="p-6 space-y-5 max-w-7xl h-[calc(100vh-3rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Inbox & Lead Management</h1>
          <p className="text-sm text-muted-foreground">Mesazhe dhe leads nga të gjitha kanalet</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border/50 pb-px">
        {([
          { key: "inbox" as ViewTab, label: "Inbox", icon: InboxIcon },
          { key: "pipeline" as ViewTab, label: "Pipeline", icon: Columns3 },
          { key: "stats" as ViewTab, label: "Statistika", icon: BarChart3 },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors duration-150 border-b-2 -mb-px ${
              view === tab.key
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kërko lead ose mesazh..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as Channel | "all")}>
          <SelectTrigger className="h-9 w-[150px] text-sm">
            <SelectValue placeholder="Kanali" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha kanalet</SelectItem>
            {allChannels.map((ch) => (
              <SelectItem key={ch} value={ch}>{channelLabels[ch]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | "all")}>
          <SelectTrigger className="h-9 w-[150px] text-sm">
            <SelectValue placeholder="Statusi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha</SelectItem>
            {pipelineStatuses.map((s) => (
              <SelectItem key={s} value={s}>{leadStatusLabels[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Duke ngarkuar...</p>
        </div>
      ) : (
        <>
          {view === "inbox" && <InboxView search={search} channelFilter={channelFilter} statusFilter={statusFilter} />}
          {view === "pipeline" && <PipelineView search={search} channelFilter={channelFilter} />}
          {view === "stats" && <StatsView />}
        </>
      )}
    </div>
  );
}

/* ============ INBOX VIEW ============ */
function InboxView({ search, channelFilter, statusFilter }: { search: string; channelFilter: Channel | "all"; statusFilter: LeadStatus | "all" }) {
  const { leads, selectedLeadId, selectLead, getUnreadCount } = useLeadStore();
  const [reply, setReply] = useState("");

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
        (l.last_message || "").toLowerCase().includes(search.toLowerCase());
      const matchChannel = channelFilter === "all" || l.channel === channelFilter;
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchChannel && matchStatus;
    });
  }, [leads, search, channelFilter, statusFilter]);

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  return (
    <div className="flex rounded-card bg-card shadow-subtle overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
      <div className="w-80 border-r border-border/50 flex flex-col shrink-0">
        <div className="px-3 py-2 border-b border-border/50">
          <p className="text-xs text-muted-foreground">{filtered.length} biseda</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border/30">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Asnjë lead i gjetur. Leads krijohen automatikisht kur vijnë mesazhe nga webhook-et.
            </div>
          ) : filtered.map((lead) => {
            const unread = getUnreadCount(lead.id);
            const isSelected = selectedLeadId === lead.id;
            return (
              <button
                key={lead.id}
                onClick={() => selectLead(lead.id)}
                className={`w-full text-left px-3 py-3 transition-colors duration-100 ${
                  isSelected ? "bg-accent" : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground truncate">{lead.name}</span>
                      {unread > 0 && (
                        <span className="shrink-0 flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{lead.last_message || "—"}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${channelColors[lead.channel]}`}>
                      {channelLabels[lead.channel]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(lead.first_contact).toLocaleDateString("sq-AL", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedLead ? (
          <ChatPanel lead={selectedLead} reply={reply} setReply={setReply} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Zgjidhni një bisedë për ta parë</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ CHAT PANEL ============ */
function ChatPanel({ lead, reply, setReply }: { lead: Lead; reply: string; setReply: (v: string) => void }) {
  const { messages, addMessage, updateLeadStatus, assignLead, convertToPatient } = useLeadStore();
  const leadMessages = messages.filter((m) => m.lead_id === lead.id).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [leadMessages.length]);

  const handleSend = async () => {
    if (!reply.trim()) return;
    await addMessage(lead.id, reply.trim(), "outbound");
    setReply("");
  };

  const handleConvert = async () => {
    await convertToPatient(lead.id);
    toast({ title: "Lead i konvertuar", description: `${lead.name} u konvertua në pacient me sukses.` });
  };

  return (
    <>
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
            {lead.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{lead.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${channelColors[lead.channel]}`}>
                {channelLabels[lead.channel]}
              </span>
              <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${leadStatusColors[lead.status]}`}>
                {leadStatusLabels[lead.status]}
              </span>
              {lead.phone && <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{lead.phone}</span>}
              {lead.email && <span className="flex items-center gap-0.5"><Mail className="h-3 w-3" />{lead.email}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={lead.assigned_to || ""} onValueChange={(v) => assignLead(lead.id, v)}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Cakto stafit..." />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={lead.status} onValueChange={(v) => updateLeadStatus(lead.id, v as LeadStatus)}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pipelineStatuses.map((s) => (
                <SelectItem key={s} value={s}>{leadStatusLabels[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {lead.status !== "converted" && (
            <Button size="sm" variant="outline" className="gap-1 text-xs h-8" onClick={handleConvert}>
              <UserPlus className="h-3 w-3" />
              Konverto
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {leadMessages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Asnjë mesazh ende.</p>
        )}
        {leadMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={clinicalTransition}
            className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
              msg.direction === "outbound"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}>
              <p>{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.direction === "outbound" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {new Date(msg.timestamp).toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-border/50 flex items-center gap-2">
        <Input
          className="h-9 text-sm flex-1"
          placeholder="Shkruaj përgjigje..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button size="sm" className="gap-1.5 h-9" onClick={handleSend} disabled={!reply.trim()}>
          <Send className="h-3.5 w-3.5" />
          Dërgo
        </Button>
      </div>
    </>
  );
}

/* ============ PIPELINE VIEW ============ */
function PipelineView({ search, channelFilter }: { search: string; channelFilter: Channel | "all" }) {
  const { leads, updateLeadStatus } = useLeadStore();
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
      const matchChannel = channelFilter === "all" || l.channel === channelFilter;
      return matchSearch && matchChannel;
    });
  }, [leads, search, channelFilter]);

  const handleDrop = (status: LeadStatus) => {
    if (draggedLead) {
      updateLeadStatus(draggedLead, status);
      setDraggedLead(null);
    }
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ height: "calc(100vh - 280px)" }}>
      {pipelineStatuses.map((status) => {
        const statusLeads = filtered.filter((l) => l.status === status);
        return (
          <div
            key={status}
            className="min-w-[220px] w-[220px] flex flex-col rounded-card bg-muted/30 shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(status)}
          >
            <div className="px-3 py-2.5 border-b border-border/30">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${leadStatusColors[status]}`}>
                  {leadStatusLabels[status]}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{statusLeads.length}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              <AnimatePresence>
                {statusLeads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    draggable
                    onDragStart={() => setDraggedLead(lead.id)}
                    className="rounded-lg bg-card p-3 shadow-subtle cursor-grab active:cursor-grabbing border border-border/30 hover:shadow-interactive transition-shadow"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{lead.last_message || "—"}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${channelColors[lead.channel]}`}>
                            {channelLabels[lead.channel]}
                          </span>
                          {lead.assigned_to && (
                            <span className="text-[10px] text-muted-foreground">
                              {staffMembers.find((s) => s.id === lead.assigned_to)?.firstName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============ STATS VIEW ============ */
function StatsView() {
  const { leads } = useLeadStore();

  const byChannel = allChannels.map((ch) => ({
    channel: ch,
    label: channelLabels[ch],
    count: leads.filter((l) => l.channel === ch).length,
    converted: leads.filter((l) => l.channel === ch && l.status === "converted").length,
  }));

  const byStatus = pipelineStatuses.map((s) => ({
    status: s,
    label: leadStatusLabels[s],
    count: leads.filter((l) => l.status === s).length,
  }));

  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0";
  const today = new Date().toISOString().split("T")[0];
  const newToday = leads.filter((l) => l.first_contact.startsWith(today)).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Leads gjithsej", value: totalLeads },
          { label: "Leads të rinj sot", value: newToday },
          { label: "Të konvertuar", value: convertedLeads },
          { label: "Shkalla e konvertimit", value: `${conversionRate}%` },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...clinicalTransition, delay: i * 0.05 }}
            className="rounded-card bg-card p-4 shadow-subtle"
          >
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-card bg-card shadow-subtle">
          <div className="px-4 py-3 border-b border-border/50">
            <h3 className="text-sm font-medium text-foreground">Leads sipas kanalit</h3>
          </div>
          <div className="p-4 space-y-3">
            {byChannel.map((ch) => {
              const pct = totalLeads > 0 ? (ch.count / totalLeads) * 100 : 0;
              return (
                <div key={ch.channel}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${channelColors[ch.channel]}`}>
                      {ch.label}
                    </span>
                    <span className="text-sm tabular-nums font-mono text-foreground">{ch.count} <span className="text-muted-foreground text-xs">({ch.converted} konvertuar)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-card bg-card shadow-subtle">
          <div className="px-4 py-3 border-b border-border/50">
            <h3 className="text-sm font-medium text-foreground">Leads sipas statusit</h3>
          </div>
          <div className="p-4 space-y-2.5">
            {byStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between py-1.5">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${leadStatusColors[s.status]}`}>
                  {s.label}
                </span>
                <span className="text-sm font-medium tabular-nums font-mono text-foreground">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
