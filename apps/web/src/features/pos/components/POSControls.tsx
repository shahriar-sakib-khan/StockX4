import { usePosStore } from '../stores/pos.store';
import { Tabs, TabsList, TabsTrigger as TabTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useStoreSizes, sortSizes } from '@/features/store/hooks/useStoreSizes';

interface POSControlsProps {
  storeId?: string;
}

export const POSControls = ({ storeId }: POSControlsProps) => {
  const {
      mode, setMode,
      filterSize, setFilterSize,
      filterRegulator, setFilterRegulator,
      filterSearch, setFilterSearch,
      activeCategory, setActiveCategory,
      filterBurner, setFilterBurner
  } = usePosStore();

  const { sizes } = useStoreSizes(storeId || '');
  const sortedSizes = sortSizes(sizes);

  return (
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between bg-white border rounded-xl sm:rounded-2xl p-2 sm:p-3 gap-3 sm:gap-4 shrink-0 shadow-sm">
 
          {/* Category Tabs & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Product Categories (Cylinder/Stove/Regulator) */}
              <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)} className="w-full sm:w-auto shrink-0">
                <TabsList className="grid w-full sm:w-[280px] md:w-[360px] grid-cols-3 h-12 bg-slate-100 p-1 rounded-lg sm:rounded-xl">
                    <TabTrigger value="cylinder" className="rounded-md sm:rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-black text-xs uppercase tracking-widest text-slate-700">Cylinders</TabTrigger>
                    <TabTrigger value="stove" className="rounded-md sm:rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-black text-xs uppercase tracking-widest text-slate-700">Stoves</TabTrigger>
                    <TabTrigger value="regulator" className="rounded-md sm:rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-black text-xs uppercase tracking-widest text-slate-700">Regulators</TabTrigger>
                </TabsList>
              </Tabs>
 
              {/* Action Mode (Packaged/Refill/Empty) - ONLY FOR CYLINDERS */}
              {activeCategory === 'cylinder' && (
                  <div className="flex items-center border border-slate-200 rounded-lg sm:rounded-xl bg-slate-50 p-1 gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar justify-start sm:justify-center h-12 touch-pan-x">
                      <button
                          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 text-xs font-black rounded-lg uppercase transition-all whitespace-nowrap active:scale-95 ${mode === 'PACKAGED' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                          onClick={() => setMode('PACKAGED')}
                      >
                          Packaged
                      </button>
                      <button
                          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 text-xs font-black rounded-lg uppercase transition-all whitespace-nowrap active:scale-95 ${mode === 'REFILL' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                          onClick={() => setMode('REFILL')}
                      >
                          Gas Refill
                      </button>
                      <button
                          className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 text-xs font-black rounded-lg uppercase transition-all whitespace-nowrap active:scale-95 ${mode === 'EMPTY' ? 'bg-slate-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                          onClick={() => setMode('EMPTY')}
                      >
                          Empty
                      </button>
                  </div>
              )}
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 sm:gap-3 w-full lg:flex-1 justify-between lg:justify-end overflow-x-auto no-scrollbar h-12 touch-pan-x">
               {/* Controls for Cylinders */}
               {activeCategory === 'cylinder' && (
                   <>
                       <Select value={filterSize} onValueChange={setFilterSize}>
                            <SelectTrigger className="w-[100px] sm:w-[130px] h-12 text-xs sm:text-sm font-black border border-indigo-100 text-indigo-700 bg-indigo-50/30 rounded-lg sm:rounded-xl focus:ring-1 focus:ring-indigo-500 uppercase tracking-tighter shrink-0 px-3">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-2">
                                <SelectItem value="all" className="font-black uppercase text-xs">All Sizes</SelectItem>
                                {sortedSizes.map((size) => (
                                    <SelectItem key={size} value={size} className="font-black uppercase text-xs">
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
 
                        <Select value={filterRegulator} onValueChange={setFilterRegulator}>
                            <SelectTrigger className="w-[100px] sm:w-[140px] h-12 text-xs sm:text-sm font-black border border-amber-100 text-amber-700 bg-amber-50/30 rounded-lg sm:rounded-xl focus:ring-1 focus:ring-amber-500 uppercase tracking-tighter shrink-0 px-3">
                                <SelectValue placeholder="Reg" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-2">
                                <SelectItem value="all" className="font-black uppercase text-xs">All Types</SelectItem>
                                <SelectItem value="22mm" className="text-orange-600 font-black uppercase text-xs">22mm</SelectItem>
                                <SelectItem value="20mm" className="text-yellow-600 font-black uppercase text-xs">20mm</SelectItem>
                            </SelectContent>
                        </Select>
                   </>
               )}
 
               {/* Controls for Stoves */}
               {activeCategory === 'stove' && (
                   <Select value={filterBurner} onValueChange={setFilterBurner}>
                        <SelectTrigger className="w-[100px] sm:w-[140px] h-12 text-xs sm:text-sm font-black border border-emerald-100 text-emerald-700 bg-emerald-50/30 rounded-lg sm:rounded-xl focus:ring-1 focus:ring-emerald-500 uppercase tracking-tighter shrink-0 px-3">
                            <SelectValue placeholder="Burners" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                            <SelectItem value="all" className="font-black uppercase text-xs">All Burners</SelectItem>
                            <SelectItem value="1" className="font-black uppercase text-xs">1 Burner</SelectItem>
                            <SelectItem value="2" className="font-black uppercase text-xs">2 Burners</SelectItem>
                            <SelectItem value="3" className="font-black uppercase text-xs">3 Burners</SelectItem>
                            <SelectItem value="4" className="font-black uppercase text-xs">4 Burners</SelectItem>
                        </SelectContent>
                   </Select>
               )}
 
               {/* Controls for Regulators */}
               {activeCategory === 'regulator' && (
                   <Select value={filterRegulator} onValueChange={setFilterRegulator}>
                        <SelectTrigger className="w-[100px] sm:w-[140px] h-12 text-xs sm:text-sm font-black border border-amber-100 text-amber-700 bg-amber-50/30 rounded-lg sm:rounded-xl focus:ring-1 focus:ring-amber-500 uppercase tracking-tighter shrink-0 px-3">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                            <SelectItem value="all" className="font-black uppercase text-xs">All Types</SelectItem>
                            <SelectItem value="22mm" className="text-orange-600 font-black uppercase text-xs">22mm</SelectItem>
                            <SelectItem value="20mm" className="text-yellow-600 font-black uppercase text-xs">20mm</SelectItem>
                        </SelectContent>
                   </Select>
               )}
 
               <Input
                   placeholder="Search..."
                   value={filterSearch}
                   onChange={(e) => setFilterSearch(e.target.value)}
                   className="flex-1 lg:max-w-[240px] h-12 text-xs sm:text-sm min-w-[120px] sm:min-w-[140px] font-black placeholder:text-slate-400 bg-slate-50 border border-transparent focus:border-slate-200 rounded-lg sm:rounded-xl uppercase tracking-widest px-4"
               />
          </div>
      </div>
  );
};
