import { RegisterForm } from '../components/RegisterForm';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, LayoutDashboard, Zap, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden">
      {/* branding Section - Hidden on small mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-12 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-slate-900/10 rounded-full blur-[128px] animate-pulse delay-700" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                        Stock<span className="text-slate-900 italic">X</span>BD
                    </h1>
                </div>
                <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                    Scale your Business with <span className="text-slate-900 leading-none">Confidence.</span>
                </h2>
                <p className="text-primary-foreground/80 text-lg">
                    Join hundreds of LPG dealers who đã upgraded to a modern, automated inventory system. Get started in minutes.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl group hover:bg-white/20 transition-all cursor-default text-white">
                    <div className="p-2 bg-white/20 rounded-xl w-fit mb-4">
                        <Zap className="text-white w-6 h-6" />
                    </div>
                    <h4 className="font-black text-xl mb-1">Fast</h4>
                    <p className="text-white/50 text-xs uppercase font-bold tracking-widest">Setup</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl group hover:bg-white/20 transition-all cursor-default text-white">
                    <div className="p-2 bg-white/20 rounded-xl w-fit mb-4">
                        <Globe className="text-white w-6 h-6" />
                    </div>
                    <h4 className="font-black text-xl mb-1">Easy</h4>
                    <p className="text-white/50 text-xs uppercase font-bold tracking-widest">Scalability</p>
                </div>
            </div>

            <div className="mt-12 p-6 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <LayoutDashboard className="text-primary w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-1 italic">Powerful Dashboard</h4>
                        <p className="text-slate-400 text-sm">Visualize your sales, inventory, and staff performance in one unified view.</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield className="w-24 h-24 text-white" />
                </div>
            </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden w-full max-w-md mb-2 sm:mb-8 flex flex-col items-center">
            <div className="p-1.5 sm:p-3 bg-primary rounded-xl sm:rounded-2xl shadow-xl mb-2 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase">
                Stock<span className="text-primary">X</span>BD
            </h1>
        </div>

        <div className="w-full max-w-md">
            <div className="mb-4 sm:mb-8 text-center lg:text-left">
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-0.5 sm:mb-2 font-display italic">Create Store Account</h2>
                <p className="hidden xs:block text-slate-500 font-medium text-xs sm:text-base">Join us and start managing your distribution channel effectively.</p>
            </div>

            <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative group overflow-hidden">
                <RegisterForm />
            </div>

            <div className="mt-4 sm:mt-8 text-center lg:text-left px-4">
                <p className="text-slate-500 font-medium text-xs sm:text-base">
                    Already have a store account?
                </p>
                <Link 
                    to="/login" 
                    className="mt-1 sm:mt-2 inline-flex items-center gap-1.5 text-primary font-black uppercase tracking-widest text-[10px] sm:text-sm hover:gap-3 transition-all"
                >
                    Sign in to your store <ArrowRight size={14} />
                </Link>
            </div>
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
