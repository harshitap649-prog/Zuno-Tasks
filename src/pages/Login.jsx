import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '../firebase/auth';
import { LogIn, Mail, Lock, User, AlertCircle, X } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get referral code from URL (only store for signup, not login)
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      if (!isLogin) {
        // Store referral code in localStorage for signup only
        localStorage.setItem('pendingReferralCode', refCode);
      } else {
        // Clear referral code if user is on login page (referrals only work for new signups)
        localStorage.removeItem('pendingReferralCode');
      }
    }
  }, [searchParams, isLogin]);

  // Convert Firebase errors to user-friendly messages
  const getErrorMessage = (errorCode, errorMessage) => {
    const errorMap = {
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'No account found with this email address. Please sign up first.',
      'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
      'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
      'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
      'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',
      'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
      'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
    };

    // Check if we have a mapped message
    for (const [key, message] of Object.entries(errorMap)) {
      if (errorCode?.includes(key) || errorMessage?.includes(key)) {
        return message;
      }
    }

    // Fallback to generic message
    if (errorMessage) {
      return errorMessage;
    }
    return isLogin 
      ? 'Sign in failed. Please check your credentials and try again.'
      : 'Sign up failed. Please check your information and try again.';
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    if (!isLogin && !name.trim()) {
      errors.name = 'Please enter your full name.';
    }

    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address (e.g., example@email.com).';
    }

    if (!password) {
      errors.password = 'Please enter your password.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    let result;
    if (isLogin) {
      // Clear any stored referral code on login (referrals only work for new signups)
      localStorage.removeItem('pendingReferralCode');
      result = await signInWithEmail(email, password);
    } else {
      // Get referral code from URL or localStorage (only for new signups)
      const refCode = searchParams.get('ref') || localStorage.getItem('pendingReferralCode');
      result = await signUpWithEmail(email, password, name, refCode);
      // Clear stored referral code after use
      if (refCode) localStorage.removeItem('pendingReferralCode');
    }

    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      const friendlyError = getErrorMessage(result.errorCode, result.error);
      setError(friendlyError);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setFieldErrors({});
    setLoading(true);

    // Get referral code from URL or localStorage (only for new signups)
    let refCode = null;
    if (!isLogin) {
      // Only use referral code for signup, not login
      refCode = searchParams.get('ref') || localStorage.getItem('pendingReferralCode');
      if (refCode) localStorage.removeItem('pendingReferralCode');
    } else {
      // Clear any stored referral code on login (referrals only work for new signups)
      localStorage.removeItem('pendingReferralCode');
    }
    const result = await signInWithGoogle(refCode);
    
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      const friendlyError = getErrorMessage(result.errorCode, result.error);
      setError(friendlyError || 'Google sign-in failed. Please try again.');
    }
  };

  // Clear field error when user starts typing
  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ZunoTasks
          </h1>
          <p className="text-gray-600 mt-2 font-semibold">Complete. Watch. Earn. Withdraw.</p>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Earn real money by completing simple tasks and watching ads. Convert points to cash (100 points = ₹10). 
            Minimum withdrawal ₹100 via UPI/Paytm. Start earning today!
          </p>
        </div>

        <div className="card">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFieldErrors({});
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start text-red-700 animate-fade-in">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">Authentication Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                aria-label="Close error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    fieldErrors.name ? 'text-red-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError('name');
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      fieldErrors.name 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {fieldErrors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  fieldErrors.email ? 'text-red-400' : 'text-gray-400'
                }`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    fieldErrors.email 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  fieldErrors.password ? 'text-red-400' : 'text-gray-400'
                }`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    fieldErrors.password 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
                  required
                  minLength={6}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {fieldErrors.password}
                </p>
              )}
              {!isLogin && !fieldErrors.password && password.length > 0 && password.length < 6 && (
                <p className="mt-1 text-sm text-gray-500 flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

