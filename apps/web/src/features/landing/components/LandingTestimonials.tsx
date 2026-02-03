import { Star } from 'lucide-react';

export const LandingTestimonials = () => {
    return (
        <section className="py-24 bg-background">
             <div className="max-w-7xl mx-auto px-6">
                <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/50 rounded-full blur-[100px] pointer-events-none" />

                    <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                        <div>
                             <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-700 font-medium text-xs mb-6">Customer Success</span>
                             <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">Trusted by LPG Businesses Across Bangladesh</h2>
                             <p className="text-lg text-slate-600 mb-12">Join hundreds of distributors who have transformed their operations with Stock-X.</p>

                             <div className="grid grid-cols-2 gap-8">
                                 <div>
                                     <div className="text-4xl font-bold text-orange-500 mb-1">+45%</div>
                                     <div className="text-sm text-slate-500 font-medium">Efficiency Increase</div>
                                 </div>
                                 <div>
                                     <div className="text-4xl font-bold text-blue-500 mb-1">-30%</div>
                                     <div className="text-sm text-slate-500 font-medium">Operational Costs</div>
                                 </div>
                                 <div>
                                     <div className="text-4xl font-bold text-green-500 mb-1">99%</div>
                                     <div className="text-sm text-slate-500 font-medium">Stock Accuracy</div>
                                 </div>
                                 <div>
                                     <div className="text-4xl font-bold text-slate-900 mb-1">2x</div>
                                     <div className="text-sm text-slate-500 font-medium">Faster Deliveries</div>
                                 </div>
                             </div>
                        </div>

                        <div>
                             <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 relative">
                                  {/* User Info */}
                                  <div className="flex items-center gap-4 mb-6">
                                      <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl">RK</div>
                                      <div>
                                          <div className="font-bold text-slate-900">Rajesh Kumar</div>
                                          <div className="text-sm text-slate-500">CityGas Distributors, Dhaka</div>
                                      </div>
                                  </div>

                                  <p className="text-slate-600 italic mb-8 leading-relaxed">
                                      "With STOCK X's Inventory management and online delivery platform, we reduced reporting time by 80% and increased our sales team's productivity by 35%. The real-time tracking has been a game-changer."
                                  </p>

                                  <div className="flex gap-1 text-orange-400">
                                      {[...Array(5)].map((_, i) => (
                                          <Star key={i} className="w-5 h-5 fill-current" />
                                      ))}
                                  </div>
                             </div>
                        </div>
                    </div>
                </div>
             </div>
        </section>
    );
};
