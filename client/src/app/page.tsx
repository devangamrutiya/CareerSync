import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ProductPreview } from '@/components/landing/ProductPreview';
import { TrustSection } from '@/components/landing/TrustSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white dark">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesGrid />
        <HowItWorks />
        <ProductPreview />
        <TrustSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
