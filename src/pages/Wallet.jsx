import { useState, useEffect } from 'react';
import { getUserData, getUserTransactions } from '../firebase/firestore';
import { Coins, TrendingUp, Download, Clock, Wallet as WalletIcon, ArrowDown, ArrowUp, Activity, Sparkles, CheckCircle } from 'lucide-react';

export default function Wallet({ user }) {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const userResult = await getUserData(user.uid);
      const transactionsResult = await getUserTransactions(user.uid);

      if (userResult.success) {
        setUserData(userResult.data);
      } else {
        // If user document doesn't exist, create default values
        console.log('User data not found, using defaults:', userResult.error);
        setUserData({
          points: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          name: user.displayName || user.email || 'User',
          email: user.email,
        });
      }
      
      if (transactionsResult.success) {
        setTransactions(transactionsResult.transactions);
      } else {
        console.log('Transactions error:', transactionsResult.error);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values on error
      setUserData({
        points: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        name: user.displayName || user.email || 'User',
        email: user.email,
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const points = userData.points || 0;
  const totalEarned = userData.totalEarned || 0;
  const totalWithdrawn = userData.totalWithdrawn || 0;
  const currentBalance = (points / 10).toFixed(2);
  const totalEarnedRupees = (totalEarned / 10).toFixed(2);
  const totalWithdrawnRupees = (totalWithdrawn / 10).toFixed(2);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const formatPoints = (points) => {
    return `₹${(points / 10).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Hero Section */}
        <div className="text-center mb-4">
          <div className="relative inline-flex items-center justify-center mb-2">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 p-2 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <WalletIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
            My Wallet
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Track your earnings, view your balance, and monitor all your transactions in one place.
          </p>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl shadow-lg p-4 text-white transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Coins className="w-5 h-5" />
              </div>
              <div className="bg-white/10 rounded-full px-2 py-0.5">
                <span className="text-xs font-semibold">Balance</span>
              </div>
            </div>
            <p className="text-green-100 text-xs font-medium mb-1">Current Balance</p>
            <p className="text-3xl font-bold mb-1">₹{currentBalance}</p>
            <p className="text-green-100 text-xs">{points.toLocaleString()} points</p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center text-xs">
                <Sparkles className="w-3 h-3 mr-1.5" />
                <span>Ready to withdraw</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-500 rounded-xl shadow-lg p-4 text-white transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="bg-white/10 rounded-full px-2 py-0.5">
                <span className="text-xs font-semibold">Earnings</span>
              </div>
            </div>
            <p className="text-blue-100 text-xs font-medium mb-1">Total Earned</p>
            <p className="text-3xl font-bold mb-1">₹{totalEarnedRupees}</p>
            <p className="text-blue-100 text-xs">{totalEarned.toLocaleString()} points</p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center text-xs">
                <ArrowUp className="w-3 h-3 mr-1.5" />
                <span>All-time earnings</span>
              </div>
          </div>
        </div>

          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-lg p-4 text-white transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Download className="w-5 h-5" />
              </div>
              <div className="bg-white/10 rounded-full px-2 py-0.5">
                <span className="text-xs font-semibold">Withdrawn</span>
              </div>
            </div>
            <p className="text-purple-100 text-xs font-medium mb-1">Total Withdrawn</p>
            <p className="text-3xl font-bold mb-1">₹{totalWithdrawnRupees}</p>
            <p className="text-purple-100 text-xs">{totalWithdrawn.toLocaleString()} points</p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center text-xs">
                <ArrowDown className="w-3 h-3 mr-1.5" />
                <span>Cash withdrawn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Info & Eligibility */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-3">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg mr-3">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Conversion Rate</h3>
            </div>
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">100 points</span>
                  <span className="text-lg font-bold text-green-600">= ₹10</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Minimum Withdrawal</span>
                  <span className="text-sm font-bold text-blue-600">₹100</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">(1,000 points required)</p>
          </div>
        </div>
      </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg mr-3">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Withdrawal Status</h3>
            </div>
            <div className={`rounded-lg p-3 ${
              points >= 1000 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
                : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Current Status</span>
                {points >= 1000 ? (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Eligible
                  </span>
                ) : (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Not Eligible
                  </span>
                )}
              </div>
              {points >= 1000 ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-green-700">✅ You're eligible to withdraw!</p>
                  <p className="text-xs text-green-600">You have enough points to make a withdrawal request.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-yellow-700">⚠️ More points needed</p>
                  <p className="text-xs text-yellow-600">
                    You need <strong className="text-yellow-800">{(1000 - points).toLocaleString()} more points</strong> to be eligible for withdrawal.
                  </p>
                  <div className="mt-2 bg-white/50 rounded-lg p-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-bold text-yellow-700">{Math.min(Math.round((points / 1000) * 100), 100)}%</span>
                    </div>
                    <div className="mt-1.5 w-full bg-yellow-200 rounded-full h-1.5">
                      <div 
                        className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((points / 1000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
          </div>
              )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 md:p-5 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg mr-3">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Transaction History</h2>
            </div>
            <div className="bg-gray-100 rounded-lg px-3 py-1">
              <span className="text-xs font-semibold text-gray-600">{transactions.length} transactions</span>
            </div>
          </div>

        {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="relative inline-flex items-center justify-center mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gray-100 p-4 rounded-lg">
                  <Activity className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">No transactions yet</p>
              <p className="text-gray-400 text-xs mt-1">Start completing tasks to earn points and see your transaction history here!</p>
          </div>
        ) : (
            <div className="space-y-2">
                {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border-2 border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-amber-300 transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'task'
                          ? 'bg-gradient-to-br from-blue-100 to-cyan-100'
                          : transaction.type === 'ad'
                          ? 'bg-gradient-to-br from-purple-100 to-pink-100'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200'
                      }`}>
                        {transaction.type === 'task' ? (
                          <Coins className="w-4 h-4 text-blue-600" />
                        ) : transaction.type === 'ad' ? (
                          <Activity className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Activity className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            transaction.type === 'task'
                              ? 'bg-blue-100 text-blue-800'
                          : transaction.type === 'ad'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                            {transaction.type === 'task' ? '🎯 Task Completed' : transaction.type === 'ad' ? '📺 Ad Watched' : transaction.type}
                      </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600 mb-0.5">
                          <Clock className="w-3 h-3 mr-1.5" />
                      {formatTimestamp(transaction.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="flex items-center justify-end mb-0.5">
                        <ArrowUp className="w-4 h-4 text-green-500 mr-1.5" />
                        <p className="text-lg font-bold text-green-600">+{transaction.points}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">{formatPoints(transaction.points)}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

