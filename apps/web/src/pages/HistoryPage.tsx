import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { transactionApi } from '../features/transaction/api/transaction.api';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, Filter } from 'lucide-react';
import { Receipt } from '@/features/transaction/components/Receipt';
import { useStore } from '@/features/store/hooks/useStores';

export const HistoryPage = () => {
  const { id: storeId } = useParams<{ id: string }>();
  const { data: storeData } = useStore(storeId || '');

  // Filter States
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Selected Transaction for Modal
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Fetch History
  const { data, isLoading } = useQuery({
    queryKey: ['history', storeId, search, date, sortBy, sortOrder, page],
    queryFn: () => transactionApi.getHistory(storeId!, {
      search,
      startDate: date, // Simple date filter (starts from this date)
      sortBy,
      sortOrder,
      page,
      limit: 20
    }),
    enabled: !!storeId,
  });

  const transactions = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Transaction History</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>

          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-[150px]"
          />

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date</SelectItem>
              <SelectItem value="finalAmount">Amount</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title="Toggle Sort Order"
          >
            <Filter className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                 <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No transactions found.
                 </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx: any) => (
                <TableRow
                    key={tx._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedTransaction(tx)}
                >
                  <TableCell>{format(new Date(tx.createdAt), 'dd MMM yyyy, HH:mm')}</TableCell>
                  <TableCell className="font-mono text-xs">{tx._id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell>{tx.customerId?.name || 'Walk-in Customer'}</TableCell>
                  <TableCell className="capitalize">{tx.items.some((i:any) => i.saleType === 'REFILL') ? 'Refill' : 'Sale'}</TableCell>
                  <TableCell className="text-right font-bold">{tx.finalAmount}</TableCell>
                  <TableCell className="text-right">{tx.paidAmount}</TableCell>
                  <TableCell className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tx.dueAmount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                        {tx.dueAmount > 0 ? 'Due' : 'Paid'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && (
          <div className="flex justify-end gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                  Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= meta.totalPages}
              >
                  Next
              </Button>
          </div>
      )}

      {/* Invoice Modal */}
      <Modal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        title="Invoice Details"
        className="max-w-2xl"
      >
            {selectedTransaction && (
                <div className="flex justify-center p-4 bg-muted/20 rounded max-h-[60vh] overflow-y-auto">
                    <Receipt
                        transaction={selectedTransaction}
                        storeName={storeData?.store?.name || 'Store'}
                    />
                </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => window.print()}>
                    Print Receipt
                </Button>
                <Button onClick={() => setSelectedTransaction(null)}>
                    Close
                </Button>
            </div>
      </Modal>
    </div>
  );
};
