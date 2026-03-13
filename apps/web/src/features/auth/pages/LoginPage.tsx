import { LoginForm } from '../components/LoginForm';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const LoginPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Branding Section - Hidden on small mobile or redesigned for tablet */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center p-12 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse delay-700" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                        Stock<span className="text-primary italic">X</span>BD
                    </h1>
                </div>
                <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                    Manage your Gas Distribution <span className="text-primary">Smarter.</span>
                </h2>
                <p className="text-slate-400 text-lg">
                    The ultimate inventory and POS solution for LPG dealers across Bangladesh. Built for speed, accuracy, and reliability.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl group hover:bg-white/10 transition-all cursor-default">
                    <div className="p-2 bg-emerald-500/20 rounded-xl w-fit mb-4">
                        <TrendingUp className="text-emerald-400 w-6 h-6" />
                    </div>
                    <h4 className="text-white font-black text-xl mb-1">99.9%</h4>
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Accuracy</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl group hover:bg-white/10 transition-all cursor-default">
                    <div className="p-2 bg-blue-500/20 rounded-xl w-fit mb-4">
                        <Users className="text-blue-400 w-6 h-6" />
                    </div>
                    <h4 className="text-white font-black text-xl mb-1">500+</h4>
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">LPG Dealers</p>
                </div>
            </div>

            <div className="mt-12 space-y-4">
                {[
                    "Inventory Tracking in Real-time",
                    "Automated Billing & Invoicing",
                    "Customer & Delivery Management",
                    "Staff Ledger & Performance"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="font-medium">{item}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden w-full max-w-md mb-2 sm:mb-12 flex flex-col items-center">
            <div className="p-1.5 sm:p-3 bg-slate-900 rounded-xl sm:rounded-2xl shadow-xl mb-2 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-8 sm:8 text-white" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase">
                Stock<span className="text-primary">X</span>BD
            </h1>
        </div>

        <div className="w-full max-w-md">
            <div className="mb-4 sm:mb-10 text-center lg:text-left">
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-0.5 sm:mb-2">Welcome Back</h2>
                <p className="hidden xs:block text-slate-500 font-medium text-xs sm:text-base">Please enter your credentials to access your store.</p>
            </div>

            <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative group overflow-hidden">
                <LoginForm />
            </div>

            <div className="mt-4 sm:mt-8 text-center lg:text-left px-4">
                <p className="text-slate-500 font-medium text-xs sm:text-base">
                    Don't have an account yet?
                </p>
                <Link 
                    to="/register" 
                    className="mt-1 sm:mt-2 inline-flex items-center gap-1.5 text-primary font-black uppercase tracking-widest text-[10px] sm:text-sm hover:gap-3 transition-all"
                >
                    Create a new account <ArrowRight size={14} />
                </Link>
            </div>
        </div>

        {/* Footer info for mobile */}
        <div className="mt-auto pt-6 lg:hidden text-center">
             <Badge variant="outline" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border-2 border-slate-200 text-slate-400">
                v2.4.0 • Enterprise Edition
             </Badge>
        </div>
      </div>

      {/* Back button */}
      <Link 
        to="/" 
        className="fixed top-8 right-8 z-50 p-2 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 text-slate-500 hover:text-primary shadow-sm hover:shadow-md transition-all active:scale-90"
        title="Back to Home"
      >
          <ArrowRight className="w-6 h-6 rotate-180" />
      </Link>
    </div>
  );
};
