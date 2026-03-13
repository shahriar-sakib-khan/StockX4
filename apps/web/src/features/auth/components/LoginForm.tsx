import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';
import { unifiedLoginSchema, UnifiedLoginInput } from '@repo/shared';

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<UnifiedLoginInput>({
    resolver: zodResolver(unifiedLoginSchema),
  });
  const { login, googleLogin, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: any) => {
    login({ identifier: data.identifier, password: data.password });
  };

  const onError = (valErrors: any) => {
    // Validation errors are shown inline via react-hook-form
  };

  return (
    <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit(onSubmit, onError)}>
      <div>
        <label htmlFor="identifier" className="block text-xs sm:text-base font-bold text-slate-700 uppercase tracking-widest mb-1">
          Phone or Email
        </label>
        <div>
          <Input
            id="identifier"
            type="text"
            autoComplete="username"
            {...register('identifier')}
            placeholder="Enter your phone or email"
            className="h-12 sm:h-12"
          />
          {(errors as any).identifier && <p className="mt-1 text-[10px] text-destructive italic font-bold">{(errors as any).identifier.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-xs sm:text-base font-bold text-slate-700 uppercase tracking-widest mb-1">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password')}
            placeholder="Enter your password"
            className="pr-10 h-12 sm:h-12"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground z-10 cursor-pointer min-h-[48px]"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 sm:h-5 sm:w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5 sm:h-5 sm:w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-[10px] text-destructive italic font-bold">{errors.password.message}</p>}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[48px] sm:min-h-12 text-sm sm:text-base font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-[10px] sm:text-xs uppercase font-black tracking-widest">
          <span className="bg-white px-2 text-slate-400">Or continue with</span>
        </div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            if (credentialResponse.credential) {
              googleLogin(credentialResponse.credential);
            }
          }}
          onError={() => {
            toast.error('Google Sign-In failed');
          }}
          useOneTap
          theme="outline"
          shape="pill"
          size="large"
          text="continue_with"
          width="100%"
        />
      </div>
    </form>
  );
};
