import { LandingHeader } from '../components/LandingHeader';
import { LandingFeatures } from '../components/LandingFeatures';
import { LandingPricing } from '../components/LandingPricing';
import { LandingHero } from '../components/LandingHero';
import { LandingStack } from '../components/LandingStack';
import { LandingFooter } from '../components/LandingFooter';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden">
      <LandingHeader />
      <LandingHero />
      <LandingStack />
      <LandingFeatures />
      <LandingPricing />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
