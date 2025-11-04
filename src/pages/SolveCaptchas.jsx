import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData } from '../firebase/firestore';
import CaptchaSolver from '../components/CaptchaSolver';

export default function SolveCaptchas({ user }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      const result = await getUserData(user.uid);
      if (result.success) {
        setUserData(result.data);
      } else {
        setUserData({
          points: 0,
          totalEarned: 0,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserData({
        points: 0,
        totalEarned: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaComplete = async () => {
    // Reload user data after captcha solved
    await loadUserData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Solve Captchas</h1>
        <p className="text-sm text-gray-600">
          Solve captchas to earn points. Each solved captcha awards you points that you can convert to cash.
        </p>
      </div>

      {/* Coming Soon Message */}
      <div className="card bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Feature Coming Soon</h2>
          <p className="text-gray-600 mb-4">
            The captcha solving feature is currently being set up. We'll launch it soon!
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>💡 What to expect:</strong>
            </p>
            <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside mt-2 text-left">
              <li>Solve real captchas from clients</li>
              <li>Earn points for each solved captcha</li>
              <li>Fast and easy solving interface</li>
              <li>Instant points credited to your account</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            Check back soon or follow us for updates!
          </p>
        </div>
      </div>

      {/* Hidden CaptchaSolver - will be enabled when feature is ready */}
      {/* <CaptchaSolver userId={user.uid} onComplete={handleCaptchaComplete} /> */}

      <div className="card mt-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800 mb-2">
          <strong>💡 How it will work:</strong>
        </p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Solve captchas from real clients</li>
          <li>Get points instantly for each correct solution</li>
          <li>Points are automatically added to your account</li>
          <li>Convert points to cash via the Withdraw page</li>
        </ul>
      </div>
    </div>
  );
}


