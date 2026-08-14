import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDoctorStore } from "@/stores/doctor-store";
import { usePatientStore } from "@/stores/patient-store";
import { useStaffStore } from "@/stores/staff-store";
import { useTreatmentStore } from "@/stores/treatment-store";
import { useAppointmentStore } from "@/stores/appointment-store";
import { useProductStore } from "@/stores/product-store";
import { useAuthStore } from "@/stores/auth-store";

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const initialize = useAuthStore((s) => s.initialize);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const permissions = useAuthStore((s) => s.permissions);
  const profile = useAuthStore((s) => s.profile);

  const fetchDoctors = useDoctorStore((s) => s.fetchDoctors);
  const fetchPatients = usePatientStore((s) => s.fetchPatients);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);
  const fetchTreatments = useTreatmentStore((s) => s.fetchTreatments);
  const fetchAppointments = useAppointmentStore((s) => s.fetchAppointments);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  // Inicializo auth-in nje here: ngarkon profilin/rolin dhe regjistron onAuthStateChange.
  // (Pa kete, profili/roli s'lexohej kurre ne store.)
  useEffect(() => {
    if (!initialized) initialize();
  }, [initialized]);

  // Guard: ridrejto te /login kur s'ka sesion
  useEffect(() => {
    if (initialized && !user) navigate("/login");
  }, [user, initialized]);

  // Guard i aksesit: nëse stafi hap një modul pa leje (edhe me URL direkte),
  // ridrejto te Paneli. Adminët kanë akses të plotë (hasPermission i lejon).
  useEffect(() => {
    if (!initialized || !user || !profile) return;
    const path = location.pathname.replace(/\/+$/, "");
    if (path.startsWith("/super-admin")) return; // menaxhohet nga roli super_admin
    let key = "dashboard";
    if (path.startsWith("/app/")) key = path.slice("/app/".length).split("/")[0];
    if (!hasPermission(key)) navigate("/app", { replace: true });
  }, [location.pathname, initialized, user, profile, permissions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch te dhenat ne mount (RLS i izolon sipas kliniks)
  useEffect(() => {
    fetchDoctors();
    fetchPatients();
    fetchStaff();
    fetchTreatments();
    fetchAppointments();
    fetchProducts();
  }, []);

  // Prit sa te inicializohet auth-i (shmang flash-in)
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border/50 bg-background px-4">
            <SidebarTrigger className="mr-4" />
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
