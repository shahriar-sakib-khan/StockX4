import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CircuitBoard } from 'lucide-react';
import { useState, useEffect } from 'react';

export const LandingHeader = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl bg-white/90 border-b border-slate-200 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }} className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white border border-slate-700 shadow-md">
                  <CircuitBoard className="w-6 h-6 fill-current" />
                </div>
                <span className={`font-bold text-xl tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-slate-900 md:text-white'}`}>STOCK X</span>
              </a>

              <nav className={`hidden md:flex gap-8 text-sm font-medium ${scrolled ? 'text-slate-600' : 'text-slate-300'}`}>
                <a href="#features" className={`hover:text-orange-500 transition-colors ${scrolled ? '' : 'hover:text-white'}`}>Features</a>
                <a href="#" className={`hover:text-orange-500 transition-colors ${scrolled ? '' : 'hover:text-white'}`}>Marketplace</a>
                <a href="#pricing" className={`hover:text-orange-500 transition-colors ${scrolled ? '' : 'hover:text-white'}`}>Pricing</a>
              </nav>

              <div className="flex items-center gap-4">
                <Link to="/login" className={`text-sm font-medium transition-colors ${scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}>Log in</Link>
                <Link to="/register">
                    <Button size="sm" className="rounded-full px-6 h-10 bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 border-0 font-bold">Get Started</Button>
                </Link>
              </div>
            </div>
          </header>
    );
};
