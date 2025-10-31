import { useState, useEffect } from 'react';
import { getUserData, getUserTransactions } from '../firebase/firestore';
import { Coins, TrendingUp, Download, Clock } from 'lucide-react';

export default function Wallet({ user }) {
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const userResult = await getUserData(user.uid);
    const transactionsResult = await getUserTransactions(user.uid);

    if (userResult.success) {
      setUserData(userResult.data);
    }
    if (transactionsResult.success) {
      setTransactions(transactionsResult.transactions);
    }
    setLoading(false);
  };

  if (loading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const points = userData.points || 0;
  const totalEarned = userData.totalEarned || 0;
  const totalWithdrawn = userData.totalWithdrawn || 0;
  const currentBalance = (points / 100).toFixed(2);
  const totalEarnedRupees = (totalEarned / 100).toFixed(2);
  const totalWithdrawnRupees = (totalWithdrawn / 100).toFixed(2);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const formatPoints = (points) => {
    return `₹${(points / 100).toFixed(2)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        <Coins className="w-8 h-8 mr-2 text-purple-600" />
        My Wallet
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Current Balance</p>
              <p className="text-4xl font-bold mt-2">₹{currentBalance}</p>
              <p className="text-green-100 text-sm mt-1">{points.toLocaleString()} points</p>
            </div>
            <Coins className="w-16 h-16 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Earned</p>
              <p className="text-4xl font-bold mt-2">₹{totalEarnedRupees}</p>
              <p className="text-blue-100 text-sm mt-1">{totalEarned.toLocaleString()} points</p>
            </div>
            <TrendingUp className="w-16 h-16 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Withdrawn</p>
              <p className="text-4xl font-bold mt-2">₹{totalWithdrawnRupees}</p>
              <p className="text-purple-100 text-sm mt-1">{totalWithdrawn.toLocaleString()} points</p>
            </div>
            <Download className="w-16 h-16 opacity-50" />
          </div>
        </div>
      </div>

      {/* Conversion Info */}
      <div className="card mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">💰 Conversion Rate</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">1000 points</span> = <span className="font-bold text-green-600">₹10</span>
          </div>
          <div>
            <span className="font-medium">Minimum Withdrawal:</span> <span className="font-bold text-purple-600">₹100 (10,000 points)</span>
          </div>
          <div>
            <span className="font-medium">Current Balance:</span> <span className="font-bold text-blue-600">{points >= 10000 ? '✅ Eligible' : '❌ Need ' + (10000 - points) + ' more points'}</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-purple-600" />
          Transaction History
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No transactions yet. Start completing tasks to earn points!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'task'
                          ? 'bg-blue-100 text-blue-800'
                          : transaction.type === 'ad'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.type === 'task' ? '🎯 Task' : transaction.type === 'ad' ? '📺 Ad' : transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      +{transaction.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPoints(transaction.points)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(transaction.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

