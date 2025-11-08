import { Link, useLocation } from 'react-router-dom';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, Wallet as WalletIcon, DollarSign, Settings, Menu, X, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import LogoutModal from './LogoutModal';

export default function Navbar({ user, isAdmin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center px-3 py-2 rounded-lg hover:bg-purple-50/50 transition-all duration-200 group">
              <div className="relative">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
                  ZunoTasks
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></div>
              </div>
            </Link>
            {/* Desktop nav */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 transform scale-105'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/50'
                }`}
              >
                <Home className={`w-4 h-4 mr-2 ${isActive('/dashboard') ? 'text-white' : 'text-purple-600'}`} />
                Dashboard
              </Link>
              <Link
                to="/wallet"
                className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/wallet')
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 transform scale-105'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/50'
                }`}
              >
                <WalletIcon className={`w-4 h-4 mr-2 ${isActive('/wallet') ? 'text-white' : 'text-purple-600'}`} />
                Wallet
              </Link>
              <Link
                to="/withdraw"
                className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/withdraw')
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 transform scale-105'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/50'
                }`}
              >
                <DollarSign className={`w-4 h-4 mr-2 ${isActive('/withdraw') ? 'text-white' : 'text-purple-600'}`} />
                Withdraw
              </Link>
              <Link
                to="/help"
                className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive('/help')
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 transform scale-105'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/50'
                }`}
              >
                <HelpCircle className={`w-4 h-4 mr-2 ${isActive('/help') ? 'text-white' : 'text-purple-600'}`} />
                Help & Support
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive('/admin')
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 transform scale-105'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50/50'
                  }`}
                >
                  <Settings className={`w-4 h-4 mr-2 ${isActive('/admin') ? 'text-white' : 'text-purple-600'}`} />
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="sm:hidden inline-flex items-center justify-center p-2.5 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              aria-label="Open main menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">{user?.email}</span>
              </div>
              <button
                onClick={handleLogoutClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="sm:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive('/dashboard') 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <Home className={`w-4 h-4 mr-3 ${isActive('/dashboard') ? 'text-white' : 'text-purple-600'}`} /> 
              Dashboard
            </Link>
            <Link
              to="/wallet"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive('/wallet') 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <WalletIcon className={`w-4 h-4 mr-3 ${isActive('/wallet') ? 'text-white' : 'text-purple-600'}`} /> 
              Wallet
            </Link>
            <Link
              to="/withdraw"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive('/withdraw') 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <DollarSign className={`w-4 h-4 mr-3 ${isActive('/withdraw') ? 'text-white' : 'text-purple-600'}`} /> 
              Withdraw
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive('/help') 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <HelpCircle className={`w-4 h-4 mr-3 ${isActive('/help') ? 'text-white' : 'text-purple-600'}`} /> 
              Help & Support
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive('/admin') 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                <Settings className={`w-4 h-4 mr-3 ${isActive('/admin') ? 'text-white' : 'text-purple-600'}`} /> 
                Admin
              </Link>
            )}

            {/* Mobile user info */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">{user?.email}</span>
              </div>
              {/* Mobile logout button */}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogoutClick();
                }}
                className="w-full flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        userEmail={user?.email || 'Unknown'}
      />
    </nav>
  );
}

