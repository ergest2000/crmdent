import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import PainPointSection from "./components/PainPointSection";
import FeaturesSection from "./components/FeaturesSection";
import ModernClinicSection from "./components/ModernClinicSection";
import FAQSection from "./components/FAQSection";
import TrialSection from "./components/TrialSection";
import FooterSection from "./components/FooterSection";
import { LanguageProvider } from "./contexts/LanguageContext";

const LandingPage = () => (
  <LanguageProvider>
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <PainPointSection />
      <FeaturesSection />
      <ModernClinicSection />
      <FAQSection />
      <TrialSection />
      <FooterSection />
    </div>
  </LanguageProvider>
);

export default LandingPage;
