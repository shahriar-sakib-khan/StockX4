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
import { registerSchema, RegisterInput } from '@repo/shared';

export const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema as any),
  });
  const { register: registerAction, googleLogin, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: RegisterInput) => {
    registerAction(data);
  };

  return (
    <form className="space-y-2.5 sm:space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name" className="block text-xs sm:text-base font-bold text-slate-700 uppercase tracking-widest mb-0.5 sm:mb-1">
          Full Name
        </label>
        <div className="mt-0.5 sm:mt-1">
          <Input
            id="name"
            type="text"
            autoComplete="name"
            {...register('name')}
            placeholder="Enter your full name"
            className="h-12 sm:h-12 text-sm"
          />
          {errors.name && <p className="mt-1 text-[10px] text-destructive italic font-bold">{errors.name.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs sm:text-base font-bold text-slate-700 uppercase tracking-widest mb-0.5 sm:mb-1">
          Email address
        </label>
        <div className="mt-0.5 sm:mt-1">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            placeholder="Enter your email"
            className="h-12 sm:h-12 text-sm"
          />
          {errors.email && <p className="mt-1 text-[10px] text-destructive italic font-bold">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs sm:text-base font-bold text-slate-700 uppercase tracking-widest mb-0.5 sm:mb-1">
          Phone Number
        </label>
        <div className="mt-0.5 sm:mt-1">
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...register('phone' as any)}
            placeholder="e.g. 01700000000"
            className="h-12 sm:h-12 text-sm"
          />
          {(errors as any).phone && <p className="mt-1 text-[10px] text-destructive italic font-bold">{(errors as any).phone.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-xs sm:text-base font-bold text-slate-700 uppercase tracking-widest mb-0.5 sm:mb-1">
          Password
        </label>
        <div className="mt-0.5 sm:mt-1 relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('password')}
            placeholder="Choose a strong password"
            className="pr-10 h-12 sm:h-12 text-sm"
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

      <div className="pt-2 sm:pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-[48px] sm:min-h-12 text-sm sm:text-base font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </div>

      <div className="relative py-2">
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
