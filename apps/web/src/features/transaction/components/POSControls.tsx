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
      <div className="flex flex-col md:flex-row items-center justify-between bg-white border rounded-lg p-2 gap-2 shrink-0 shadow-sm h-auto md:h-14">

          {/* Category Tabs & Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Product Categories (Cylinder/Stove/Regulator) */}
              <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)} className="w-full sm:w-auto shrink-0">
                <TabsList className="grid w-full sm:w-[320px] grid-cols-3 h-[42px] bg-slate-100 p-1 rounded-lg">
                    <TabTrigger value="cylinder" className="rounded-md data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-slate-600 focus-visible:ring-0">Cylinders</TabTrigger>
                    <TabTrigger value="stove" className="rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-slate-600 focus-visible:ring-0">Stoves</TabTrigger>
                    <TabTrigger value="regulator" className="rounded-md data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-slate-600 focus-visible:ring-0">Regulators</TabTrigger>
                </TabsList>
              </Tabs>

              {/* Action Mode (Packaged/Refill/Empty) - ONLY FOR CYLINDERS */}
              {activeCategory === 'cylinder' && (
                  <div className="flex items-center border rounded-lg overflow-hidden bg-slate-100 p-1 gap-1 w-full sm:w-auto justify-center h-[42px]">
                      <button
                          className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded uppercase transition-colors ${mode === 'PACKAGED' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                          onClick={() => setMode('PACKAGED')}
                      >
                          Packaged
                      </button>
                      <button
                          className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded uppercase transition-colors ${mode === 'REFILL' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                          onClick={() => setMode('REFILL')}
                      >
                          Gas Refill
                      </button>
                      <button
                          className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded uppercase transition-colors ${mode === 'EMPTY' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                          onClick={() => setMode('EMPTY')}
                      >
                          Empty
                      </button>
                  </div>
              )}
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2 w-full md:flex-1 justify-between md:justify-end overflow-x-auto h-[42px]">
               {/* Controls for Cylinders */}
               {activeCategory === 'cylinder' && (
                   <>
                       <Select value={filterSize} onValueChange={setFilterSize}>
                            <SelectTrigger className="w-[80px] md:w-[100px] h-[36px] text-xs font-bold border-indigo-200 text-indigo-700 bg-indigo-50 focus:ring-indigo-500">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sizes</SelectItem>
                                {sortedSizes.map((size) => (
                                    <SelectItem key={size} value={size} className="font-bold">
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterRegulator} onValueChange={setFilterRegulator}>
                            <SelectTrigger className="w-[80px] md:w-[110px] h-[36px] text-xs font-bold border-amber-200 text-amber-700 bg-amber-50 focus:ring-amber-500">
                                <SelectValue placeholder="Regulator" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="22mm" className="text-orange-600 font-bold">22mm</SelectItem>
                                <SelectItem value="20mm" className="text-yellow-600 font-bold">20mm</SelectItem>
                            </SelectContent>
                        </Select>
                   </>
               )}

               {/* Controls for Stoves */}
               {activeCategory === 'stove' && (
                   <Select value={filterBurner} onValueChange={setFilterBurner}>
                        <SelectTrigger className="w-[130px] h-[36px] text-xs font-bold border-emerald-200 text-emerald-700 bg-emerald-50 focus:ring-emerald-500">
                            <SelectValue placeholder="Burners" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Burners</SelectItem>
                            <SelectItem value="1" className="font-bold">1 Burner</SelectItem>
                            <SelectItem value="2" className="font-bold">2 Burners</SelectItem>
                            <SelectItem value="3" className="font-bold">3 Burners</SelectItem>
                            <SelectItem value="4" className="font-bold">4 Burners</SelectItem>
                        </SelectContent>
                   </Select>
               )}

               {/* Controls for Regulators */}
               {activeCategory === 'regulator' && (
                   <Select value={filterRegulator} onValueChange={setFilterRegulator}>
                        <SelectTrigger className="w-[130px] h-[36px] text-xs font-bold border-amber-200 text-amber-700 bg-amber-50 focus:ring-amber-500">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="22mm" className="text-orange-600 font-bold">22mm</SelectItem>
                            <SelectItem value="20mm" className="text-yellow-600 font-bold">20mm</SelectItem>
                        </SelectContent>
                   </Select>
               )}

               <Input
                  placeholder="Search..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="flex-1 md:max-w-[200px] h-[36px] text-xs min-w-[120px] font-medium placeholder:text-slate-400"
               />
          </div>
      </div>
  );
};
