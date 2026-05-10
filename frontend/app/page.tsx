import { HeroSection } from '@/components/HeroSection';
import { StorySection } from '@/components/StorySection';
import { GlobeSection } from '@/components/GlobeSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { TimelineSection } from '@/components/TimelineSection';
import { PremiumSection } from '@/components/PremiumSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { FinalCTASection, Footer } from '@/components/FinalCTASection';
import { CustomCursor } from '@/components/CustomCursor';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <main className="bg-obsidian min-h-screen text-white">
      <CustomCursor />
      <Navbar />
      <HeroSection />
      <StorySection />
      <GlobeSection />
      <FeaturesSection />
      <TimelineSection />
      <PremiumSection />
      <TestimonialsSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
