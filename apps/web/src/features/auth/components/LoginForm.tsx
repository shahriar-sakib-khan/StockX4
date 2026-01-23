import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

import { loginSchema, LoginInput } from '@repo/shared';

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema as any),
  });
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email address
        </label>
        <div className="mt-1">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            placeholder="Enter your email"
          />
          {errors.email && <p className="mt-2 text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
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
          className="w-full"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>
    </form>
  );
};
