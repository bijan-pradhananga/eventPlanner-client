import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { verifyEmail, clearError } from '@/store/authSlice';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector((s) => s.auth);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const token = searchParams.get('token');

  useEffect(() => {
    dispatch(clearError());
    
    if (!token) {
      setVerificationStatus('error');
      return;
    }

    const handleVerification = async () => {
      try {
        await dispatch(verifyEmail(token)).unwrap();
        setVerificationStatus('success');
      } catch (error) {
        setVerificationStatus('error');
      }
    };

    handleVerification();
  }, [token, dispatch]);

  const handleContinue = () => {
    if (user) {
      navigate('/events');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center">
            {verificationStatus === 'pending' && isLoading && (
              <div className="bg-blue-50 w-full h-full rounded-full flex items-center justify-center">
                <LoadingSpinner />
              </div>
            )}
            {verificationStatus === 'success' && (
              <div className="bg-green-50 w-full h-full rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            )}
            {verificationStatus === 'error' && (
              <div className="bg-red-50 w-full h-full rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            )}
          </div>

          {/* Title and Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {verificationStatus === 'pending' && 'Verifying Email'}
            {verificationStatus === 'success' && 'Email Verified!'}
            {verificationStatus === 'error' && 'Verification Failed'}
          </h1>

          <p className="text-gray-600 mb-6">
            {verificationStatus === 'pending' && 'Please wait while we verify your email address...'}
            {verificationStatus === 'success' && 'Your email has been successfully verified. You can now access all features of your account.'}
            {verificationStatus === 'error' && (
              <>
                {!token 
                  ? 'Invalid verification link. Please check your email and try again.'
                  : error || 'The verification link is invalid or has expired. Please request a new verification email.'
                }
              </>
            )}
          </p>

          {/* Actions */}
          {verificationStatus === 'success' && (
            <Button onClick={handleContinue} className="w-full">
              Continue to App
            </Button>
          )}

          {verificationStatus === 'error' && (
            <div className="space-y-3">
              <Button onClick={handleContinue} variant="outline" className="w-full">
                {user ? 'Back to App' : 'Back to Login'}
              </Button>
              {user && (
                <Link to="/profile">
                  <Button variant="default" className="w-full">
                    Request New Verification Email
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}