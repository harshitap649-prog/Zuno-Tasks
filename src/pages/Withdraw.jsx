import { useState, useEffect } from 'react';
import { getUserData, createWithdrawalRequest, getUserWithdrawals } from '../firebase/firestore';
import { DollarSign, Wallet, CheckCircle, XCircle, Clock } from 'lucide-react';

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
    const requiredPoints = withdrawAmount * 100;

    if (points < requiredPoints) {
      setError(`Insufficient balance. You have ${points} points (₹${(points / 100).toFixed(2)}). Need ${requiredPoints} points for ₹${withdrawAmount}.`);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const points = userData.points || 0;
  const balance = (points / 100).toFixed(2);
  const canWithdraw = points >= 10000;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        <DollarSign className="w-8 h-8 mr-2 text-purple-600" />
        Withdraw Money
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Withdrawal Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Wallet className="w-6 h-6 mr-2 text-purple-600" />
              Request Withdrawal
            </h2>

            {!canWithdraw && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ You need at least 10,000 points (₹100) to withdraw. You currently have {points.toLocaleString()} points (₹{balance}).
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Minimum ₹100"
                  required
                  disabled={!canWithdraw || submitting}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Points required: {amount ? (parseInt(amount) * 100).toLocaleString() : '0'} (₹1 = 100 points)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID or Paytm Number
                </label>
                <input
                  type="text"
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="yourname@paytm or yourname@upi"
                  required
                  disabled={!canWithdraw || submitting}
                />
              </div>

              <button
                type="submit"
                disabled={!canWithdraw || submitting}
                className={`w-full btn-primary ${
                  !canWithdraw || submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Processing...' : 'Submit Withdrawal Request'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Withdrawal Info</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Minimum withdrawal: ₹100 (10,000 points)</li>
                <li>• Processing time: 24-48 hours</li>
                <li>• Supported: UPI and Paytm</li>
                <li>• Points will be deducted immediately upon request</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div>
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white sticky top-20">
            <h3 className="text-lg font-semibold mb-4">Your Balance</h3>
            <div className="text-4xl font-bold mb-2">₹{balance}</div>
            <p className="text-purple-100 text-sm mb-6">{points.toLocaleString()} points</p>
            <div className="pt-4 border-t border-purple-400">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-purple-100">Total Earned:</span>
                <span className="font-semibold">₹{((userData.totalEarned || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-100">Total Withdrawn:</span>
                <span className="font-semibold">₹{((userData.totalWithdrawn || 0) / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="card mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Withdrawal History</h2>

        {withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No withdrawal requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <p className="font-semibold text-gray-800">₹{withdrawal.amount}</p>
                      <p className="text-sm text-gray-500">{withdrawal.upi}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(withdrawal.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(withdrawal.status)}`}>
                    {withdrawal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

