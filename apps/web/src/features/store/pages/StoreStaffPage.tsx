import { useParams } from 'react-router-dom';
import { StaffList } from '@/features/staff/components/StaffList';
import { useQuery } from '@tanstack/react-query';
import { storeApi } from '../api/store.api';
import { useState } from 'react';

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
    // THE FIX: Stripped out the duplicate headers and bloated wrappers! 
    // Now it just perfectly renders the StaffList we spent all that time polishing.
    <div className="w-full animate-in fade-in duration-300">
      <StaffList storeId={id} />
    </div>
  );
};