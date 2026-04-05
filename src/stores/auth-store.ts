import {
  LayoutDashboard, Users, Calendar, Stethoscope, Receipt, Wallet, BarChart3,
  UserCog, Settings, Shield, UserPlus, Package, HeartPulse, LogOut, Building2,
  Activity, Globe,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const clinicNavItems = {
  dashboard: { title: "Paneli", url: "/app", icon: LayoutDashboard },
  leads: { title: "Leads", url: "/app/leads", icon: UserPlus },
  patients: { title: "Pacientët", url: "/app/patients", icon: Users },
  doctors: { title: "Dentistë", url: "/app/doctors", icon: HeartPulse },
  appointments: { title: "Kalendari i Takimeve", url: "/app/appointments", icon: Calendar },
  treatments: { title: "Trajtimet", url: "/app/treatments", icon: Stethoscope },
  finance: { title: "Financa", url: "/app/finance", icon: Wallet },
  invoices: { title: "Faturat", url: "/app/invoices", icon: Receipt },
  stock: { title: "Stoku i Produkteve", url: "/app/stock", icon: Package },
  reports: { title: "Raporte", url: "/app/reports", icon: BarChart3 },
  admin: { title: "Admin", url: "/app/admin", icon: Shield },
  staff: { title: "Stafi", url: "/app/staff", icon: UserCog },
  settings: { title: "Cilësimet", url: "/app/settings", icon: Settings },
};

const superAdminNavItems = [
  { title: "Dashboard Global", url: "/super-admin", icon: Globe },
  { title: "Analytics", url: "/super-admin/analytics", icon: Activity },
  { title: "Përdoruesit", url: "/super-admin/users", icon: Users },
];

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  clinic_admin: "Admin Klinike",
  doctor: "Doktor",
  receptionist: "Recepsionist",
  accountant: "Kontabilist",
  economist: "Ekonomist",
  manager: "Menaxher",
};

function NavGroup({ label, items }: { label: string; items: { title: string; url: string; icon: any }[] }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                <NavLink to={item.url} end className="flex items-center gap-3 rounded-inner px-3 py-1.5 text-sm text-sidebar-foreground/80 transition-all duration-150 hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-foreground font-medium">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);

  const filterItems = (keys: string[]) =>
    keys.filter((k) => !profile || hasPermission(k)).map((k) => (clinicNavItems as any)[k]).filter(Boolean);

  const isSA = isSuperAdmin();

  const mainNav = isSA ? [] : filterItems(["dashboard", "leads", "patients", "doctors", "appointments", "treatments"]);
  const financeNav = isSA ? [] : filterItems(["finance", "invoices", "stock", "reports"]);
  const adminNav = isSA ? [] : filterItems(["admin", "staff", "settings"]);

  return (
    <Sidebar collapsible="icon" className="shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.05)]">
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-inner bg-primary text-primary-foreground text-sm font-semibold">D</div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-foreground">DenteOS</p>
              <p className="text-[11px] text-muted-foreground">
                {isSA ? "Super Admin Panel" : "Klinika Dentare"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {isSA && <NavGroup label="Platform" items={superAdminNavItems} />}
        {!isSA && <NavGroup label="Kryesore" items={mainNav} />}
        {!isSA && financeNav.length > 0 && <NavGroup label="Financa" items={financeNav} />}
        {!isSA && adminNav.length > 0 && <NavGroup label="Admin" items={adminNav} />}
      </SidebarContent>
      <SidebarFooter className="px-3 py-3 space-y-2">
        {!collapsed && profile && (
          <div className="flex items-center gap-2 px-1">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
              {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{profile.full_name || profile.email}</p>
              <p className="text-[10px] text-muted-foreground truncate">{roleLabels[profile.role] || profile.role}</p>
            </div>
          </div>
        )}
        <button onClick={() => logout()} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
          <LogOut className="h-3.5 w-3.5" />
          {!collapsed && <span>Dil nga llogaria</span>}
        </button>
        {!collapsed && <p className="text-[11px] text-muted-foreground px-1">© 2026 DenteOS v1.0</p>}
      </SidebarFooter>
    </Sidebar>
  );
}
