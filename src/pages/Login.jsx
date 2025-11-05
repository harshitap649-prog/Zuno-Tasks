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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 opacity-90"></div>
      <div 
        className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <h1 className="text-6xl font-extrabold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent drop-shadow-lg mb-3">
              ZunoTasks
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto"></div>
          </div>
          <p className="text-white text-lg font-semibold mb-2 drop-shadow-md">Complete. Watch. Earn. Withdraw.</p>
          <p className="text-purple-100 text-sm max-w-md mx-auto leading-relaxed">
            Earn real money by completing simple tasks and watching ads. Convert points to cash (100 points = ₹10). 
            Minimum withdrawal ₹100 via UPI/Paytm.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Card Gradient Overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
          {/* Toggle Button */}
          <div className="flex justify-center mb-6">
            <div className="relative bg-gray-100 rounded-xl p-1 inline-flex">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setFieldErrors({});
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isLogin
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setFieldErrors({});
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  !isLogin
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl flex items-start text-red-700 shadow-lg animate-fade-in">
              <div className="bg-red-100 rounded-full p-2 mr-3 flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">Authentication Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="ml-2 text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-100 rounded-full"
                aria-label="Close error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                    fieldErrors.name ? 'text-red-400' : 'text-gray-400 group-focus-within:text-purple-600'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError('name');
                    }}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                      fieldErrors.name 
                        ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 bg-gray-50/50 focus:bg-white hover:border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                    <AlertCircle className="w-4 h-4 mr-1.5" />
                    {fieldErrors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                  fieldErrors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-purple-600'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                    fieldErrors.email 
                      ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 bg-gray-50/50 focus:bg-white hover:border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                  <AlertCircle className="w-4 h-4 mr-1.5" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                  fieldErrors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-purple-600'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                    fieldErrors.password 
                      ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 bg-gray-50/50 focus:bg-white hover:border-gray-300'
                  }`}
                  placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
                  required
                  minLength={6}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                  <AlertCircle className="w-4 h-4 mr-1.5" />
                  {fieldErrors.password}
                </p>
              )}
              {!isLogin && !fieldErrors.password && password.length > 0 && password.length < 6 && (
                <p className="mt-2 text-sm text-purple-600 flex items-center">
                  <Lock className="w-4 h-4 mr-1.5" />
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/95 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="mt-5 w-full flex items-center justify-center px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-md bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
              Continue with Google
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

