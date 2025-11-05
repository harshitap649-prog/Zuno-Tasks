import { useState, useEffect } from 'react';
import { getUserData, createWithdrawalRequest, getUserWithdrawals } from '../firebase/firestore';
import { DollarSign, Wallet, CheckCircle, XCircle, Clock, TrendingUp, CreditCard, AlertCircle, Info, ArrowRight } from 'lucide-react';

export default function Withdraw({ user }) {
  const [userData, setUserData] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState('');
  const [upi, setUpi] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const userResult = await getUserData(user.uid);
      const withdrawalsResult = await getUserWithdrawals(user.uid);

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
      
      if (withdrawalsResult.success) {
        setWithdrawals(withdrawalsResult.withdrawals);
      } else {
        console.log('Withdrawals error:', withdrawalsResult.error);
        setWithdrawals([]);
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
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const withdrawAmount = parseInt(amount);
    if (!withdrawAmount || withdrawAmount < 100) {
      setError('Minimum withdrawal amount is ₹100');
      return;
    }

    if (!upi.trim()) {
      setError('Please enter your UPI ID or Paytm number');
      return;
    }

    const points = userData.points || 0;
    const requiredPoints = withdrawAmount * 10;

    if (points < requiredPoints) {
      setError(`Insufficient balance. You have ${points} points (₹${(points / 10).toFixed(2)}). Need ${requiredPoints} points for ₹${withdrawAmount}.`);
      return;
    }

    setSubmitting(true);

    const result = await createWithdrawalRequest(user.uid, withdrawAmount, upi.trim());

    setSubmitting(false);

    if (result.success) {
      setSuccess(`Withdrawal request of ₹${withdrawAmount} submitted successfully! Admin will process it soon.`);
      setAmount('');
      setUpi('');
      await loadData();
    } else {
      setError(result.error || 'Failed to submit withdrawal request');
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
  const balance = (points / 10).toFixed(2);
  const canWithdraw = points >= 1000;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Hero Section */}
        <div className="text-center mb-4">
          <div className="relative inline-flex items-center justify-center mb-2">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Withdraw Money
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Convert your earned points into real cash. Fast, secure, and reliable withdrawals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Withdrawal Form */}
          <div className="lg:col-span-2 space-y-3">
            {/* Balance Summary Card */}
            <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl shadow-lg p-4 text-white transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mr-3">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-green-100 text-xs font-medium">Available Balance</p>
                    <h2 className="text-2xl font-bold mt-0.5">₹{balance}</h2>
                    <p className="text-green-100 text-xs mt-0.5">{points.toLocaleString()} points</p>
                  </div>
                </div>
                <div className="text-right">
                  <TrendingUp className="w-5 h-5 text-white/80 mb-1" />
                  <p className="text-xs text-green-100">Ready to Cash Out</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
                <div>
                  <p className="text-green-100 text-xs mb-0.5">Total Earned</p>
                  <p className="text-lg font-bold">₹{((userData.totalEarned || 0) / 10).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-green-100 text-xs mb-0.5">Total Withdrawn</p>
                  <p className="text-lg font-bold">₹{((userData.totalWithdrawn || 0) / 10).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Withdrawal Form Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-5 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg mr-3">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Request Withdrawal</h2>
              </div>

              {!canWithdraw && (
                <div className="mb-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-lg flex items-start shadow-sm animate-fade-in">
                  <div className="flex-shrink-0">
                    <div className="bg-yellow-100 rounded-full p-1.5">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex-1 ml-3">
                    <p className="font-bold text-sm text-yellow-900 mb-0.5">Insufficient Balance</p>
                    <p className="text-xs text-yellow-700 leading-relaxed">
                      You need at least 1,000 points (₹100) to withdraw. You currently have {points.toLocaleString()} points (₹{balance}).
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg flex items-start shadow-sm animate-fade-in">
                  <div className="flex-shrink-0">
                    <div className="bg-red-100 rounded-full p-1.5">
                      <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1 ml-3">
                    <p className="font-bold text-sm text-red-900 mb-0.5">Error</p>
                    <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg flex items-start shadow-sm animate-fade-in">
                  <div className="flex-shrink-0">
                    <div className="bg-green-100 rounded-full p-1.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 ml-3">
                    <p className="font-bold text-sm text-green-900 mb-0.5">Success!</p>
                    <p className="text-xs text-green-700 leading-relaxed">{success}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                    <DollarSign className="w-3 h-3 mr-1.5 text-green-600" />
                    Amount (₹) <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="100"
                      step="100"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-400 text-sm font-semibold"
                      placeholder="Enter amount (minimum ₹100)"
                      required
                      disabled={!canWithdraw || submitting}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold text-sm">
                      ₹
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-medium">
                      Points required: <span className="font-bold text-green-600">{amount ? (parseInt(amount) * 10).toLocaleString() : '0'}</span> (₹1 = 10 points)
                    </p>
                    {amount && parseInt(amount) >= 100 && (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center">
                    <CreditCard className="w-3 h-3 mr-1.5 text-green-600" />
                    UPI ID or Paytm Number <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={upi}
                    onChange={(e) => setUpi(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="yourname@paytm or yourname@upi"
                    required
                    disabled={!canWithdraw || submitting}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Make sure your UPI ID or Paytm number is correct
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!canWithdraw || submitting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-sm"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Submit Withdrawal Request
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1.5 mr-2 flex-shrink-0">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2 text-sm">Withdrawal Information</h3>
                    <ul className="text-xs text-blue-800 space-y-1.5">
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-1.5 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span>Minimum withdrawal: <strong>₹100</strong> (1,000 points)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-1.5 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span>Processing time: <strong>24-48 hours</strong> after approval</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-1.5 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span>Supported: <strong>UPI and Paytm</strong></span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-1.5 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span>Points will be deducted immediately upon request</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-300 sticky top-8">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                Quick Stats
              </h3>
              <div className="space-y-2">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-green-700 font-medium mb-0.5">Available Balance</p>
                  <p className="text-lg font-bold text-green-700">₹{balance}</p>
                  <p className="text-xs text-green-600 mt-0.5">{points.toLocaleString()} points</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-blue-700 font-medium mb-0.5">Total Earned</p>
                  <p className="text-lg font-bold text-blue-700">₹{((userData.totalEarned || 0) / 10).toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                  <p className="text-xs text-purple-700 font-medium mb-0.5">Total Withdrawn</p>
                  <p className="text-lg font-bold text-purple-700">₹{((userData.totalWithdrawn || 0) / 10).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="mt-6 bg-white rounded-lg shadow-lg border border-gray-100 p-4 md:p-5 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg mr-3">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Withdrawal History</h2>
          </div>

          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <div className="relative inline-flex items-center justify-center mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gray-100 p-4 rounded-lg">
                  <Wallet className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">No withdrawal requests yet</p>
              <p className="text-gray-400 text-xs mt-1">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="border-2 border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-green-300 transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        withdrawal.status === 'approved' ? 'bg-green-100' :
                        withdrawal.status === 'rejected' ? 'bg-red-100' :
                        'bg-yellow-100'
                      }`}>
                        {getStatusIcon(withdrawal.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <p className="text-lg font-bold text-gray-800 mr-2">₹{withdrawal.amount}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(withdrawal.status)}`}>
                            {withdrawal.status}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600 mb-1">
                          <CreditCard className="w-3 h-3 mr-1.5" />
                          {withdrawal.upi}
                        </div>
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimestamp(withdrawal.createdAt)}
                        </div>
                      </div>
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

