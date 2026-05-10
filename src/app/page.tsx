import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { MissionSection } from "@/components/home/MissionSection";
import { ConsultantsSection } from "@/components/home/ConsultantsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <MissionSection />
      <ConsultantsSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
