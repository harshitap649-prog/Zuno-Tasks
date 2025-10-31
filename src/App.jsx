import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
        {/* Bottom Banner Ad - Hidden on login page and when logout modal might be open */}
        {user && location.pathname !== '/login' && (
          <div className="border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-2">
              <BannerAd className="w-full" />
            </div>
          </div>
        )}
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

