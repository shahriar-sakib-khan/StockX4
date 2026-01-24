import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const LandingHero = () => {
    return (
        <main className="relative z-10 pt-44 pb-32 px-6 overflow-hidden">
            {/* Minimalist Aurora Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-primary/20 blur-[120px] rounded-full opacity-30 animate-pulse-slow" />
                <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vh] bg-indigo-500/10 blur-[100px] rounded-full opacity-30 mix-blend-multiply" />
            </div>

            <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-foreground leading-[0.9] select-none">
                    Ship your SaaS <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-purple-500 to-indigo-600 animate-gradient-xy">without gravity.</span>
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
                    The enterprise-grade MERN boilerplate. <br className="hidden md:block" />
                    Authentication, Payments, RBAC & Dashboard pre-built.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                    <Link to="/register" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg shadow-[0_20px_50px_-12px_rgba(var(--primary),0.5)] hover:shadow-[0_30px_60px_-15px_rgba(var(--primary),0.6)] transition-all duration-300 hover:-translate-y-1 bg-primary text-primary-foreground border-0 gap-3 group">
                            Start Building Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <a href="https://github.com/shahriar-sakib-khan/anti-gravity-mern-starter" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg hover:bg-muted/50 transition-all border-border/50 gap-3">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" /> Star on GitHub
                        </Button>
                    </a>
                </div>
            </div>
        </main>
    );
};
