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

    return (
        <div className="space-y-4 flex flex-col">
            <div className="border-b shrink-0">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('cylinders')}
                        className={`border-b-2 px-3 py-1.5 font-medium text-sm flex items-center gap-2 transition-all ${activeTab === 'cylinders' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <Box className="w-4 h-4" /> Cylinders
                    </button>
                    <button
                        onClick={() => setActiveTab('stoves')}
                        className={`border-b-2 px-3 py-1.5 font-medium text-sm flex items-center gap-2 transition-all ${activeTab === 'stoves' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <Flame className="w-4 h-4" /> Stoves
                    </button>
                    <button
                        onClick={() => setActiveTab('regulators')}
                        className={`border-b-2 px-3 py-1.5 font-medium text-sm flex items-center gap-2 transition-all ${activeTab === 'regulators' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <Settings className="w-4 h-4" /> Regulators
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 rounded-lg border bg-card/50 shadow-sm">
                <div className="p-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
