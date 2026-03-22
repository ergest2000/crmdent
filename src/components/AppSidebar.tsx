import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Receipt,
  Wallet,
  BarChart3,
  Megaphone,
  UserCog,
  Settings,
  Inbox,
  Shield,
  UserPlus,
  Package,
  HeartPulse,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Paneli", url: "/", icon: LayoutDashboard },
  { title: "Leads", url: "/leads", icon: UserPlus },
  { title: "Pacientët", url: "/patients", icon: Users },
  { title: "Dentistë", url: "/doctors", icon: HeartPulse },
  { title: "Kalendari i Takimeve", url: "/appointments", icon: Calendar },
  { title: "Trajtimet", url: "/treatments", icon: Stethoscope },
];

const financeNav = [
  { title: "Financa", url: "/finance", icon: Wallet },
  { title: "Faturat", url: "/invoices", icon: Receipt },
  { title: "Stoku i Produkteve", url: "/stock", icon: Package },
  { title: "Raporte", url: "/reports", icon: BarChart3 },
];

const adminNav = [
  { title: "Admin", url: "/admin", icon: Shield },
  { title: "Stafi", url: "/staff", icon: UserCog },
  { title: "Cilësimet", url: "/settings", icon: Settings },
];

function NavGroup({ label, items }: { label: string; items: typeof mainNav }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                <NavLink
                  to={item.url}
                  end
                  className="flex items-center gap-3 rounded-inner px-3 py-1.5 text-sm text-sidebar-foreground/80 transition-all duration-150 hover:bg-sidebar-accent"
                  activeClassName="bg-sidebar-accent text-foreground font-medium"
                >
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

  return (
    <Sidebar collapsible="icon" className="shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.05)]">
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-inner bg-primary text-primary-foreground text-sm font-semibold">
            D
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-foreground">DenteOS</p>
              <p className="text-[11px] text-muted-foreground">Klinika Dentare</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavGroup label="Kryesore" items={mainNav} />
        <NavGroup label="Financa" items={financeNav} />
        <NavGroup label="Admin" items={adminNav} />
      </SidebarContent>
      <SidebarFooter className="px-3 py-3 space-y-2">
        {!collapsed && profile && (
          <div className="flex items-center gap-2 px-1">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
              {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{profile.full_name || profile.email}</p>
              <p className="text-[10px] text-muted-foreground truncate capitalize">{profile.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          {!collapsed && <span>Dil nga llogaria</span>}
        </button>
        {!collapsed && (
          <p className="text-[11px] text-muted-foreground px-1">© 2026 DenteOS v1.0</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
