import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, CalendarCheck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { verify2FAUser, loginUser, clearError } from '@/store/authSlice';
import { toast } from 'sonner';

const CODE_LENGTH = 6;
const SESSION_SECONDS = 10 * 60; // 10 minutes

interface LocationState {
  tempToken: string;
  credentials: { email: string; password: string };
}

export default function Verify2FAPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.auth);

  const state = location.state as LocationState | null;

  const [tempToken, setTempToken] = useState(state?.tempToken ?? '');
  const credentials = state?.credentials;

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if arrived without state
  useEffect(() => {
    if (!state?.tempToken) {
      navigate('/login', { replace: true });
    }
    return () => {
      dispatch(clearError());
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          toast.error('Session expired. Please log in again.');
          navigate('/login', { replace: true });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setSubmitError(null);
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    const next = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setCode(next);
    setSubmitError(null);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = useCallback(async () => {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) {
      setSubmitError('Please enter the complete 6-digit code.');
      return;
    }
    setSubmitError(null);
    try {
      await dispatch(verify2FAUser({ tempToken, code: fullCode })).unwrap();
      navigate('/events', { replace: true });
    } catch (err: unknown) {
      const msg = err as string;
      setSubmitError(msg ?? 'Invalid or expired code. Please try again.');
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  }, [code, tempToken, dispatch, navigate]);

  const handleResend = async () => {
    if (!credentials || isResending) return;
    setIsResending(true);
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      if (result.requires2FA) {
        setTempToken(result.tempToken);
        setSecondsLeft(SESSION_SECONDS);
        setCode(Array(CODE_LENGTH).fill(''));
        setSubmitError(null);
        inputRefs.current[0]?.focus();
        toast.success('A new code has been sent to your email.');
      }
    } catch {
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] py-8">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl flex flex-col items-center px-0 sm:px-6 py-0">
        {/* Header */}
        <div className="w-full flex items-center px-4 pt-6 pb-4">
          <span className="flex-1 text-center text-base font-semibold text-gray-900">Evently</span>
        </div>

        <div className="w-full flex flex-col items-center gap-6 pb-10 px-6">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">
            <CalendarCheck className="w-10 h-10 text-primary" />
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>
              Code expires in{' '}
              <span className={secondsLeft < 60 ? 'text-red-600 font-bold' : 'text-primary font-bold'}>
                {formatTime(secondsLeft)}
              </span>
            </span>
          </div>

          {/* OTP Inputs */}
          <div className="flex gap-3">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 text-center text-xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  submitError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
            ))}
          </div>

          {/* Error */}
          {submitError && (
            <p className="text-sm text-red-500 text-center">{submitError}</p>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || code.join('').length !== CODE_LENGTH}
            className="w-full h-12 text-base font-semibold"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>

          {/* Resend */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Didn't receive a code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="flex items-center gap-1 text-primary font-semibold hover:underline disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" />
              {isResending ? 'Sending...' : 'Resend'}
            </button>
          </div>

          {/* Back to login */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
