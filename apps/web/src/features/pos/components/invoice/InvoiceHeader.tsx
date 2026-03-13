
interface InvoiceHeaderProps {
    storeName: string;
    showPreviewLabel?: boolean;
}

export const InvoiceHeader = ({ storeName, showPreviewLabel = false }: InvoiceHeaderProps) => {
    return (
        <div className="text-center pb-2 sm:pb-3 border-b-2 sm:border-b-4 border-double border-slate-200 bg-slate-50/20 p-1.5 sm:p-2 rounded-t-lg sm:rounded-t-xl">
            <h2 className="text-lg sm:text-3xl font-black uppercase tracking-tighter text-slate-900 leading-tight">{storeName}</h2>
            <p className="text-[7px] sm:text-xs font-black text-slate-400 tracking-widest uppercase mt-0.5">LPG Distribution Point</p>
            {showPreviewLabel && (
                <div className="inline-block px-2 sm:px-3 py-0.5 mt-1.5 bg-orange-100 text-orange-700 text-[8px] sm:text-[10px] font-black uppercase rounded-full border border-orange-200 shadow-sm animate-pulse">
                    Preview
                </div>
            )}
        </div>
    );
};
