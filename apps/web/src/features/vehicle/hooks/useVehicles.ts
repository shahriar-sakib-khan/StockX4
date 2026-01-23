import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { VehicleInput } from '@repo/shared';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

export const useVehicles = () => {
    const { id: storeId } = useParams<{ id: string }>();

    return useQuery({
        queryKey: ['vehicles', storeId],
        queryFn: async () => {
            const res = await api.get('vehicles', { headers: { 'x-store-id': storeId } }).json<{ vehicles: any[] }>();
            return res.vehicles;
        },
        enabled: !!storeId,
    });
};

export const useCreateVehicle = () => {
    const queryClient = useQueryClient();
    const { id: storeId } = useParams<{ id: string }>();

    return useMutation({
        mutationFn: async (data: VehicleInput) => {
            return api.post('vehicles', {
                json: data,
                headers: { 'x-store-id': storeId }
            }).json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles', storeId] });
            toast.success('Vehicle added successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add vehicle');
        }
    });
};

export const useDeleteVehicle = () => {
    const queryClient = useQueryClient();
    const { id: storeId } = useParams<{ id: string }>();

    return useMutation({
        mutationFn: async (vehicleId: string) => {
            return api.delete(`vehicles/${vehicleId}`, {
                headers: { 'x-store-id': storeId }
            }).json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['vehicles', storeId] });
             toast.success('Vehicle deleted');
        }
    });
};
