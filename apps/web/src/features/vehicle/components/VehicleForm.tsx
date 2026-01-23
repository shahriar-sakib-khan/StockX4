import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleSchema, VehicleInput } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateVehicle } from '../hooks/useVehicles';

interface VehicleFormProps {
    onSuccess?: () => void;
}

export const VehicleForm = ({ onSuccess }: VehicleFormProps) => {
    const { mutate, isPending } = useCreateVehicle();
    const form = useForm<VehicleInput>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            licensePlate: '',
            vehicleModel: '',
            driverName: '',
            driverPhone: ''
        }
    });

    const onSubmit = (data: VehicleInput) => {
        mutate(data, {
            onSuccess: () => {
                form.reset();
                onSuccess?.();
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="text-sm font-medium">License Plate</label>
                <Input {...form.register('licensePlate')} placeholder="e.g. DHAKA-METRO-GA-1234" />
                {form.formState.errors.licensePlate && <p className="text-red-500 text-xs">{form.formState.errors.licensePlate.message}</p>}
            </div>

            <div>
                <label className="text-sm font-medium">Vehicle Model (Optional)</label>
                <Input {...form.register('vehicleModel')} placeholder="e.g. Tata Ace" />
                {form.formState.errors.vehicleModel && <p className="text-red-500 text-xs">{form.formState.errors.vehicleModel.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-sm font-medium">Driver Name</label>
                   <Input {...form.register('driverName')} placeholder="Driver Name" />
                </div>
                <div>
                   <label className="text-sm font-medium">Driver Phone</label>
                   <Input {...form.register('driverPhone')} placeholder="017..." />
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Adding...' : 'Add Vehicle'}
                </Button>
            </div>
        </form>
    );
};
