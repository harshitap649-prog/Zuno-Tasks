import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChange, logout } from './firebase/auth';
import { getUserData } from './firebase/firestore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SolveCaptchas from './pages/SolveCaptchas';
import Tasks from './pages/Tasks';
import Wallet from './pages/Wallet';
import Withdraw from './pages/Withdraw';
import HelpSupport from './pages/HelpSupport';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import Loading from './components/Loading';
import BannerAd from './components/BannerAd';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChange(async (currentUser) => {
        if (currentUser) {
          // Check if user is disabled or banned
          const userDataResult = await getUserData(currentUser.uid);
          if (userDataResult.success) {
            const userData = userDataResult.data;
            if (userData.disabled || userData.banned) {
              await logout();
              setUser(null);
              setError(userData.disabled ? 'Your account has been disabled. Please contact support.' : 'Your account has been banned.');
              setLoading(false);
              return;
            }
          }
        }
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

  // Inner component to access useLocation
  function AppContent() {
    const location = useLocation();

    return (
      <div className="min-h-screen flex flex-col">
        {user && <Navbar user={user} isAdmin={isAdmin} />}
        <div className="flex-1 pb-20">
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
              path="/tasks" 
              element={user ? <Tasks user={user} /> : <Navigate to="/login" />} 
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
              path="/help" 
              element={user ? <HelpSupport user={user} /> : <Navigate to="/login" />} 
            />
            <Route
              path="/captchas"
              element={user ? <SolveCaptchas user={user} /> : <Navigate to="/login" />}
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
        
        {/* Bottom Banner Ad - Always visible on all pages */}
        <div className="border-t border-gray-200 bg-white fixed bottom-0 left-0 right-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2">
            <BannerAd className="w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

