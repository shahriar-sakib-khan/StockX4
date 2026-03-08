
interface InvoiceHeaderProps {
    storeName: string;
    showPreviewLabel?: boolean;
}

export const InvoiceHeader = ({ storeName, showPreviewLabel = false }: InvoiceHeaderProps) => {
    return (
        <div className="text-center pb-3 border-b-4 border-double border-slate-200 bg-slate-50/30 p-2 rounded-t-xl">
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-slate-900 leading-tight">{storeName}</h2>
            <p className="text-[8px] sm:text-xs font-bold text-slate-500 tracking-widest uppercase mt-0.5">LPG Distribution Point</p>
            {showPreviewLabel && (
                <div className="inline-block px-3 py-0.5 mt-2 bg-orange-100 text-orange-700 text-[10px] font-black uppercase rounded-full border border-orange-200 shadow-sm animate-pulse">
                    Invoice Preview
                </div>
            )}
        </div>
    );
};
