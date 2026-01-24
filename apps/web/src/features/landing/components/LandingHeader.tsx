import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export const LandingHeader = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl bg-background/90 border-b border-border/40 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }} className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)] group-hover:shadow-[0_0_20px_-3px_rgba(var(--primary),0.5)] transition-all duration-500">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="font-bold text-xl tracking-tight">Antigravity</span>
              </a>
              <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground/80">
                <a href="#features" className="hover:text-primary transition-colors hover:bg-primary/5 px-3 py-1.5 rounded-full">Features</a>
                <a href="#stack" className="hover:text-primary transition-colors hover:bg-primary/5 px-3 py-1.5 rounded-full">Stack</a>
                <a href="#pricing" className="hover:text-primary transition-colors hover:bg-primary/5 px-3 py-1.5 rounded-full">Pricing</a>
              </nav>
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
                <Link to="/register">
                    <Button size="sm" className="rounded-full px-5 h-9 bg-foreground text-background hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">Get Started</Button>
                </Link>
              </div>
            </div>
          </header>
    );
};
