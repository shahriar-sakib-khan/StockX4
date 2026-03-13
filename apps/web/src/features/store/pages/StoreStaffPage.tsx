
import { useParams } from 'react-router-dom';
import { StaffList } from '@/features/staff/components/StaffList';
import { useQuery } from '@tanstack/react-query';
import { storeApi } from '../api/store.api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

export const StoreStaffPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Fetch store to get the slug
  const { data: storeData } = useQuery({
    queryKey: ['store', id],
    queryFn: () => storeApi.get(id!),
    enabled: !!id,
  });

  const store = storeData?.store;

  if (!id) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="space-y-0.5 sm:space-y-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">Staff Members</h2>
            <p className="text-slate-400 font-bold text-xs sm:text-sm">Manage access and permissions for your team.</p>
          </div>

      </div>

      <StaffList storeId={id} />
    </div>
  );
};
