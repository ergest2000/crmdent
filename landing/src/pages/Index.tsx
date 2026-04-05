import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PainPointSection from "@/components/PainPointSection";
import FeaturesSection from "@/components/FeaturesSection";
import ModernClinicSection from "@/components/ModernClinicSection";
import FAQSection from "@/components/FAQSection";
import TrialSection from "@/components/TrialSection";
import FooterSection from "@/components/FooterSection";

const Index = () => (
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
);

export default Index;
