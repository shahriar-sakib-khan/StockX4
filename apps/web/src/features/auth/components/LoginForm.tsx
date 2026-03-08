import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

import { unifiedLoginSchema, UnifiedLoginInput } from '@repo/shared';

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<UnifiedLoginInput>({
    resolver: zodResolver(unifiedLoginSchema),
  });
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: any) => {
    console.log('Form Submit Data:', data);
    login({ identifier: data.identifier, password: data.password });
  };

  const onError = (valErrors: any) => {
    console.log('Form Validation Errors:', valErrors);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit, onError)}>
      <div>
        <label htmlFor="identifier" className="block text-sm sm:text-base font-medium text-foreground">
          Phone or Email
        </label>
        <div className="mt-1">
          <Input
            id="identifier"
            type="text"
            autoComplete="username"
            {...register('identifier')}
            placeholder="Enter your phone or email"
          />
          {(errors as any).identifier && <p className="mt-2 text-sm text-destructive">{(errors as any).identifier.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm sm:text-base font-medium text-foreground">
          Password
        </label>
        <div className="mt-1 relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password')}
            placeholder="Enter your password"
            className="pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground z-10 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && <p className="mt-2 text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-12 text-base"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>
    </form>
  );
};
