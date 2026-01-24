import React from 'react';
import { Globe, Zap, Layout, Code2, Server, Terminal, Database, Lock, GitBranch, Cpu } from 'lucide-react';

export const LandingStack = () => {
    return (
        <div id="stack" className="py-20 border-y border-border/30 bg-muted/20 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

            <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-16 items-center opacity-60 hover:opacity-100 transition-opacity duration-500">
                {[...Array(2)].map((_, i) => (
                    <React.Fragment key={i}>
                        {[
                            { icon: Globe, name: "React 18" },
                            { icon: Zap, name: "Vite" },
                            { icon: Layout, name: "Tailwind" },
                            { icon: Code2, name: "TypeScript" },
                            { icon: Server, name: "Node.js" },
                            { icon: Terminal, name: "Express" },
                            { icon: Database, name: "MongoDB" },
                            { icon: Lock, name: "Argon2" },
                            { icon: GitBranch, name: "Monorepo" },
                            { icon: Cpu, name: "Vitest" },
                        ].map((tech, i) => (
                            <div key={`${i}-tech`} className="flex items-center gap-3 select-none">
                                <tech.icon className="w-6 h-6 text-muted-foreground/80" />
                                <span className="text-lg font-semibold text-muted-foreground tracking-tight">{tech.name}</span>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
