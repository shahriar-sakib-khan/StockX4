import { usePosStore } from '../stores/pos.store';
import { Tabs, TabsList, TabsTrigger as TabTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export const POSControls = () => {
  const {
      mode, setMode,
      filterSize, setFilterSize,
      filterRegulator, setFilterRegulator,
      filterSearch, setFilterSearch,
      activeCategory, setActiveCategory,
      filterBurner, setFilterBurner
  } = usePosStore();

  return (
      <div className="flex items-center justify-between bg-white border rounded-lg p-2 gap-4 shrink-0 shadow-sm h-14">

          {/* Selling Mode Toggles */}
          <div className="flex items-center border rounded-md overflow-hidden bg-slate-100 p-1 gap-1">
             <button
                className={`px-3 py-1 text-xs font-bold rounded uppercase transition-colors ${mode === 'PACKAGED' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                onClick={() => setMode('PACKAGED')}
             >
                Packaged
             </button>
             <button
                className={`px-3 py-1 text-xs font-bold rounded uppercase transition-colors ${mode === 'REFILL' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                onClick={() => setMode('REFILL')}
             >
                Gas Refill
             </button>
             <button
                className={`px-3 py-1 text-xs font-bold rounded uppercase transition-colors ${mode === 'EMPTY' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                onClick={() => setMode('EMPTY')}
             >
                Empty
             </button>
          </div>

          {/* Categories */}
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)} className="w-[300px]">
            <TabsList className="grid w-full grid-cols-3 h-9">
                <TabTrigger value="cylinder">Cylinders</TabTrigger>
                <TabTrigger value="stove">Stoves</TabTrigger>
                <TabTrigger value="regulator">Regulators</TabTrigger>
            </TabsList>
          </Tabs>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 flex-1 justify-end">
               {/* Controls for Cylinders */}
               {activeCategory === 'cylinder' && (
                   <>
                       <Select value={filterSize} onValueChange={setFilterSize}>
                            <SelectTrigger className="w-[90px] h-9 text-xs">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sizes</SelectItem>
                                <SelectItem value="12kg">12kg</SelectItem>
                                <SelectItem value="35kg">35kg</SelectItem>
                                <SelectItem value="45kg">45kg</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterRegulator} onValueChange={setFilterRegulator}>
                            <SelectTrigger className="w-[90px] h-9 text-xs">
                                <SelectValue placeholder="Regulator" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="20mm">20mm</SelectItem>
                                <SelectItem value="22mm">22mm</SelectItem>
                            </SelectContent>
                        </Select>
                   </>
               )}

               {/* Controls for Stoves */}
               {activeCategory === 'stove' && (
                   <Select value={filterBurner} onValueChange={setFilterBurner}>
                        <SelectTrigger className="w-[120px] h-9 text-xs">
                            <SelectValue placeholder="Burners" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Burners</SelectItem>
                            <SelectItem value="1">1 Burner</SelectItem>
                            <SelectItem value="2">2 Burners</SelectItem>
                            <SelectItem value="3">3 Burners</SelectItem>
                            <SelectItem value="4">4 Burners</SelectItem>
                        </SelectContent>
                   </Select>
               )}

               {/* Controls for Regulators */}
               {activeCategory === 'regulator' && (
                   <Select value={filterRegulator} onValueChange={setFilterRegulator}>
                        <SelectTrigger className="w-[120px] h-9 text-xs">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="20mm">20mm</SelectItem>
                            <SelectItem value="22mm">22mm</SelectItem>
                        </SelectContent>
                   </Select>
               )}

               <Input
                  placeholder="Search..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="max-w-[150px] h-9 text-xs"
               />
          </div>
      </div>
  );
};
