import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@admitly/ui';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validation';
import admitlyLogo from '@/assets/images/admitly-logo.png';

export const ForgotPasswordPage: FC = () => {
  const { resetPassword, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setSuccess(false);

    const result = await resetPassword(data.email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img
            src={admitlyLogo}
            alt="Admitly"
            className="h-20 sm:h-24 mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Email sent successfully!</p>
              <p className="text-sm text-green-700 mt-1">
                Check your inbox for password reset instructions. The link will expire in 1 hour.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Reset Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading || success}>
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Need help?</strong> If you're having trouble resetting your password, contact
            our support team at{' '}
            <a
              href="mailto:support@admitly.com.ng"
              className="font-medium underline hover:text-blue-900"
            >
              support@admitly.com.ng
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

ForgotPasswordPage.displayName = 'ForgotPasswordPage';
