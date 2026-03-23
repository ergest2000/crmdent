import { useState, useEffect } from "react";
import { Users, Search, Building2, Shield } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  clinic_id: string | null;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  clinic_admin: "Admin Klinike",
  doctor: "Doktor",
  receptionist: "Recepsionist",
  accountant: "Kontabilist",
  economist: "Ekonomist",
  manager: "Menaxher",
};

const roleColors: Record<string, string> = {
  super_admin: "bg-violet-100 text-violet-700",
  clinic_admin: "bg-blue-100 text-blue-700",
  doctor: "bg-emerald-100 text-emerald-700",
  receptionist: "bg-yellow-100 text-yellow-700",
  accountant: "bg-orange-100 text-orange-700",
  economist: "bg-teal-100 text-teal-700",
  manager: "bg-indigo-100 text-indigo-700",
};

export default function SuperAdminUsers() {
  const { clinics } = useAuthStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterClinic, setFilterClinic] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data as UserProfile[]);
    setLoading(false);
  };

  const getClinicName = (clinicId: string | null) => {
    if (!clinicId) return "Global";
    return clinics.find((c) => c.id === clinicId)?.name || "—";
  };

  const filtered = users.filter((u) => {
    const matchSearch = search === "" ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchClinic = filterClinic === "all" || u.clinic_id === filterClinic || (filterClinic === "global" && !u.clinic_id);
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchClinic && matchRole;
  });

  return (
    <div className="p-5 space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Menaxhimi i Përdoruesve
        </h1>
        <p className="text-sm text-muted-foreground">Të gjithë përdoruesit e platformës — {users.length} totale</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kërko emrin ose email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={filterClinic} onValueChange={setFilterClinic}>
          <SelectTrigger className="h-9 text-sm w-48">
            <SelectValue placeholder="Filtro klinikën" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha klinikat</SelectItem>
            <SelectItem value="global">Global (pa klinikë)</SelectItem>
            {clinics.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="h-9 text-sm w-40">
            <SelectValue placeholder="Filtro rolin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjithë rolet</SelectItem>
            {Object.entries(roleLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-card bg-card shadow-subtle overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Përdoruesi</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Email</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Roli</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Klinika</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Regjistruar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">Duke ngarkuar...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">Nuk u gjetën përdorues.</td></tr>
            ) : (
              filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...clinicalTransition, delay: i * 0.02 }}
                  className="hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="text-sm font-medium">{u.full_name || "Pa emër"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${roleColors[u.role] || "bg-muted text-muted-foreground"}`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {u.clinic_id ? <Building2 className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                      {getClinicName(u.clinic_id)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("sq-AL") : "—"}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
