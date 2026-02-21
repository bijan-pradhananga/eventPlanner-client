import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema, type RegisterFormValues } from '@/lib/validations';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser, clearError } from '@/store/authSlice';
import ErrorMessage from '@/components/shared/ErrorMessage';

// Sign Up Page
export default function SignUpPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/events');
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = (values: RegisterFormValues) => {
    dispatch(
      registerUser({
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-start md:justify-center">
      <div className="w-full max-w-md flex flex-col pb-10 bg-white rounded-lg shadow-md">
        <SignUpHeader />
        <HeroImage />
        <div className="px-6 flex flex-col gap-4 mt-5">
          <ErrorMessage error={error} />
          <SignUpForm onSubmit={onSubmit} isLoading={isLoading} />
          <LoginPrompt />
        </div>
      </div>
    </div>
  );
}

function SignUpHeader() {
  return (
    <div className="w-full flex items-center pt-6 pb-4 bg-white border-gray-200 rounded-t-lg">
      <span className="flex-1 text-center text-base font-semibold text-gray-900">
        Sign Up
      </span>
    </div>
  );
}

function HeroImage() {
  return (
    <div
      className="relative w-full h-44 bg-cover bg-center flex items-end overflow-hidden"
      style={{ backgroundImage: `url(/event.jpg)` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 p-5 pb-4">
        <h2 className="text-white text-2xl font-bold leading-tight">
          Plan Your Next Event
        </h2>
        <p className="text-white/80 text-sm mt-1">
          Start organizing weddings, parties, and corporate events with ease.
        </p>
      </div>
    </div>
  );
}

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-gray-300 shrink-0" />
      )}
      <span className={`text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

interface SignUpFormProps {
  onSubmit: (values: RegisterFormValues) => void;
  isLoading: boolean;
}

function SignUpForm({ onSubmit, isLoading }: SignUpFormProps) {
  const [passwordValue, setPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const passwordField = register('password');

  const hasMin8 = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSymbol = /[^A-Za-z0-9]/.test(passwordValue);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Name Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            placeholder="Jane"
            className="bg-white"
            {...register('first_name')}
          />
          {errors.first_name && (
            <p className="text-xs text-red-500">{errors.first_name.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            placeholder="Doe"
            className="bg-white"
            {...register('last_name')}
          />
          {errors.last_name && (
            <p className="text-xs text-red-500">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="jane@example.com"
            className="pl-9 bg-white"
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-9 bg-white"
            {...passwordField}
            onChange={(e) => {
              setPasswordValue(e.target.value);
              void passwordField.onChange(e);
            }}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Password Requirements */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
        <p className="text-xs font-semibold text-primary tracking-wider mb-3 uppercase">
          Password Requirements
        </p>
        <div className="grid grid-cols-2 gap-2">
          <PasswordRequirement met={hasMin8} label="8+ Characters" />
          <PasswordRequirement met={hasUppercase} label="One Uppercase" />
          <PasswordRequirement met={hasNumber} label="One Number" />
          <PasswordRequirement met={hasSymbol} label="One Symbol" />
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-base font-semibold mt-1"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}

function LoginPrompt() {
  return (
    <p className="text-sm text-muted-foreground text-center">
      Already have an account?{' '}
      <Link to="/login" className="text-primary font-semibold hover:underline">
        Log In
      </Link>
    </p>
  );
}
