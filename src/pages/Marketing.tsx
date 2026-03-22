import { useState } from "react";
import {
  Megaphone, Send, Mail, MessageSquare, Plus, Search,
  Eye, Pause, Play, Copy, ChevronDown,
} from "lucide-react";
import {
  campaigns, reminders, messageTemplates,
  statusLabels, campaignTypeLabels, reminderTypeLabels, templateCategoryLabels,
} from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MarketingTab = "campaigns" | "reminders" | "templates";

export default function Marketing() {
  const [tab, setTab] = useState<MarketingTab>("campaigns");
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Marketing & Komunikim</h1>
          <p className="text-sm text-muted-foreground">Fushata, kujtesa dhe shabllone</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          {tab === "campaigns" ? "Fushatë e re" : tab === "reminders" ? "Kujtesë e re" : "Shabllon i ri"}
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Fushata aktive", value: campaigns.filter(c => c.status === "active").length, detail: `${campaigns.length} gjithsej` },
          { label: "Mesazhe dërguar", value: campaigns.reduce((s, c) => s + c.sentCount, 0), detail: "total" },
          { label: "Hapje mesatare", value: `${Math.round(campaigns.filter(c => c.sentCount > 0).reduce((s, c) => s + c.openRate, 0) / campaigns.filter(c => c.sentCount > 0).length)}%`, detail: "open rate" },
          { label: "Konvertime", value: campaigns.reduce((s, c) => s + c.conversions, 0), detail: "rezervime" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...clinicalTransition, delay: i * 0.05 }}
            className="rounded-card bg-card p-4 shadow-subtle"
          >
            <div className="flex items-center justify-between mb-3">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{stat.detail}</span>
            </div>
            <p className="text-2xl font-semibold tabular-nums font-mono text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/50 pb-px">
        {([
          { key: "campaigns", label: "Fushatat", count: campaigns.length },
          { key: "reminders", label: "Kujtesat", count: reminders.length },
          { key: "templates", label: "Shabllonët", count: messageTemplates.length },
        ] as { key: MarketingTab; label: string; count: number }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch(""); }}
            className={`px-3 py-2 text-sm transition-colors duration-150 border-b-2 -mb-px ${
              tab === t.key
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} <span className="text-xs text-muted-foreground">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Campaigns */}
      {tab === "campaigns" && (
        <div className="rounded-card bg-card shadow-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Fushata</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Tipi</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Segmenti</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Dërguar</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Hapje %</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Klikime %</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Konvertime</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Statusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {campaigns.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...clinicalTransition, delay: i * 0.03 }}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.startDate}{c.endDate ? ` → ${c.endDate}` : ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      {c.type === "sms" ? <MessageSquare className="h-3 w-3" /> : c.type === "email" ? <Mail className="h-3 w-3" /> : <Send className="h-3 w-3" />}
                      {campaignTypeLabels[c.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{c.segment}</td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-foreground">{c.sentCount}</td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-foreground">{c.openRate > 0 ? `${c.openRate}%` : "—"}</td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-foreground">{c.clickRate > 0 ? `${c.clickRate}%` : "—"}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-foreground">{c.conversions}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reminders */}
      {tab === "reminders" && (
        <div className="rounded-card bg-card shadow-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Pacienti</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Tipi</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Kanali</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Data</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Mesazhi</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Statusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {reminders.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...clinicalTransition, delay: i * 0.03 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{r.patientName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                      {reminderTypeLabels[r.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      {r.channel === "sms" ? <MessageSquare className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                      {r.channel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm tabular-nums text-foreground">{r.scheduledDate}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{r.message}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Templates */}
      {tab === "templates" && (
        <div className="grid grid-cols-2 gap-4">
          {messageTemplates.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...clinicalTransition, delay: i * 0.03 }}
              className="rounded-card bg-card p-4 shadow-subtle hover:shadow-interactive transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {tpl.channel === "sms" ? <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" /> : <Mail className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span className="text-sm font-medium text-foreground">{tpl.name}</span>
                </div>
                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                  {templateCategoryLabels[tpl.category]}
                </span>
              </div>
              {tpl.subject && (
                <p className="text-xs text-muted-foreground mb-1">Subjekt: {tpl.subject}</p>
              )}
              <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">{tpl.body}</p>
              <div className="flex items-center gap-2 mt-3">
                <Button variant="outline" size="sm" className="gap-1 text-xs h-7">
                  <Copy className="h-3 w-3" />
                  Kopjo
                </Button>
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                  <Eye className="h-3 w-3" />
                  Shiko
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
