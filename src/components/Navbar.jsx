import { Link, useLocation } from 'react-router-dom';
import { logout } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, Wallet as WalletIcon, DollarSign, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ user, isAdmin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (!confirmed) return;
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex items-center px-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ZunoTasks
              </span>
            </Link>
            {/* Desktop nav */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Home className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
              <Link
                to="/wallet"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/wallet')
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <WalletIcon className="w-4 h-4 mr-1" />
                Wallet
              </Link>
              <Link
                to="/withdraw"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/withdraw')
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Withdraw
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/admin')
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 mr-2"
              aria-label="Open main menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <span className="text-sm text-gray-700 mr-4 hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 shadow-md">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                isActive('/dashboard') ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4 mr-2" /> Dashboard
            </Link>
            <Link
              to="/wallet"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                isActive('/wallet') ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <WalletIcon className="w-4 h-4 mr-2" /> Wallet
            </Link>
            <Link
              to="/withdraw"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                isActive('/withdraw') ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <DollarSign className="w-4 h-4 mr-2" /> Withdraw
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive('/admin') ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4 mr-2" /> Admin
              </Link>
            )}

            {/* Mobile logout button */}
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

