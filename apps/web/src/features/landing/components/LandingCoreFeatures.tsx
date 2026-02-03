import { Package, Truck, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const LandingCoreFeatures = () => {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
             <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 font-medium text-xs mb-4">Core Features</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Two Powerful Platforms, One Solution</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-24">
                    {/* Inventory Card */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
                                <Package className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">L.P.G Inventory Management</h3>
                                <p className="text-slate-600">Complete real-time tracking of all cylinders, stoves, and regulators with automated alerts.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                             {[
                                'Real-time cylinder stock levels',
                                'Low-stock & refill alerts',
                                'POS/PDS auto-sync',
                                'Multi-brand tracking',
                                'Empty cylinder returns'
                             ].map((item, i) => (
                                 <div key={i} className="flex items-center gap-2">
                                     <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                     <span className="text-sm text-slate-600 font-medium">{item}</span>
                                 </div>
                             ))}
                        </div>

                        <Link to="/register">
                            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl text-base font-medium group-hover:translate-x-1 transition-transform">
                                Explore Inventory <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {/* Delivery Card */}
                    <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                             {/* Optional badge or accent */}
                        </div>
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0">
                                <Truck className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Online Delivery Platform</h3>
                                <p className="text-slate-600">Complete marketplace for LPG businesses with real-time order tracking and customer notifications.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                             {[
                                'Online order placement',
                                'Real-time delivery tracking',
                                'Customer notifications',
                                'Shop profile & products',
                                'Order management'
                             ].map((item, i) => (
                                 <div key={i} className="flex items-center gap-2">
                                     <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                     <span className="text-sm text-slate-600 font-medium">{item}</span>
                                 </div>
                             ))}
                        </div>

                         <Link to="/register">
                            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-xl text-base font-medium group-hover:translate-x-1 transition-transform">
                                View Marketplace <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="bg-slate-900 rounded-[2.5rem] py-16 px-6 md:px-20 text-white relative overflow-hidden">
                     {/* Background Pattern */}
                     <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                     <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                            <div className="text-slate-400 font-medium">Active Businesses</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
                            <div className="text-slate-400 font-medium">Daily Deliveries</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">99.9%</div>
                            <div className="text-slate-400 font-medium">Uptime</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
                            <div className="text-slate-400 font-medium">Support</div>
                        </div>
                     </div>
                </div>
             </div>
        </section>
    );
};
