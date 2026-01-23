import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staffLoginSchema, StaffLoginInput } from '@repo/shared';
import { staffApi } from '../api/staff.api';
import { useStaffStore } from '../stores/staff.store';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Store as StoreIcon, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export const StaffLoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useStaffStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<StaffLoginInput>({
    resolver: zodResolver(staffLoginSchema),
  });

  useEffect(() => {
    const storeParam = searchParams.get('store');
    if (storeParam) {
        setValue('storeId', storeParam);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: StaffLoginInput) => {
    setIsLoading(true);
    try {
      const res = await staffApi.login(data);
      setAuth(res.staff, res.accessToken);

      toast.success(`Welcome, ${res.staff.name}!`);
      navigate('/pos');
    } catch (error: any) {
      console.error('Login failed', error);
      const message = await error.response?.json().then((d: any) => d.error).catch(() => 'Invalid credentials');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <Link to="/login" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to User Login
      </Link>

      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <StoreIcon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Staff Portal</h1>
            <p className="text-muted-foreground">Login to your store terminal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Store ID</label>
                <Input
                    {...register('storeId')}
                    placeholder="Enter Store ID"
                    autoComplete="off"
                />
                {errors.storeId && <p className="text-destructive text-xs">{errors.storeId.message}</p>}
                <p className="text-xs text-muted-foreground">Ask your manager if you don't know this.</p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Staff ID / Email</label>
                <Input
                    {...register('staffId')}
                    placeholder="e.g. 001 or john@store.com"
                    autoComplete="username"
                />
                {errors.staffId && <p className="text-destructive text-xs">{errors.staffId.message}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                    <Input
                        {...register('password')}
                        type={showPassword ? "text" : "password"}
                        placeholder="******"
                        autoComplete="current-password"
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>

            <Button
                type="submit"
                className="w-full mt-6"
                disabled={isLoading}
            >
                {isLoading ? 'Logging in...' : 'Login'}
            </Button>
        </form>
      </div>
    </div>
  );
};
