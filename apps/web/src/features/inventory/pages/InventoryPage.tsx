import { useParams } from "react-router-dom";
import { Box, Flame, Settings } from "lucide-react";
import { useState } from "react";
import { CylindersContent } from "@/features/cylinder/components/CylindersContent";
import { StovesContent } from "@/features/cylinder/components/StovesContent";
import { RegulatorsContent } from "@/features/cylinder/components/RegulatorsContent";

type Tab = 'cylinders' | 'stoves' | 'regulators';

export const InventoryPage = () => {
    const params = useParams();
    const effectiveStoreId = params.storeId || params.id;

    const [activeTab, setActiveTab] = useState<Tab>('cylinders');

    const renderContent = () => {
        switch (activeTab) {
            case 'cylinders':
                return <CylindersContent storeId={effectiveStoreId!} onAddToCart={() => {}} />;
            case 'stoves':
                return <StovesContent storeId={effectiveStoreId!} />;
            case 'regulators':
                return <RegulatorsContent storeId={effectiveStoreId!} />;
            default:
                return null;
        }
    };

    const tabs = [
        { id: 'cylinders', label: 'Cylinders', icon: Box },
        { id: 'stoves', label: 'Stoves', icon: Flame },
        { id: 'regulators', label: 'Regulators', icon: Settings },
    ] as const;

    return (
        <div className="flex flex-col font-sans animate-in fade-in duration-500 pb-4 w-full">
            
            {/* PRISTINE TAB NAVIGATION: Fixed for both Mobile & PC */}
            <div className="w-full flex items-center justify-center sm:justify-start mb-6 sm:mb-8 px-2 sm:px-1">
                
                {/* Mobile: 'flex w-full' ensures it takes exactly 100% of the screen.
                  Desktop: 'sm:inline-flex sm:w-auto' ensures it shrinks to fit the text perfectly.
                */}
                <div className="flex w-full sm:inline-flex sm:w-auto bg-slate-100/60 border border-slate-200/50 rounded-2xl p-1 sm:p-1.5 shadow-inner">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                // Mobile: flex-1 (even 33% split), px-1 (tight padding), text-[10px] (fits "Regulators")
                                // Desktop: sm:flex-none (hugs text), sm:px-8 (breathable), sm:text-[13px]
                                className={`group relative flex items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-[13px] font-black transition-all duration-500 outline-none select-none flex-1 sm:flex-none z-10 ${
                                    isActive 
                                    ? 'text-slate-900' 
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {/* Active State Background */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-white rounded-[10px] sm:rounded-xl border border-slate-200/40 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.06)] -z-10 animate-in zoom-in-95 duration-300" />
                                )}
                                
                                {/* Inactive Hover Glow */}
                                {!isActive && (
                                    <div className="absolute inset-0 rounded-[10px] sm:rounded-xl bg-white/0 group-hover:bg-white/40 shadow-[0_0_15px_rgba(255,255,255,0)] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.8)] -z-10 transition-all duration-500" />
                                )}
                                
                                {/* Desktop Icon (Size 16) */}
                                <tab.icon 
                                    size={16} 
                                    strokeWidth={isActive ? 2.5 : 2} 
                                    className={`shrink-0 transition-colors duration-500 hidden sm:block ${
                                        isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary/60'
                                    }`} 
                                />
                                {/* Mobile Icon (Size 14) */}
                                <tab.icon 
                                    size={14} 
                                    strokeWidth={isActive ? 2.5 : 2} 
                                    className={`shrink-0 transition-colors duration-500 sm:hidden ${
                                        isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary/60'
                                    }`} 
                                />
                                
                                {/* truncate ensures that even on tiny phones like iPhone SE, it won't overflow */}
                                <span className="tracking-tight sm:tracking-wide uppercase sm:normal-case truncate">
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="w-full" key={activeTab}>
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
                    {renderContent()}
                </div>
            </div>
            
        </div>
    );
};