import { LandingHeader } from '../components/LandingHeader';
import { LandingHero } from '../components/LandingHero';
import { LandingCoreFeatures } from '../components/LandingCoreFeatures';
import { LandingMoreFeatures } from '../components/LandingMoreFeatures';
import { LandingTestimonials } from '../components/LandingTestimonials';
import { LandingPricing } from '../components/LandingPricing';
import { LandingCTA } from '../components/LandingCTA';
import { LandingFooter } from '../components/LandingFooter';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-500/30 overflow-x-hidden">
      <LandingHeader />
      <LandingHero />
      <LandingCoreFeatures />
      <LandingMoreFeatures />
      <LandingTestimonials />
      <LandingPricing />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
