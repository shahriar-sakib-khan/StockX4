import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const LandingPricing = () => {
    return (
        <div id="pricing" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-slate-200 text-slate-700 font-medium text-xs mb-4">Simple Pricing</span>
                   <h2 className="text-4xl font-bold text-slate-900 mb-4">Choose Your Plan</h2>
                   <p className="text-lg text-slate-600">Affordable plans designed to grow with your LPG business</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Pro */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
                        <p className="text-slate-500 mb-6 text-sm">Perfect for small businesses</p>

                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-bold text-slate-900">৳500</span>
                            <span className="text-slate-500">/month</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {[
                                'Full Inventory Management',
                                'POS & Daily Sales',
                                'Customer Management',
                                'Basic Reports',
                                'Up to 3 Staff Accounts'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                    <span className="text-sm font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <Link to="/register">
                            <Button variant="outline" className="w-full h-12 rounded-xl text-slate-900 border-slate-300 hover:bg-slate-50 hover:text-slate-900 font-bold">
                                Get Started <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {/* Premium */}
                    <div className="bg-white rounded-3xl p-8 border-2 border-orange-500 shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Most Popular</div>

                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium</h3>
                        <p className="text-slate-500 mb-6 text-sm">For growing businesses</p>

                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-bold text-slate-900">৳1000</span>
                            <span className="text-slate-500">/month</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                             {[
                                'Everything in Pro',
                                'Online Delivery Platform',
                                'Advanced Analytics',
                                'Vehicle Cost Tracking',
                                'Unlimited Staff Accounts',
                                'Priority Support'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                    <span className="text-sm font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <Link to="/register">
                            <Button className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20">
                                Get Premium <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
