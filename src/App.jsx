import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChange } from './firebase/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Withdraw from './pages/Withdraw';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import Loading from './components/Loading';
import BannerAd from './components/BannerAd';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const popunderLoadedRef = useRef(false);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChange((currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Firebase auth error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Load Popunder ad only after user interaction and with delay (less intrusive)
  useEffect(() => {
    if (!user || popunderLoadedRef.current) return;

    // Only load popunder after 10 seconds and user is on dashboard/wallet/withdraw
    const timer = setTimeout(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/') {
        try {
          // Monetag Popunder - Loads on user interaction
          const popunderScript = document.createElement('script');
          // Escape the script properly to avoid build issues
          const popunderCode = '(function(s){s.dataset.zone=\'10120955\',s.src=\'https://al5sm.com/tag.min.js\'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement(\'script\')))';
          popunderScript.textContent = popunderCode;
          document.head.appendChild(popunderScript);
          popunderLoadedRef.current = true;
        } catch (err) {
          console.error('Error loading popunder ad:', err);
        }
      }
    }, 10000); // 10 second delay - less intrusive

    return () => clearTimeout(timer);
  }, [user]);

  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1 style={{ color: 'red' }}>Error Loading App</h1>
        <p>{error}</p>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          Check browser console (F12) for more details
        </p>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  // Check if user is admin (hardcoded for now - replace with proper admin check)
  const isAdmin = user?.email === 'harshitap649@gmail.com';

  // AdSense banners handled internally in BannerAd component

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {user && <Navbar user={user} isAdmin={isAdmin} />}
        <div className="flex-1">
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" /> : <Login />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/wallet" 
              element={user ? <Wallet user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/withdraw" 
              element={user ? <Withdraw user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={user && isAdmin ? <AdminPanel /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </div>
        {/* Bottom Banner Ad - Non-intrusive, always visible */}
        {user && (
          <div className="border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-2">
              <BannerAd className="w-full" />
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;

