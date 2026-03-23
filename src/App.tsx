import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { usePatientStore } from "@/stores/patient-store";
import { useDoctorStore } from "@/stores/doctor-store";
import { useAppointmentStore } from "@/stores/appointment-store";
import { useTreatmentStore } from "@/stores/treatment-store";
import { useStaffStore } from "@/stores/staff-store";
import { useProductStore } from "@/stores/product-store";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import SuperAdminAnalytics from "./pages/super-admin/SuperAdminAnalytics";
import SuperAdminUsers from "./pages/super-admin/SuperAdminUsers";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import PatientIntakeForm from "./pages/PatientIntakeForm";
import Appointments from "./pages/Appointments";
import Treatments from "./pages/Treatments";
import Finance from "./pages/Finance";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import Staff from "./pages/Staff";
import SettingsPage from "./pages/SettingsPage";
import LeadsPage from "./pages/Leads";
import StockPage from "./pages/Stock";
import Doctors from "./pages/Doctors";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthInit() {
  const initialize = useAuthStore((s) => s.initialize);
  useEffect(() => { initialize(); }, []);
  return null;
}

function DataLoader() {
  const user = useAuthStore((s) => s.user);
  const fetchPatients = usePatientStore((s) => s.fetchPatients);
  const fetchDoctors = useDoctorStore((s) => s.fetchDoctors);
  const fetchAppointments = useAppointmentStore((s) => s.fetchAppointments);
  const fetchTreatments = useTreatmentStore((s) => s.fetchTreatments);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  useEffect(() => {
    if (user) { fetchPatients(); fetchDoctors(); fetchAppointments(); fetchTreatments(); fetchStaff(); fetchProducts(); }
  }, [user]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  if (!initialized) return <div className="min-h-screen flex items-center justify-center"><div className="text-center space-y-3"><div className="h-10 w-10 mx-auto rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">D</div><p className="text-sm text-muted-foreground">Duke ngarkuar...</p></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  if (!initialized) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RoleBasedDashboard() {
  const profile = useAuthStore((s) => s.profile);
  if (profile?.role === "super_admin") {
    return <Navigate to="/super-admin" replace />;
  }
  return <Dashboard />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthInit />
        <DataLoader />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<RoleBasedDashboard />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/analytics" element={<SuperAdminAnalytics />} />
            <Route path="/super-admin/users" element={<SuperAdminUsers />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/patients/:id" element={<PatientProfile />} />
            <Route path="/patients/:id/intake" element={<PatientIntakeForm />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/treatments" element={<Treatments />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
