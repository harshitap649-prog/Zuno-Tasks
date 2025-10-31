import { useState, useEffect } from 'react';
import { 
  getAllUsers, 
  getAllWithdrawals, 
  getActiveOffers, 
  addOffer, 
  updateOffer,
  updateWithdrawalStatus,
  banUser,
  adjustUserPoints,
  getAllSupportMessages,
  updateSupportMessageStatus
} from '../firebase/firestore';
import { Users, DollarSign, Gift, Settings, Ban, CheckCircle, XCircle, Plus, HelpCircle, MessageSquare } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [offers, setOffers] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [usersResult, withdrawalsResult, offersResult, supportResult] = await Promise.all([
      getAllUsers(),
      getAllWithdrawals(),
      getActiveOffers(),
      getAllSupportMessages(),
    ]);

    if (usersResult.success) setUsers(usersResult.users);
    if (withdrawalsResult.success) setWithdrawals(withdrawalsResult.withdrawals);
    if (offersResult.success) setOffers(offersResult.offers);
    if (supportResult.success) setSupportMessages(supportResult.messages);
    setLoading(false);
  };

  const handleApproveWithdrawal = async (requestId, userId, amount, points) => {
    const result = await updateWithdrawalStatus(requestId, 'approved', userId, points);
    if (result.success) {
      await loadData();
      alert('Withdrawal approved!');
    }
  };

  const handleRejectWithdrawal = async (requestId, userId, points) => {
    if (!confirm('Are you sure you want to reject this withdrawal? Points will be refunded.')) {
      return;
    }
    const result = await updateWithdrawalStatus(requestId, 'rejected', userId, points);
    if (result.success) {
      await loadData();
      alert('Withdrawal rejected and points refunded.');
    }
  };

  const handleBanUser = async (uid, currentStatus) => {
    const newStatus = !currentStatus;
    if (newStatus && !confirm('Are you sure you want to ban this user?')) {
      return;
    }
    const result = await banUser(uid, newStatus);
    if (result.success) {
      await loadData();
      alert(`User ${newStatus ? 'banned' : 'unbanned'} successfully.`);
    }
  };

  const handleAdjustPoints = async (uid, currentPoints) => {
    const newPoints = prompt(`Adjust points for user (current: ${currentPoints}):`, currentPoints);
    if (newPoints !== null) {
      const points = parseInt(newPoints);
      if (!isNaN(points) && points >= 0) {
        const result = await adjustUserPoints(uid, points);
        if (result.success) {
          await loadData();
          alert('Points adjusted successfully.');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const pendingSupportMessages = supportMessages.filter(m => !m.read || m.status === 'pending');
  const totalUsers = users.length;
  const totalEarnings = users.reduce((sum, u) => sum + (u.totalEarned || 0), 0);
  const totalWithdrawn = users.reduce((sum, u) => sum + (u.totalWithdrawn || 0), 0);
  const estimatedProfit = totalEarnings * 0.7; // Rough estimate

  const handleMarkAsRead = async (messageId) => {
    const result = await updateSupportMessageStatus(messageId, 'read', true);
    if (result.success) {
      await loadData();
    }
  };

  const handleUpdateStatus = async (messageId, status) => {
    const result = await updateSupportMessageStatus(messageId, status, true);
    if (result.success) {
      await loadData();
      alert(`Message marked as ${status}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        <Settings className="w-8 h-8 mr-2 text-purple-600" />
        Admin Panel
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm font-medium">Total Users</p>
          <p className="text-3xl font-bold mt-2">{totalUsers}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm font-medium">Total Points Given</p>
          <p className="text-3xl font-bold mt-2">{(totalEarnings / 1000).toFixed(0)}K</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-purple-100 text-sm font-medium">Total Withdrawn</p>
          <p className="text-3xl font-bold mt-2">₹{(totalWithdrawn / 100).toFixed(0)}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
          <p className="text-yellow-100 text-sm font-medium">Est. Profit</p>
          <p className="text-3xl font-bold mt-2">₹{(estimatedProfit / 100).toFixed(0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'withdrawals', label: `Withdrawals (${pendingWithdrawals.length})`, icon: DollarSign },
            { id: 'support', label: `Support (${pendingSupportMessages.length})`, icon: HelpCircle },
            { id: 'offers', label: 'Offers', icon: Gift },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`${
                activeTab === id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <UsersTab
          users={users}
          onBan={handleBanUser}
          onAdjustPoints={handleAdjustPoints}
        />
      )}

      {activeTab === 'withdrawals' && (
        <WithdrawalsTab
          withdrawals={withdrawals}
          onApprove={handleApproveWithdrawal}
          onReject={handleRejectWithdrawal}
        />
      )}

      {activeTab === 'support' && (
        <SupportMessagesTab
          messages={supportMessages}
          onMarkAsRead={handleMarkAsRead}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {activeTab === 'offers' && (
        <OffersTab
          offers={offers}
          onReload={loadData}
        />
      )}
    </div>
  );
}

function UsersTab({ users, onBan, onAdjustPoints }) {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.points?.toLocaleString() || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{((user.totalEarned || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.banned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onBan(user.id, user.banned)}
                    className={`${user.banned ? 'text-green-600' : 'text-red-600'} hover:text-opacity-80`}
                  >
                    <Ban className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onAdjustPoints(user.id, user.points || 0)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Adjust Points
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WithdrawalsTab({ withdrawals, onApprove, onReject }) {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Withdrawal Requests</h2>
      {withdrawals.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No withdrawal requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className={`border rounded-lg p-4 ${
                withdrawal.status === 'pending'
                  ? 'border-yellow-300 bg-yellow-50'
                  : withdrawal.status === 'approved'
                  ? 'border-green-300 bg-green-50'
                  : 'border-red-300 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">₹{withdrawal.amount}</p>
                  <p className="text-sm text-gray-600">UPI: {withdrawal.upi}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(withdrawal.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    User ID: {withdrawal.userId}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    withdrawal.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : withdrawal.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {withdrawal.status}
                  </span>
                  {withdrawal.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onApprove(withdrawal.id, withdrawal.userId, withdrawal.amount, withdrawal.points)}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        <CheckCircle className="w-5 h-5 inline mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(withdrawal.id, withdrawal.userId, withdrawal.points)}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 text-sm"
                      >
                        <XCircle className="w-5 h-5 inline mr-1" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SupportMessagesTab({ messages, onMarkAsRead, onUpdateStatus }) {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status, read) => {
    if (!read) return 'bg-blue-100 text-blue-800';
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Support Messages</h2>
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No support messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`border rounded-lg p-5 ${
                !message.read 
                  ? 'border-blue-300 bg-blue-50' 
                  : message.status === 'pending'
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{message.subject}</h3>
                    {!message.read && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>From:</strong> {message.userName} ({message.userEmail})</p>
                    <p><strong>User ID:</strong> {message.userId}</p>
                    <p><strong>Date:</strong> {formatTimestamp(message.createdAt)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(message.status, message.read)}`}>
                    {message.read ? message.status : 'Unread'}
                  </span>
                  <div className="flex gap-2">
                    {!message.read && (
                      <button
                        onClick={() => onMarkAsRead(message.id)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Mark Read
                      </button>
                    )}
                    <select
                      value={message.status}
                      onChange={(e) => onUpdateStatus(message.id, e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OffersTab({ offers, onReload }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rewardPoints: '',
    link: '',
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await addOffer({
      ...formData,
      rewardPoints: parseInt(formData.rewardPoints),
    });

    setSubmitting(false);

    if (result.success) {
      alert('Offer added successfully!');
      setShowAddForm(false);
      setFormData({ title: '', description: '', rewardPoints: '', link: '', active: true });
      onReload();
    } else {
      alert('Failed to add offer: ' + result.error);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Offers & Tasks</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Offer
        </button>
        <button
          onClick={async () => {
            const samples = [
              {
                title: 'Install Telegram',
                description: 'Download and install Telegram app, open once',
                rewardPoints: 120,
                link: 'https://telegram.org/',
              },
              {
                title: 'Visit Flipkart Deal',
                description: 'Open the page and browse for 30 seconds',
                rewardPoints: 60,
                link: 'https://www.flipkart.com/',
              },
              {
                title: 'Watch YouTube Trailer',
                description: 'Open link and watch at least 30 seconds',
                rewardPoints: 50,
                link: 'https://www.youtube.com/',
              },
            ];
            for (const s of samples) {
              await addOffer(s);
            }
            alert('Sample offers added.');
            onReload();
          }}
          className="ml-3 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200"
        >
          Load Sample Offers
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows="3"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reward Points</label>
              <input
                type="number"
                value={formData.rewardPoints}
                onChange={(e) => setFormData({ ...formData, rewardPoints: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Link</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Adding...' : 'Add Offer'}
          </button>
        </form>
      )}

      {offers.length === 0 ? (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No offers available. Add one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">{offer.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-purple-600 font-bold">{offer.rewardPoints} points</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  offer.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {offer.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
