import { ShieldCheck, Users, Database, Cpu, FileKey, Layout } from 'lucide-react';

export const LandingFeatures = () => {
    return (
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
    );
};
