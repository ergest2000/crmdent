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
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

function DataLoader() {
  const fetchPatients = usePatientStore((s) => s.fetchPatients);
  const fetchDoctors = useDoctorStore((s) => s.fetchDoctors);
  const fetchAppointments = useAppointmentStore((s) => s.fetchAppointments);
  const fetchTreatments = useTreatmentStore((s) => s.fetchTreatments);
  const fetchStaff = useStaffStore((s) => s.fetchStaff);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchAppointments();
    fetchTreatments();
    fetchStaff();
    fetchProducts();
  }, []);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold animate-pulse">D</div>
          <p className="text-sm text-muted-foreground">Duke ngarkuar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-sm text-muted-foreground">Duke ngarkuar...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthInitializer>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute><DataLoader /><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
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
        </AuthInitializer>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
