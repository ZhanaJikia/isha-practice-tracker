import { CtaSection } from "@/app/components/welcome/CtaSection";
import { FeaturesSection } from "@/app/components/welcome/FeaturesSection";
import { HeroSection } from "@/app/components/welcome/HeroSection";
import { PointsSection } from "@/app/components/welcome/PointsSection";
import { PracticePreviewSection } from "@/app/components/welcome/PracticePreviewSection";
import { WelcomeFooter } from "@/app/components/welcome/WelcomeFooter";
import { WelcomeNav } from "@/app/components/welcome/WelcomeNav";

export default function WelcomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#060e07", color: "white" }}>
      <WelcomeNav />
      <HeroSection />
      <PracticePreviewSection />
      <FeaturesSection />
      <PointsSection />
      <CtaSection />
      <WelcomeFooter />
    </div>
  );
}
