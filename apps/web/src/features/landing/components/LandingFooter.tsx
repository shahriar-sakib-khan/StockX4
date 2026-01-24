import { Zap } from 'lucide-react';

export const LandingFooter = () => {
    return (
        <footer className="border-t border-border bg-background py-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <span className="font-bold tracking-tight text-xl block text-foreground">Antigravity</span>
                            <span className="text-xs text-muted-foreground">MERN Stack Seed</span>
                        </div>
                    </div>

                    <div className="flex gap-8 text-sm font-medium text-muted-foreground">
                        <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                        <a href="#" className="hover:text-primary transition-colors">GitHub</a>
                        <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                        <a href="#" className="hover:text-primary transition-colors">License</a>
                    </div>
                </div>

                <div className="mt-12 text-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Antigravity. Open Source MIT License.</p>
                </div>
            </div>
        </footer>
    );
};
