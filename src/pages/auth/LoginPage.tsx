import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Eye, EyeOff, LogIn, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, type LoginFormValues } from '@/lib/validations';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/authSlice';
import ErrorMessage from '@/components/shared/ErrorMessage';

// Login Page
export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/events');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = (values: LoginFormValues) => {
    dispatch(loginUser(values));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] py-8">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl flex flex-col items-center px-0 sm:px-6 py-0 sm:py-0">
        <LoginHeader />

        <div className="w-full flex flex-col items-center gap-6 pb-10 px-6">
          <AppIcon />
          <WelcomeMessage />
          <ErrorMessage error={error} />
          <LoginForm onSubmit={onSubmit} isLoading={isLoading} />
          <SignUpPrompt />
        </div>
      </div>
    </div>
  );
}

function LoginHeader() {
  return (
    <div className="w-full flex items-center px-4 pt-6 pb-4">
      <span className="flex-1 text-center text-base font-semibold text-gray-900">
        Evently
      </span>
    </div>
  );
}

function AppIcon() {
  return (
    <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">
      <CalendarCheck className="w-10 h-10 text-primary" />
    </div>
  );
}

function WelcomeMessage() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Login to manage your upcoming events
      </p>
    </div>
  );
}

function PasswordToggleButton({
  showPassword,
  toggle,
}: {
  showPassword: boolean;
  toggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isLoading: boolean;
}

function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="ram@example.com"
            className="pr-10 bg-white"
            {...register('email')}
          />
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {/* <Link
            to="/forgot-password"
            className="text-xs text-primary font-medium hover:underline"
          >
            Forgot Password?
          </Link> */}
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pr-10 bg-white"
            {...register('password')}
          />
          <PasswordToggleButton
            showPassword={showPassword}
            toggle={() => setShowPassword((p) => !p)}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-base font-semibold mt-2"
      >
        {isLoading ? (
          'Logging in...'
        ) : (
          <span className="flex items-center gap-2">
            Login <LogIn className="w-4 h-4" />
          </span>
        )}
      </Button>
    </form>
  );
}

function SignUpPrompt() {
  return (
    <p className="text-sm text-muted-foreground">
      Don't have an account?{' '}
      <Link to="/signup" className="text-primary font-semibold hover:underline">
        Sign Up
      </Link>
    </p>
  );
}

