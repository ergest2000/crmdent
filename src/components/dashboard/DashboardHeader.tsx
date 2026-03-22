import { useState } from "react";
import { Search, Plus, Bell, Settings, Check, Calendar, UserPlus, Receipt, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const dayNames = ["E diel", "E hënë", "E martë", "E mërkurë", "E enjte", "E premte", "E shtunë"];
const monthNames = ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"];

function formatDateAlbanian(date: Date): string {
  const day = dayNames[date.getDay()];
  const d = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}, ${d} ${month} ${year}`;
}

interface Notification {
  id: string;
  icon: typeof Bell;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success";
}

const initialNotifications: Notification[] = [
  { id: "1", icon: UserPlus, title: "Lead i ri", description: "Erjon Hoxha u shtua si lead nga WhatsApp", time: "5 min më parë", read: false, type: "info" },
  { id: "2", icon: Calendar, title: "Termin i ri", description: "Rezervim i ri për nesër ora 10:00", time: "15 min më parë", read: false, type: "info" },
  { id: "3", icon: Package, title: "Stok i ulët", description: "Doreza latex kanë mbetur vetëm 12 copë", time: "1 orë më parë", read: false, type: "warning" },
  { id: "4", icon: Receipt, title: "Faturë e paguar", description: "Fatura #INV-0042 u pagua plotësisht", time: "2 orë më parë", read: false, type: "success" },
  { id: "5", icon: AlertTriangle, title: "Termin i anuluar", description: "Arta Mema anuloi terminin e datës 17 Mars", time: "3 orë më parë", read: true, type: "warning" },
  { id: "6", icon: UserPlus, title: "Pacient i ri", description: "Bledar Kasa u regjistrua si pacient i ri", time: "5 orë më parë", read: true, type: "info" },
];

export function DashboardHeader() {
  const navigate = useNavigate();
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Mirëmëngjesi" : now.getHours() < 18 ? "Mirëdita" : "Mirëmbrëma";
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const typeColors: Record<string, string> = {
    info: "text-primary bg-primary/10",
    warning: "text-destructive bg-destructive/10",
    success: "text-status-completed bg-status-completed/10",
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-foreground shrink-0">Dashboard</h1>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kërko çdo gjë këtu..."
            className="pl-9 h-9 bg-muted/50 border-border/50 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="icon" className="h-8 w-8 rounded-full" onClick={() => navigate("/appointments")}>
            <Plus className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full relative">
                <Bell className="h-4 w-4 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <h4 className="text-sm font-semibold text-foreground">Njoftimet</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-primary hover:underline flex items-center gap-1">
                    <Check className="h-3 w-3" /> Lexo të gjitha
                  </button>
                )}
              </div>
              <div className="max-h-[360px] overflow-y-auto divide-y divide-border/50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">Nuk ka njoftime</div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 ${!n.read ? "bg-primary/5" : ""}`}
                    >
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${typeColors[n.type]}`}>
                        <n.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm truncate ${!n.read ? "font-semibold text-foreground" : "text-foreground"}`}>{n.title}</p>
                          {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => navigate("/settings")}>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Button>
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/50">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
              AD
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground leading-none">Admin</p>
              <p className="text-[10px] text-muted-foreground">Super admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div>
        <h2 className="text-base font-semibold text-foreground">{greeting}, Admin!</h2>
        <p className="text-sm text-muted-foreground">{formatDateAlbanian(now)}</p>
      </div>
    </div>
  );
}
