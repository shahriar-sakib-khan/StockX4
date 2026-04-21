import { usePosStore } from '../stores/pos.store';
import { Tabs, TabsList, TabsTrigger as TabTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useStoreSizes, sortSizes } from '@/features/store/hooks/useStoreSizes';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="flex flex-col gap-2 p-2 sm:p-3 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-xl sm:rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] w-full shrink-0 relative z-10">
 
          {/* Row 1: Category & Action Modes (Desktop: Inline, Mobile: Stacked) */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 sm:gap-3 w-full">
              
              {/* Product Categories - Strict Grid */}
              <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)} className="w-full lg:w-auto shrink-0">
                <TabsList className="grid w-full lg:w-[320px] grid-cols-3 h-10 sm:h-11 bg-slate-100/80 p-1 rounded-lg shadow-inner border border-slate-200/50">
                    <TabTrigger value="cylinder" className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all font-black text-[9px] sm:text-[11px] uppercase tracking-tighter sm:tracking-widest text-slate-500">Cylinders</TabTrigger>
                    <TabTrigger value="stove" className="rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all font-black text-[9px] sm:text-[11px] uppercase tracking-tighter sm:tracking-widest text-slate-500">Stoves</TabTrigger>
                    <TabTrigger value="regulator" className="rounded-md data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all font-black text-[9px] sm:text-[11px] uppercase tracking-tighter sm:tracking-widest text-slate-500">Regulators</TabTrigger>
                </TabsList>
              </Tabs>
 
              {/* Action Modes - Strict Grid */}
              {activeCategory === 'cylinder' && (
                  <div className="grid grid-cols-3 items-center border border-slate-200/50 rounded-lg bg-slate-100/80 p-1 gap-1 w-full lg:w-auto h-10 sm:h-11 shadow-inner">
                      <button
                          className={cn(
                              "flex items-center justify-center px-1 sm:px-4 h-full text-[9px] sm:text-[11px] font-black rounded-md uppercase tracking-tighter sm:tracking-widest transition-all active:scale-[0.98]",
                              mode === 'PACKAGED' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                          )}
                          onClick={() => setMode('PACKAGED')}
                      >
                          Packaged
                      </button>
                      <button
                          className={cn(
                              "flex items-center justify-center px-1 sm:px-4 h-full text-[9px] sm:text-[11px] font-black rounded-md uppercase tracking-tighter sm:tracking-widest transition-all active:scale-[0.98]",
                              mode === 'REFILL' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                          )}
                          onClick={() => setMode('REFILL')}
                      >
                          Refill
                      </button>
                      <button
                          className={cn(
                              "flex items-center justify-center px-1 sm:px-4 h-full text-[9px] sm:text-[11px] font-black rounded-md uppercase tracking-tighter sm:tracking-widest transition-all active:scale-[0.98]",
                              mode === 'EMPTY' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                          )}
                          onClick={() => setMode('EMPTY')}
                      >
                          Empty
                      </button>
                  </div>
              )}
          </div>

          {/* Row 2: Filters & Search (Locked Grid Layout for Mobile) */}
          <div className={cn(
              "w-full pt-1 sm:pt-0 border-t border-slate-100 sm:border-none",
              // If there are filters, use a grid layout. If it's just search, block it out.
              activeCategory === 'cylinder' ? "grid grid-cols-2 lg:flex lg:flex-row gap-2" : "flex flex-col sm:flex-row gap-2"
          )}>
               
               {/* CYLINDER FILTERS: Strict 2-column split on mobile */}
               {activeCategory === 'cylinder' && (
                   <>
                       <Select value={filterSize} onValueChange={setFilterSize}>
                            <SelectTrigger className="w-full lg:w-[130px] h-9 sm:h-10 text-[10px] sm:text-[11px] font-black border border-indigo-200/60 text-indigo-700 bg-indigo-50/50 rounded-lg focus:ring-1 focus:ring-indigo-500 uppercase tracking-wider px-2.5 shadow-sm hover:bg-indigo-50 transition-colors">
                                <SelectValue placeholder="Size" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg shadow-xl border-slate-200">
                                <SelectItem value="all" className="font-black uppercase text-[10px] sm:text-[11px]">All Sizes</SelectItem>
                                {sortedSizes.map((size) => (
                                    <SelectItem key={size} value={size} className="font-black uppercase text-[10px] sm:text-[11px]">
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
 
                        <Select value={filterRegulator} onValueChange={setFilterRegulator}>
                            <SelectTrigger className="w-full lg:w-[130px] h-9 sm:h-10 text-[10px] sm:text-[11px] font-black border border-orange-200/60 text-orange-700 bg-orange-50/50 rounded-lg focus:ring-1 focus:ring-orange-500 uppercase tracking-wider px-2.5 shadow-sm hover:bg-orange-50 transition-colors">
                                <SelectValue placeholder="Regulator" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg shadow-xl border-slate-200">
                                <SelectItem value="all" className="font-black uppercase text-[10px] sm:text-[11px]">All Types</SelectItem>
                                <SelectItem value="22mm" className="text-orange-600 font-black uppercase text-[10px] sm:text-[11px]">22mm</SelectItem>
                                <SelectItem value="20mm" className="text-blue-600 font-black uppercase text-[10px] sm:text-[11px]">20mm</SelectItem>
                            </SelectContent>
                        </Select>
                   </>
               )}
 
               {/* STOVE FILTERS */}
               {activeCategory === 'stove' && (
                   <Select value={filterBurner} onValueChange={setFilterBurner}>
                        <SelectTrigger className="w-full sm:w-[140px] h-9 sm:h-10 text-[10px] sm:text-[11px] font-black border border-emerald-200/60 text-emerald-700 bg-emerald-50/50 rounded-lg focus:ring-1 focus:ring-emerald-500 uppercase tracking-wider px-2.5 shadow-sm transition-colors hover:bg-emerald-50">
                            <SelectValue placeholder="Burners" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg shadow-xl border-slate-200">
                            <SelectItem value="all" className="font-black uppercase text-[10px] sm:text-[11px]">All Burners</SelectItem>
                            <SelectItem value="1" className="font-black uppercase text-[10px] sm:text-[11px]">1 Burner</SelectItem>
                            <SelectItem value="2" className="font-black uppercase text-[10px] sm:text-[11px]">2 Burners</SelectItem>
                            <SelectItem value="3" className="font-black uppercase text-[10px] sm:text-[11px]">3 Burners</SelectItem>
                            <SelectItem value="4" className="font-black uppercase text-[10px] sm:text-[11px]">4 Burners</SelectItem>
                        </SelectContent>
                   </Select>
               )}
 
               {/* REGULATOR FILTERS */}
               {activeCategory === 'regulator' && (
                   <Select value={filterRegulator} onValueChange={setFilterRegulator}>
                        <SelectTrigger className="w-full sm:w-[140px] h-9 sm:h-10 text-[10px] sm:text-[11px] font-black border border-orange-200/60 text-orange-700 bg-orange-50/50 rounded-lg focus:ring-1 focus:ring-orange-500 uppercase tracking-wider px-2.5 shadow-sm transition-colors hover:bg-orange-50">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg shadow-xl border-slate-200">
                            <SelectItem value="all" className="font-black uppercase text-[10px] sm:text-[11px]">All Types</SelectItem>
                            <SelectItem value="22mm" className="text-orange-600 font-black uppercase text-[10px] sm:text-[11px]">22mm</SelectItem>
                            <SelectItem value="20mm" className="text-blue-600 font-black uppercase text-[10px] sm:text-[11px]">20mm</SelectItem>
                        </SelectContent>
                   </Select>
               )}
 
               {/* Search Input: Force to full width on mobile if alongside cylinder filters */}
               <div className={cn(
                   "relative w-full flex-1 lg:ml-auto mt-1 sm:mt-0",
                   activeCategory === 'cylinder' ? "col-span-2" : ""
               )}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                        placeholder="Search items..."
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        className="pl-8 h-9 sm:h-10 w-full text-[11px] sm:text-[13px] font-black placeholder:text-slate-400 bg-white border-slate-200/80 focus:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500 rounded-lg uppercase tracking-widest shadow-sm transition-all"
                    />
               </div>
          </div>
      </div>
  );
};