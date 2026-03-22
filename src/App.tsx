import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { useEffect } from "react";
import { usePatientStore } from "@/stores/patient-store";
import { useDoctorStore } from "@/stores/doctor-store";
import { useAppointmentStore } from "@/stores/appointment-store";
import { useTreatmentStore } from "@/stores/treatment-store";
import { useStaffStore } from "@/stores/staff-store";
import { useProductStore } from "@/stores/product-store";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DataLoader />
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            {/* Inbox disabled for now */}
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
            {/* Marketing disabled for now */}
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
