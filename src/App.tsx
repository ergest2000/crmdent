import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { useAuthStore } from "@/stores/auth-store";
import LandingPage from "./landing/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InboxPage from "./pages/Inbox";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import PatientIntakeForm from "./pages/PatientIntakeForm";
import Appointments from "./pages/Appointments";
import Treatments from "./pages/Treatments";
import Finance from "./pages/Finance";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import Marketing from "./pages/Marketing";
import Staff from "./pages/Staff";
import SettingsPage from "./pages/SettingsPage";
import LeadsPage from "./pages/Leads";
import StockPage from "./pages/Stock";
import Doctors from "./pages/Doctors";
import NotFound from "./pages/NotFound";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import SuperAdminAnalytics from "./pages/super-admin/SuperAdminAnalytics";
import SuperAdminUsers from "./pages/super-admin/SuperAdminUsers";

const queryClient = new QueryClient();

// Ne /app: super_admin ridrejtohet te paneli i vet; te tjeret shohin Dashboard-in e klinikes
function AppIndex() {
  const initialized = useAuthStore((s) => s.initialized);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  if (initialized && isSuperAdmin()) return <Navigate to="/super-admin" replace />;
  return <Dashboard />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Pjesa e klinikes */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<AppIndex />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="patients" element={<Patients />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route path="patients/:id/intake" element={<PatientIntakeForm />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="treatments" element={<Treatments />} />
            <Route path="finance" element={<Finance />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin" element={<Admin />} />
            <Route path="staff" element={<Staff />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Pjesa e super-admin-it (menaxhim klinikash + usera + statistika) */}
          <Route path="/super-admin" element={<AppLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="analytics" element={<SuperAdminAnalytics />} />
            <Route path="users" element={<SuperAdminUsers />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
