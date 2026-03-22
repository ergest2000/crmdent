import { useEffect, useMemo } from "react";
import { useLeadStore } from "@/stores/lead-store";
import { MessageSquare, Mail, Phone } from "lucide-react";
import type { FullPatient } from "@/stores/patient-store";

const channelIcons: Record<string, React.ReactNode> = {
  whatsapp: <Phone className="h-3.5 w-3.5 text-emerald-600" />,
  email: <Mail className="h-3.5 w-3.5 text-blue-600" />,
  facebook: <MessageSquare className="h-3.5 w-3.5 text-blue-500" />,
  instagram: <MessageSquare className="h-3.5 w-3.5 text-pink-500" />,
};

const channelLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  facebook: "Facebook",
  instagram: "Instagram",
};

interface Props {
  patient: FullPatient;
}

export function PatientCommunication({ patient }: Props) {
  const { leads, messages, fetchLeads, fetchMessages } = useLeadStore();

  // Find linked leads by phone or email
  const linkedLeads = useMemo(() => {
    return leads.filter((l) => {
      if (patient.phone && l.phone && l.phone.replace(/\s/g, "").includes(patient.phone.replace(/\s/g, ""))) return true;
      if (patient.email && l.email && l.email.toLowerCase() === patient.email.toLowerCase()) return true;
      return false;
    });
  }, [leads, patient.phone, patient.email]);

  useEffect(() => {
    if (leads.length === 0) fetchLeads();
  }, []);

  useEffect(() => {
    linkedLeads.forEach((l) => fetchMessages(l.id));
  }, [linkedLeads.length]);

  const linkedMessages = useMemo(() => {
    const leadIds = new Set(linkedLeads.map((l) => l.id));
    return messages
      .filter((m) => leadIds.has(m.lead_id))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messages, linkedLeads]);

  if (linkedLeads.length === 0) {
    return (
      <div className="rounded-card bg-card shadow-subtle p-8 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Nuk ka komunikim të lidhur me këtë pacient.</p>
        <p className="text-xs text-muted-foreground mt-1">Mesazhet lidhen automatikisht përmes telefonit ose email-it.</p>
      </div>
    );
  }

  return (
    <div className="rounded-card bg-card shadow-subtle p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Historiku i Komunikimit</h3>
        <span className="text-xs text-muted-foreground">{linkedMessages.length} mesazhe</span>
      </div>

      {/* Channel summary */}
      <div className="flex gap-2">
        {linkedLeads.map((l) => (
          <div key={l.id} className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs">
            {channelIcons[l.channel]}
            <span className="text-foreground font-medium">{channelLabels[l.channel]}</span>
            <span className="text-muted-foreground">· {l.name}</span>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {linkedMessages.map((msg) => {
          const lead = linkedLeads.find((l) => l.id === msg.lead_id);
          const isOutbound = msg.direction === "outbound";
          return (
            <div key={msg.id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 ${
                isOutbound ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  {channelIcons[msg.channel]}
                  <span className="text-[10px] opacity-70">{channelLabels[msg.channel]}</span>
                </div>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isOutbound ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.timestamp).toLocaleString("sq-AL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        {linkedMessages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Nuk ka mesazhe ende.</p>
        )}
      </div>
    </div>
  );
}
