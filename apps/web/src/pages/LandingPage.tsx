import React, { useEffect, useState } from 'react';
import {
  ArrowRight, Check, Code2, Database, Globe, Layout, ShieldCheck, Zap,
  Server, Lock, FileKey, Users, Terminal, CreditCard, Mail, Star, GitBranch, Cpu,
  Layers, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden">
      {/* Header - Intelligent Glass */}
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

      {/* Hero Section - Clean & Abstract */}
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
            The enterprise-grade MERN boilerplate. <br className="hidden md:block"/>
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

      {/* Tech Stack - Infinite Marquee */}
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

      {/* Features - Bento Grid */}
        <div id="features" className="py-32 px-6">
            <div className="max-w-7xl mx-auto">
               <div className="mb-20">
                  <span className="text-primary font-bold tracking-widest text-sm uppercase mb-3 block">Everything Included</span>
                  <h2 className="text-4xl md:text-5xl font-black mb-6 text-foreground tracking-tight">Batteries included.<br/>Assembly required? Zero.</h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                   {/* 1. Large Item: Auth */}
                  <div className="md:col-span-2 row-span-2 rounded-[2.5rem] p-10 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-700" />
                      <div className="relative z-10 h-full flex flex-col justify-between">
                          <div>
                            <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 z-20 relative">
                                <ShieldCheck className="w-8 h-8 font-bold" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">Enterprise Authentication</h3>
                            <p className="text-slate-400 text-lg max-w-md">Complete secure authentication flow. HttpOnly Cookies, Refresh Tokens, and Argon2 hashing.</p>
                          </div>
                          <div className="w-full h-48 bg-slate-950/50 rounded-xl border border-white/5 backdrop-blur-sm p-4 flex flex-col gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                               <div className="flex gap-2">
                                   <div className="h-3 w-3 rounded-full bg-red-500/50" />
                                   <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                                   <div className="h-3 w-3 rounded-full bg-green-500/50" />
                               </div>
                               <div className="space-y-2">
                                   <div className="w-3/4 h-2 bg-slate-800 rounded animate-pulse" />
                                   <div className="w-1/2 h-2 bg-slate-800 rounded animate-pulse delay-75" />
                                   <div className="w-full h-2 bg-slate-800 rounded animate-pulse delay-150" />
                               </div>
                          </div>
                      </div>
                  </div>

                  {/* 2. Tall Item: RBAC */}
                  <div className="md:col-span-1 md:row-span-2 rounded-[2.5rem] p-8 bg-card border border-border/50 relative overflow-hidden group hover:border-primary/50 transition-colors duration-500">
                       <div className="h-2/3 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                            <Users className="w-32 h-32 text-muted-foreground/10 group-hover:text-primary/20 transition-colors duration-500" />
                            <div className="absolute w-full space-y-3 px-4">
                                <div className="p-3 bg-background rounded-xl border border-border shadow-sm flex items-center gap-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                                    <div className="w-8 h-8 rounded-full bg-blue-100" />
                                    <div className="h-2 w-20 bg-muted rounded" />
                                </div>
                                <div className="p-3 bg-background rounded-xl border border-border shadow-sm flex items-center gap-3 translate-x-4 transform group-hover:translate-x-6 transition-transform duration-500 delay-75">
                                    <div className="w-8 h-8 rounded-full bg-green-100" />
                                    <div className="h-2 w-20 bg-muted rounded" />
                                </div>
                            </div>
                       </div>
                       <div className="relative z-20">
                           <h3 className="text-2xl font-bold mb-2">RBAC & Teams</h3>
                           <p className="text-muted-foreground">Admin vs User roles pre-configured. Easily expandable to multi-tenancy.</p>
                       </div>
                  </div>

                  {/* 3. Wide Item: Data Layer */}
                  <div className="md:col-span-2 rounded-[2.5rem] p-8 bg-muted/30 border border-border/50 flex flex-col md:flex-row items-center gap-8 group hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                             <h3 className="text-2xl font-bold mb-2">Modern Data Layer</h3>
                             <p className="text-muted-foreground mb-6">Mongoose with TypeScript schemas. Automated seeding and connection pooling.</p>
                             <div className="flex gap-2">
                                <span className="px-3 py-1 rounded-lg bg-background border border-border text-xs font-mono">schema.ts</span>
                                <span className="px-3 py-1 rounded-lg bg-background border border-border text-xs font-mono">seed.ts</span>
                             </div>
                        </div>
                        <div className="w-full md:w-1/3 aspect-square bg-background rounded-2xl border border-border p-4 flex items-center justify-center">
                            <Database className="w-16 h-16 text-primary/40 group-hover:text-primary transition-colors" />
                        </div>
                  </div>

                   {/* 4. Small Item: Type-Safe */}
                   <div className="md:col-span-1 rounded-[2.5rem] p-8 bg-gradient-to-br from-primary to-purple-600 text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full" />
                         <Cpu className="w-10 h-10 mb-4 text-white/80" />
                         <h3 className="text-xl font-bold mb-1">Type-Safe</h3>
                         <p className="text-white/70 text-sm">End-to-end TypeScript coverage.</p>
                   </div>

                   {/* 5. Wide Item: File Uploads (New) */}
                  <div className="md:col-span-2 rounded-[2.5rem] p-8 bg-card border border-border/50 flex items-center justify-between group hover:border-primary/50 transition-colors">
                       <div className="max-w-md">
                           <h3 className="text-2xl font-bold mb-2">File Uploads Ready</h3>
                           <p className="text-muted-foreground">Integrated Cloudinary support for avatars and media using Multer.</p>
                       </div>
                       <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center">
                            <FileKey className="w-10 h-10 text-primary" />
                       </div>
                  </div>

                   {/* 6. Small Item: Modern UI (New) */}
                  <div className="md:col-span-1 rounded-[2.5rem] p-8 bg-slate-950 border border-slate-800 flex flex-col justify-center relative overflow-hidden group">
                       <Layout className="w-10 h-10 text-white mb-4 group-hover:scale-110 transition-transform" />
                       <h3 className="text-xl font-bold mb-1 text-white">Modern UI</h3>
                       <p className="text-slate-400 text-sm">Tailwind + Radix UI components.</p>
                  </div>
               </div>
            </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="py-32 bg-muted/20 border-t border-border/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                   <h2 className="text-4xl font-black mb-4">Simple Pricing</h2>
                   <p className="text-muted-foreground text-lg">No hidden costs. Just pure code.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Hobby */}
                    <div className="p-10 rounded-[2rem] bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-2xl flex flex-col">
                        <h3 className="font-bold text-lg text-muted-foreground mb-4">Hobby</h3>
                        <div className="text-5xl font-black mb-8">$0</div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {['5 Projects', 'Community Support', 'Basic Analytics'].map(i => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium"><Check className="w-4 h-4 text-primary" /> {i}</li>
                            ))}
                        </ul>
                        <Button variant="secondary" className="w-full py-6 rounded-xl font-bold">Get Started</Button>
                    </div>

                    {/* Pro */}
                    <div className="p-10 rounded-[2rem] bg-slate-950 text-white shadow-2xl scale-105 border border-slate-800 relative flex flex-col z-10">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-purple-500" />
                        <h3 className="font-bold text-lg text-primary mb-4">Pro</h3>
                        <div className="text-5xl font-black mb-8">$29<span className="text-xl font-medium text-slate-500 text-base">/mo</span></div>
                        <ul className="space-y-4 mb-8 flex-1">
                             {['Unlimited Projects', 'Priority Support', 'Advanced Analytics', 'Custom Domain'].map(i => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium"><Check className="w-4 h-4 text-primary" /> {i}</li>
                            ))}
                        </ul>
                        <Button size="lg" className="w-full py-6 rounded-xl font-bold text-lg bg-primary hover:bg-primary/90">Start Free Trial</Button>
                    </div>

                    {/* Enterprise */}
                    <div className="p-10 rounded-[2rem] bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-2xl flex flex-col">
                        <h3 className="font-bold text-lg text-muted-foreground mb-4">Enterprise</h3>
                        <div className="text-5xl font-black mb-8">Custom</div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {['Dedicated Infra', 'SLA Guarantee', '24/7 Support'].map(i => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium"><Check className="w-4 h-4 text-primary" /> {i}</li>
                            ))}
                        </ul>
                        <Button variant="outline" className="w-full py-6 rounded-xl font-bold hover:bg-muted">Contact Sales</Button>
                    </div>
                </div>
            </div>
        </div>

       {/* Footer */}
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
    </div>
  );
};

export default LandingPage;
