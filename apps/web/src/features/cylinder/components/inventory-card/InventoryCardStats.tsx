import { PenLine } from "lucide-react";

interface InventoryCardStatsProps {
    counts: {
        full: number;
        empty: number;
        defected: number;
    };
    onDefectClick: () => void;
    highlight?: boolean;
    pendingQuantity?: number;
}

export const InventoryCardStats = ({ counts, onDefectClick, highlight, pendingQuantity }: InventoryCardStatsProps) => {
    return (
        <div className="grid grid-cols-4 gap-2">
            <div className={`bg-emerald-50 rounded-lg py-2 px-1 flex flex-col items-center justify-center text-center border border-emerald-100 min-w-0 shadow-sm transition-all h-full ${highlight ? 'ring-2 ring-emerald-500 animate-pulse shadow-md scale-105' : 'hover:shadow-md'}`}>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider w-full mb-0.5 relative">
                    Pkg
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 leading-none break-words max-w-full block relative flex items-center justify-center gap-1 flex-wrap">
                    {counts.full}
                    {pendingQuantity && pendingQuantity > 0 ? (
                        <span className="text-[10px] font-black text-white bg-emerald-500 px-1.5 py-0.5 rounded-md shadow-sm animate-in zoom-in-50">
                            +{pendingQuantity}
                        </span>
                    ) : null}
                </span>
            </div>
            <div className={`bg-cyan-50 rounded-lg py-2 px-1 flex flex-col items-center justify-center text-center border border-cyan-100 min-w-0 shadow-sm transition-all h-full ${highlight ? 'ring-2 ring-cyan-500 animate-pulse shadow-md scale-105' : 'hover:shadow-md'}`}>
                <span className="text-[9px] font-black text-cyan-600 uppercase tracking-wider w-full mb-0.5">Refill</span>
                <span className="text-2xl sm:text-3xl font-black text-cyan-700 leading-none break-words max-w-full block">{counts.empty}</span>
            </div>
            <div className="bg-slate-50 rounded-lg py-2 px-1 flex flex-col items-center justify-center text-center border border-slate-200 min-w-0 shadow-sm transition-all hover:shadow-md h-full">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider w-full mb-0.5">Empty</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-700 leading-none break-words max-w-full block">{counts.empty}</span>
            </div>
            <div
                className="bg-rose-50 rounded-lg py-2 px-1 flex flex-col items-center justify-center text-center border border-rose-100 cursor-pointer hover:bg-rose-100 transition-colors group/defect min-w-0 shadow-sm transition-all hover:shadow-md h-full relative"
                onClick={onDefectClick}
                title="Manage Defects"
            >
                {/* Defect Edit Icon - Always Visible */}
                <div className="absolute top-0.5 right-0.5 p-0.5 bg-white/50 rounded-full hover:bg-white transition-colors">
                    <PenLine className="w-2.5 h-2.5 text-rose-500" />
                </div>
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider w-full mb-0.5">Defect</span>
                <span className="text-2xl sm:text-3xl font-black text-rose-700 leading-none break-words max-w-full block">{counts.defected}</span>
            </div>
        </div>
    );
};
