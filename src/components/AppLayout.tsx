import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useDoctorStore } from "@/stores/doctor-store";
import { usePatientStore } from "@/stores/patient-store";
import { useStaffStore } from "@/stores/staff-store";
import { useTreatmentStore } from "@/stores/treatment-store";
import { useAppointmentStore } from "@/stores/appointment-store";
import { useProductStore } from "@/stores/product-store";
import { useAuthStore } from "@/stores/auth-store";

export function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  const fetchDoctors = useDoctorStore((s) => s.fetchDoctors);
  const fetchPatients = usePatientStore((s) => s.fetchPatients);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);
  const fetchTreatments = useTreatmentStore((s) => s.fetchTreatments);
  const fetchAppointments = useAppointmentStore((s) => s.fetchAppointments);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  // Redirect to login when user logs out
  useEffect(() => {
    if (initialized && !user) {
      navigate("/login");
    }
  }, [user, initialized]);

  // Fetch all data on mount
  useEffect(() => {
    fetchDoctors();
    fetchPatients();
    fetchStaff();
    fetchTreatments();
    fetchAppointments();
    fetchProducts();
  }, []);

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
