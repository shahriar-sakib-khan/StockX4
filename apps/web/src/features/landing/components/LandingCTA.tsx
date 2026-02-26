import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const LandingCTA = () => {
    return (
        <section className="py-24 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

             <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">Ready to Transform Your LPG Business?</h2>
                <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Join hundreds of LPG businesses already using Stock-X to streamline their operations and boost efficiency.</p>

                <Link to="/register">
                    <Button size="lg" className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-lg font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-1">
                        Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </Link>
             </div>
        </section>
    );
};
