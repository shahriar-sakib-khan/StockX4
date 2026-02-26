import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

import { registerSchema, RegisterInput } from '@repo/shared';

export const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema as any),
  });
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: RegisterInput) => {
    registerUser(data);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Full Name
        </label>
        <div className="mt-1">
          <Input
            id="name"
            type="text"
            autoComplete="name"
            {...register('name')}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="mt-2 text-sm text-destructive">{errors.name.message}</p>}
        </div>
      </div>

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
            autoComplete="new-password"
            {...register('password')}
            placeholder="Choose a strong password"
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
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </div>
    </form>
  );
};
