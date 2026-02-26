
interface InvoiceHeaderProps {
    storeName: string;
    showPreviewLabel?: boolean;
}

export const InvoiceHeader = ({ storeName, showPreviewLabel = false }: InvoiceHeaderProps) => {
    return (
        <div className="text-center pb-4 border-b border-dashed">
            <h2 className="text-xl font-bold uppercase tracking-wider">{storeName}</h2>
            <p className="text-[10px] text-muted-foreground">LPG Distribution Point</p>
            {showPreviewLabel && <p className="text-[10px] text-muted-foreground mt-1">Invoice Preview</p>}
        </div>
    );
};
