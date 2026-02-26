import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const LandingHero = () => {
    return (
        <div className="bg-slate-900 pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                    Ready to Transform Your LPG <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Business?</span>
                </h1>

                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Join hundreds of LPG businesses already using Stock-X to streamline their operations and boost efficiency.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/register">
                        <Button size="lg" className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-lg font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:-translate-y-1">
                            Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
