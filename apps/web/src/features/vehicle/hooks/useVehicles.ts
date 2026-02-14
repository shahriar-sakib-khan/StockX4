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

export const useVehicle = (vehicleId: string) => {
    const { id: storeId } = useParams<{ id: string }>();

    return useQuery({
        queryKey: ['vehicle', vehicleId],
        queryFn: async () => {
            if (!vehicleId) return null;
            const res = await api.get(`vehicles/${vehicleId}`, { headers: { 'x-store-id': storeId } }).json<{ vehicle: any }>();
            return res.vehicle;
        },
        enabled: !!vehicleId && !!storeId,
    });
};

export const useUpdateVehicle = () => {
    const queryClient = useQueryClient();
    const { id: storeId } = useParams<{ id: string }>();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: VehicleInput }) => {
            return api.patch(`vehicles/${id}`, {
                json: data,
                headers: { 'x-store-id': storeId }
            }).json();
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['vehicles', storeId] });
            queryClient.invalidateQueries({ queryKey: ['vehicle', variables.id] });
            toast.success('Vehicle updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update vehicle');
        }
    });
};
