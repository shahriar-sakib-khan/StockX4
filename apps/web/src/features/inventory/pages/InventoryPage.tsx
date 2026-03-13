import { useParams } from "react-router-dom";
import { Box, Flame, Settings } from "lucide-react";
import { useState } from "react";
import { CylindersContent } from "@/features/cylinder/components/CylindersContent";
import { StovesContent } from "@/features/cylinder/components/StovesContent";
import { RegulatorsContent } from "@/features/cylinder/components/RegulatorsContent";
import { InfoTooltip } from "@/features/store/components/setup/shared/InfoTooltip";

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
            <div className="border-b shrink-0 bg-white sticky top-0 z-10 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-px">
                    <button
                        onClick={() => setActiveTab('cylinders')}
                        className={`border-b-2 px-3 py-3 font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap min-h-12 ${activeTab === 'cylinders' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <Box className="w-5 h-5" /> Cylinders
                    </button>
                    <button
                        onClick={() => setActiveTab('stoves')}
                        className={`border-b-2 px-3 py-3 font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap min-h-12 ${activeTab === 'stoves' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <Flame className="w-5 h-5" /> Stoves
                    </button>
                    <button
                        onClick={() => setActiveTab('regulators')}
                        className={`border-b-2 px-3 py-3 font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap min-h-12 ${activeTab === 'regulators' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <Settings className="w-5 h-5" /> Regulators
                    </button>
                    <InfoTooltip content="Manage your cylinder, stove, and regulator stock levels and prices here." />
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
