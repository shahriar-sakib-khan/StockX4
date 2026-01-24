import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LandingPricing = () => {
    return (
        <div id="pricing" className="py-32 bg-muted/20 border-t border-border/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                   <h2 className="text-4xl font-black mb-4">Simple Pricing</h2>
                   <p className="text-muted-foreground text-lg">No hidden costs. Just pure code.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Hobby */}
                    <div className="p-10 rounded-[2rem] bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-2xl flex flex-col">
                        <h3 className="font-bold text-lg text-muted-foreground mb-4">Hobby</h3>
                        <div className="text-5xl font-black mb-8">$0</div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {['5 Projects', 'Community Support', 'Basic Analytics'].map(i => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium"><Check className="w-4 h-4 text-primary" /> {i}</li>
                            ))}
                        </ul>
                        <Button variant="secondary" className="w-full py-6 rounded-xl font-bold">Get Started</Button>
                    </div>

                    {/* Pro */}
                    <div className="p-10 rounded-[2rem] bg-slate-950 text-white shadow-2xl scale-105 border border-slate-800 relative flex flex-col z-10">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-purple-500" />
                        <h3 className="font-bold text-lg text-primary mb-4">Pro</h3>
                        <div className="text-5xl font-black mb-8">$29<span className="text-xl font-medium text-slate-500 text-base">/mo</span></div>
                        <ul className="space-y-4 mb-8 flex-1">
                             {['Unlimited Projects', 'Priority Support', 'Advanced Analytics', 'Custom Domain'].map(i => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium"><Check className="w-4 h-4 text-primary" /> {i}</li>
                            ))}
                        </ul>
                        <Button size="lg" className="w-full py-6 rounded-xl font-bold text-lg bg-primary hover:bg-primary/90">Start Free Trial</Button>
                    </div>

                    {/* Enterprise */}
                    <div className="p-10 rounded-[2rem] bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-2xl flex flex-col">
                        <h3 className="font-bold text-lg text-muted-foreground mb-4">Enterprise</h3>
                        <div className="text-5xl font-black mb-8">Custom</div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {['Dedicated Infra', 'SLA Guarantee', '24/7 Support'].map(i => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium"><Check className="w-4 h-4 text-primary" /> {i}</li>
                            ))}
                        </ul>
                        <Button variant="outline" className="w-full py-6 rounded-xl font-bold hover:bg-muted">Contact Sales</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
