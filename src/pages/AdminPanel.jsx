import { useState, useEffect, useRef } from 'react';
import { 
  getAllUsers, 
  getAllWithdrawals, 
  getActiveOffers, 
  addOffer, 
  updateOffer,
  updateWithdrawalStatus,
  banUser,
  adjustUserPoints,
  disableUser,
  deleteUser,
  getAllSupportMessages,
  updateSupportMessageStatus,
  getAdminSettings,
  updateAdminSettings,
  getAllClientCaptchas,
  getQuizCompletionStats
} from '../firebase/firestore';
import { Users, DollarSign, Gift, Settings, Ban, CheckCircle, XCircle, Plus, HelpCircle, MessageSquare, ShieldCheck, Image, Loader2, PlayCircle, FileText, TrendingUp, Activity, Sparkles, Trash2, Power, Send, Shield, AlertCircle, User } from 'lucide-react';
import ClientCaptchasTab from '../components/ClientCaptchasTab';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [offers, setOffers] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);
  const [clientCaptchas, setClientCaptchas] = useState([]);
  const [quizStats, setQuizStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Debug: Log activeTab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    const [usersResult, withdrawalsResult, offersResult, supportResult, captchasResult, quizStatsResult] = await Promise.all([
      getAllUsers(),
      getAllWithdrawals(),
      getActiveOffers(),
      getAllSupportMessages(),
      getAllClientCaptchas(100),
      getQuizCompletionStats(),
    ]);

    if (usersResult.success) setUsers(usersResult.users);
    if (withdrawalsResult.success) setWithdrawals(withdrawalsResult.withdrawals);
    if (offersResult.success) setOffers(offersResult.offers);
    if (supportResult.success) setSupportMessages(supportResult.messages);
    if (captchasResult.success) setClientCaptchas(captchasResult.captchas);
    if (quizStatsResult.success) setQuizStats(quizStatsResult.stats);
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

  const handleDisableUser = async (uid, currentStatus) => {
    const newStatus = !currentStatus;
    if (newStatus && !confirm('Are you sure you want to disable this user account? Disabled users cannot access the platform.')) {
      return;
    }
    const result = await disableUser(uid, newStatus);
    if (result.success) {
      await loadData();
      alert(`User account ${newStatus ? 'disabled' : 'enabled'} successfully.`);
    } else {
      alert('Failed to update user status: ' + result.error);
    }
  };

  const handleDeleteUser = async (uid, userName) => {
    if (!confirm(`⚠️ WARNING: Are you sure you want to permanently delete user "${userName}"?\n\nThis will:\n- Delete the user account\n- Delete all their transactions\n- Delete all their withdrawal requests\n- Delete all their support messages\n\nThis action CANNOT be undone!`)) {
      return;
    }
    
    if (!confirm('This is your last chance. Are you absolutely sure you want to delete this user permanently?')) {
      return;
    }

    const result = await deleteUser(uid);
    if (result.success) {
      await loadData();
      alert('User deleted successfully.');
    } else {
      alert('Failed to delete user: ' + result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
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

  const handleMarkAllAsRead = async (userId) => {
    try {
      // Find all unread messages from this user
      const userMessages = supportMessages.filter(msg => 
        msg.userId === userId && !msg.read
      );
      
      // Mark all unread messages as read
      const markPromises = userMessages.map(msg => 
        updateSupportMessageStatus(msg.id, 'read', true)
      );
      
      await Promise.all(markPromises);
      await loadData();
    } catch (err) {
      console.error('Error marking all messages as read:', err);
    }
  };

  const handleUpdateStatus = async (messageId, status) => {
    const result = await updateSupportMessageStatus(messageId, status, true);
    if (result.success) {
      await loadData();
      alert(`Message marked as ${status}`);
    }
  };

  const handleReply = async (messageId, replyText) => {
    const { addAdminReply } = await import('../firebase/firestore');
    const result = await addAdminReply(messageId, replyText, 'Support Team');
    if (result.success) {
      await loadData();
      alert('Reply sent successfully!');
    } else {
      alert(`Failed to send reply: ${result.error}`);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const { adminDeleteSupportMessage } = await import('../firebase/firestore');
      const result = await adminDeleteSupportMessage(messageId);
      if (result.success) {
        await loadData();
        alert('Message deleted successfully!');
      } else {
        alert(`Failed to delete message: ${result.error}`);
      }
    } catch (err) {
      alert('An error occurred while deleting the message.');
      console.error('Delete error:', err);
    }
  };

  const handleDeleteReply = async (messageId, replyIndex) => {
    try {
      const { deleteAdminReply } = await import('../firebase/firestore');
      const result = await deleteAdminReply(messageId, replyIndex);
      if (result.success) {
        await loadData();
        alert('Reply deleted successfully!');
      } else {
        alert(`Failed to delete reply: ${result.error}`);
      }
    } catch (err) {
      alert('An error occurred while deleting the reply.');
      console.error('Delete reply error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Hero Section */}
        <div className="text-center mb-4">
          <div className="relative inline-flex items-center justify-center mb-2">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Settings className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Manage users, withdrawals, offers, and support messages from one central dashboard.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-500 rounded-xl shadow-lg p-3 text-white transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Users className="w-4 h-4" />
              </div>
              <div className="bg-white/10 rounded-full px-2 py-0.5">
                <span className="text-xs font-semibold">Users</span>
              </div>
            </div>
            <p className="text-blue-100 text-xs font-medium mb-1">Total Users</p>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl shadow-lg p-3 text-white transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-white/10 rounded-full px-2 py-0.5">
                <span className="text-xs font-semibold">Points</span>
              </div>
            </div>
            <p className="text-green-100 text-xs font-medium mb-1">Total Points Given</p>
            <p className="text-2xl font-bold">{(totalEarnings / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-lg p-3 text-white transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="bg-white/10 rounded-full px-2 py-0.5">
                <span className="text-xs font-semibold">Withdrawn</span>
              </div>
            </div>
            <p className="text-purple-100 text-xs font-medium mb-1">Total Withdrawn</p>
            <p className="text-2xl font-bold">₹{(totalWithdrawn / 100).toFixed(0)}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl shadow-lg p-3 text-white transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="bg-white/10 rounded-full px-2 py-0.5">
                <span className="text-xs font-semibold">Profit</span>
              </div>
            </div>
            <p className="text-amber-100 text-xs font-medium mb-1">Est. Profit</p>
            <p className="text-2xl font-bold">₹{(estimatedProfit / 100).toFixed(0)}</p>
          </div>
          {quizStats && (
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-3 text-white transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="bg-white/10 rounded-full px-2 py-0.5">
                  <span className="text-xs font-semibold">Quizzes</span>
                </div>
              </div>
              <p className="text-indigo-100 text-xs font-medium mb-1">Quiz Completions</p>
              <p className="text-2xl font-bold">{quizStats.totalCompletions}</p>
              <p className="text-xs text-indigo-200 mt-1">Est. Revenue: ₹{quizStats.estimatedRevenue.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 mb-6">
          <nav className="flex space-x-2 overflow-x-auto">
            {[
              { id: 'users', label: 'Users', icon: Users },
              { id: 'withdrawals', label: `Withdrawals`, count: pendingWithdrawals.length, icon: DollarSign },
              { id: 'support', label: `Support`, count: pendingSupportMessages.length, icon: HelpCircle },
              { id: 'offers', label: 'Offers', icon: Gift },
              { id: 'captchas', label: `Captchas`, count: clientCaptchas.filter(c => c.status === 'pending').length, icon: ShieldCheck },
            ].map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => {
                  console.log('Tab clicked:', id);
                  setActiveTab(id);
                }}
                className={`${
                  activeTab === id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } whitespace-nowrap py-3 px-6 rounded-xl font-semibold text-sm flex items-center transition-all duration-200 transform hover:scale-105`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
                {count !== undefined && count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === id ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {count}
                  </span>
                )}
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
          onDisable={handleDisableUser}
          onDelete={handleDeleteUser}
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
          messages={supportMessages || []}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onUpdateStatus={handleUpdateStatus}
          onReply={handleReply}
          onDelete={handleDeleteMessage}
          onDeleteReply={handleDeleteReply}
        />
      )}

      {activeTab === 'offers' && (
        <OffersTab
          offers={offers}
          onReload={loadData}
        />
      )}

      {activeTab === 'captchas' && (
        <ClientCaptchasTab
          captchas={clientCaptchas}
          onReload={loadData}
        />
      )}
      </div>
    </div>
  );
}

function UsersTab({ users, onBan, onAdjustPoints, onDisable, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl mr-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">All Users</h2>
        </div>
        <div className="bg-blue-100 rounded-lg px-4 py-2">
          <span className="text-sm font-semibold text-blue-700">{users.length} users</span>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Points</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Earned</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-purple-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {user.points?.toLocaleString() || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ₹{((user.totalEarned || 0) / 10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                    user.disabled 
                      ? 'bg-gray-100 text-gray-800' 
                      : user.banned 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.disabled ? 'Disabled' : user.banned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onBan(user.id, user.banned)}
                      className={`${user.banned ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'} transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100`}
                      title={user.banned ? 'Unban User' : 'Ban User'}
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDisable(user.id, user.disabled)}
                      className={`${user.disabled ? 'text-green-600 hover:text-green-700' : 'text-yellow-600 hover:text-yellow-700'} transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100`}
                      title={user.disabled ? 'Enable User' : 'Disable User'}
                    >
                      <Power className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onAdjustPoints(user.id, user.points || 0)}
                      className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                    >
                      Adjust Points
                    </button>
                    <button
                      onClick={() => onDelete(user.id, user.name || user.email)}
                      className="text-red-600 hover:text-red-700 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                      title="Delete User Permanently"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl mr-4">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Withdrawal Requests</h2>
        </div>
        <div className="bg-green-100 rounded-lg px-4 py-2">
          <span className="text-sm font-semibold text-green-700">{withdrawals.length} requests</span>
        </div>
      </div>
      {withdrawals.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-gray-100 p-6 rounded-2xl">
              <DollarSign className="w-16 h-16 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">No withdrawal requests</p>
          <p className="text-gray-400 text-sm">All withdrawal requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className={`border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${
                withdrawal.status === 'pending'
                  ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50'
                  : withdrawal.status === 'approved'
                  ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
                  : 'border-red-300 bg-gradient-to-r from-red-50 to-rose-50'
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
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(withdrawal.id, withdrawal.userId, withdrawal.points)}
                        className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
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

function SupportMessagesTab({ messages, onMarkAsRead, onMarkAllAsRead, onUpdateStatus, onReply, onDelete, onDeleteReply }) {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [deletingReply, setDeletingReply] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Safety check - ensure we have valid handlers first
  if (!onMarkAsRead || !onUpdateStatus || !onReply || !onDelete) {
    console.error('SupportMessagesTab: Missing required handlers');
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8" style={{ minHeight: '400px' }}>
        <div className="text-center py-16">
          <div className="bg-red-100 rounded-full p-6 mb-4 mx-auto w-24 h-24 flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Configuration Error</h3>
          <p className="text-sm text-gray-600">Support tab configuration issue. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  // onDeleteReply is optional, but log warning if missing
  if (!onDeleteReply) {
    console.warn('SupportMessagesTab: onDeleteReply handler not provided. Reply deletion will not work.');
  }

  // Group messages by user
  const usersMap = new Map();
  const safeMessages = Array.isArray(messages) ? messages : [];
  
  // Debug log
  console.log('SupportMessagesTab rendered with messages:', safeMessages.length);
  
  // Process messages safely
  safeMessages.forEach((msg) => {
    if (!msg || !msg.userId) return; // Skip invalid messages
    
    try {
      if (!usersMap.has(msg.userId)) {
        usersMap.set(msg.userId, {
          userId: msg.userId,
          userName: msg.userName || 'Unknown User',
          userEmail: msg.userEmail || 'No Email',
          messages: [],
          unreadCount: 0,
          lastMessageTime: msg.createdAt || new Date(),
        });
      }
      const userData = usersMap.get(msg.userId);
      if (userData) {
        userData.messages.push(msg);
        if (!msg.read) userData.unreadCount++;
        try {
          const msgTime = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt || Date.now());
          const lastTime = userData.lastMessageTime?.toDate ? userData.lastMessageTime.toDate() : new Date(userData.lastMessageTime || Date.now());
          if (msgTime > lastTime) {
            userData.lastMessageTime = msg.createdAt;
          }
        } catch (err) {
          console.warn('Error processing message timestamp:', err);
        }
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  const usersList = Array.from(usersMap.values()).sort((a, b) => {
    const timeA = a.lastMessageTime?.toDate ? a.lastMessageTime.toDate() : new Date(a.lastMessageTime);
    const timeB = b.lastMessageTime?.toDate ? b.lastMessageTime.toDate() : new Date(b.lastMessageTime);
    return timeB - timeA;
  });

  const filteredUsersList = usersList.filter(user => 
    user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-select first user if none selected
  useEffect(() => {
    if (!selectedUserId && filteredUsersList.length > 0) {
      setSelectedUserId(filteredUsersList[0].userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeMessages.length]);

  // Get selected user's messages
  const selectedUser = usersMap.get(selectedUserId);
  const selectedUserMessages = selectedUser ? selectedUser.messages : [];

  // Build timeline for selected user
  const buildTimeline = (userMessages) => {
    const timeline = [];
    userMessages.forEach((msg) => {
      timeline.push({
        id: msg.id,
        type: 'user',
        text: msg.message,
        subject: msg.subject,
        timestamp: msg.createdAt,
        status: msg.status,
        read: msg.read,
        messageId: msg.id,
      });
      
      if (msg.replies && msg.replies.length > 0) {
        msg.replies.forEach((reply, index) => {
          timeline.push({
            id: `${msg.id}-reply-${index}`,
            type: 'admin',
            text: reply.text,
            author: reply.author || 'Support Team',
            timestamp: reply.createdAt,
            messageId: msg.id,
            replyIndex: index, // Store the index for deletion
          });
        });
      }
    });
    
    timeline.sort((a, b) => {
      const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return dateA - dateB;
    });
    
    return timeline;
  };

  const chatTimeline = selectedUser ? buildTimeline(selectedUserMessages) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatTimeline.length, selectedUserId]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : (timestamp instanceof Date ? timestamp : new Date(timestamp));
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
    return date.toLocaleString();
    } catch (err) {
      return 'N/A';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : (timestamp instanceof Date ? timestamp : new Date(timestamp));
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return '';
    }
  };

  const getStatusColor = (status, read) => {
    if (!read) return 'bg-blue-100 text-blue-800';
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'read': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReplySubmit = async (messageId) => {
    const replyText = replyTexts[messageId] || '';
    if (!replyText.trim()) {
      alert('Please enter a reply message.');
      return;
    }

    setReplyingTo(messageId);
    try {
      await onReply(messageId, replyText);
      setReplyTexts({ ...replyTexts, [messageId]: '' });
      inputRef.current?.focus();
    } catch (err) {
      console.error('Reply error:', err);
    } finally {
      setReplyingTo(null);
    }
  };

  const handleQuickReply = async (userId) => {
    if (!selectedUserId) return;
    const latestMessage = selectedUserMessages[selectedUserMessages.length - 1];
    if (latestMessage && replyTexts[latestMessage.id]) {
      await handleReplySubmit(latestMessage.id);
    }
  };

  // Get latest message for quick reply
  const latestMessage = selectedUserMessages.length > 0 
    ? selectedUserMessages[selectedUserMessages.length - 1] 
    : null;


  // Show empty state if no messages at all
  if (safeMessages.length === 0) {
  return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8" style={{ minHeight: '400px' }}>
        <div className="flex flex-col items-center justify-center h-full text-center py-16">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full p-6 mb-4">
            <MessageSquare className="w-16 h-16 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No support messages yet</h3>
          <p className="text-sm text-gray-500 max-w-md">When users send messages through Help & Support, they will appear here.</p>
        </div>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 250px)', minHeight: '700px' }}>
      <div className="flex h-full">
        {/* Left Sidebar - User List */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-4 border-b border-indigo-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 rounded-full p-2">
                <MessageSquare className="w-5 h-5 text-white" />
      </div>
              <div>
                <h2 className="text-lg font-bold text-white">Support Chats</h2>
                <p className="text-xs text-indigo-100">{filteredUsersList.length} conversations</p>
            </div>
          </div>
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full px-3 py-2 pl-9 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <div className="absolute left-3 top-2.5">
                <MessageSquare className="w-4 h-4 text-white/70" />
              </div>
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto">
            {filteredUsersList.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No users found</p>
        </div>
      ) : (
              <div className="divide-y divide-gray-200">
                {filteredUsersList.map((user) => {
                  const lastMsg = user.messages[user.messages.length - 1];
                  const isSelected = selectedUserId === user.userId;
                  return (
                    <button
                      key={user.userId}
                      onClick={async () => {
                        setSelectedUserId(user.userId);
                        // Mark all unread messages from this user as read when chat is opened
                        if (user.unreadCount > 0 && onMarkAllAsRead) {
                          await onMarkAllAsRead(user.userId);
                        }
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-all ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-800 truncate">{user.userName}</h3>
                            {user.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                {user.unreadCount}
                      </span>
                    )}
                  </div>
                          <p className="text-xs text-gray-500 truncate">
                            {lastMsg ? lastMsg.message.substring(0, 50) + (lastMsg.message.length > 50 ? '...' : '') : 'No messages'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {lastMsg ? formatTimestamp(lastMsg.createdAt) : ''}
                          </p>
                  </div>
                </div>
                      </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Middle - Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between border-b border-blue-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedUser.userName}</h3>
                    <p className="text-xs text-blue-100">{selectedUser.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {latestMessage && (
                    <select
                      value={latestMessage.status}
                      onChange={(e) => onUpdateStatus(latestMessage.id, e.target.value)}
                      className="px-3 py-1.5 text-xs border border-white/30 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="sent" className="text-gray-800">Sent</option>
                      <option value="pending" className="text-gray-800">Pending</option>
                      <option value="read" className="text-gray-800">Read</option>
                      <option value="replied" className="text-gray-800">Replied</option>
                      <option value="resolved" className="text-gray-800">Resolved</option>
                    </select>
                  )}
                  {latestMessage && (
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this conversation?')) {
                          setDeletingMessage(latestMessage.id);
                        try {
                            await onDelete(latestMessage.id);
                          } finally {
                            setDeletingMessage(null);
                          }
                        }
                      }}
                      disabled={deletingMessage === latestMessage.id}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-all disabled:opacity-50"
                      title="Delete conversation"
                    >
                      {deletingMessage === latestMessage.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  </div>
                </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ maxHeight: 'calc(100% - 140px)' }}>
                {chatTimeline.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full p-6 mb-4">
                      <MessageSquare className="w-12 h-12 text-blue-600" />
              </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No messages yet</h3>
                    <p className="text-sm text-gray-500">Start the conversation with {selectedUser.userName}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatTimeline.map((item, index) => {
                      const showDateSeparator = index === 0 || 
                        (chatTimeline[index - 1] && 
                         new Date(item.timestamp).toDateString() !== new Date(chatTimeline[index - 1].timestamp).toDateString());
                      
                      return (
                        <div key={item.id}>
                          {showDateSeparator && (
                            <div className="flex items-center justify-center my-4">
                              <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 border border-gray-200">
                                {new Date(item.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                              </span>
              </div>
                          )}
                          
                          {item.type === 'user' ? (
                            <div className="flex items-end justify-end gap-2 mb-2 group">
                              <div className="max-w-[70%] lg:max-w-[60%]">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl rounded-tr-none px-4 py-2.5 shadow-md relative">
                                  {item.subject && (
                                    <div className="font-semibold text-sm mb-1">{item.subject}</div>
                                  )}
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.text}</p>
                                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
                                    <button
                                      onClick={async () => {
                                        if (window.confirm('Are you sure you want to delete this message? This will delete the entire conversation.')) {
                                          setDeletingMessage(item.messageId);
                                          try {
                                            await onDelete(item.messageId);
                                          } finally {
                                            setDeletingMessage(null);
                                          }
                                        }
                                      }}
                                      disabled={deletingMessage === item.messageId}
                                      className="p-1 hover:bg-white/20 rounded transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                      title="Delete message"
                                    >
                                      {deletingMessage === item.messageId ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                                      ) : (
                                        <Trash2 className="w-3 h-3 text-white" />
                                      )}
                                    </button>
                                    <span className="text-xs opacity-75">{formatTime(item.timestamp)}</span>
            </div>
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-end justify-start gap-2 mb-2 group">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-4 h-4 text-white" />
                              </div>
                              <div className="max-w-[70%] lg:max-w-[60%]">
                                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2.5 shadow-md border border-gray-200 relative">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-blue-600">{item.author}</span>
                                      <span className="text-xs text-gray-400">{formatTime(item.timestamp)}</span>
                                    </div>
                                    {onDeleteReply && item.replyIndex !== undefined && (
                                      <button
                                        onClick={async () => {
                                          if (window.confirm('Are you sure you want to delete this reply?')) {
                                            setDeletingReply(`${item.messageId}-${item.replyIndex}`);
                                            try {
                                              await onDeleteReply(item.messageId, item.replyIndex);
                                            } finally {
                                              setDeletingReply(null);
                                            }
                                          }
                                        }}
                                        disabled={deletingReply === `${item.messageId}-${item.replyIndex}`}
                                        className="p-1 hover:bg-red-50 rounded transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                        title="Delete reply"
                                      >
                                        {deletingReply === `${item.messageId}-${item.replyIndex}` ? (
                                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-red-600"></div>
                                        ) : (
                                          <Trash2 className="w-3 h-3 text-red-600" />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.text}</p>
                                </div>
                              </div>
        </div>
      )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Reply Input */}
              {latestMessage && (
                <div className="border-t border-gray-200 bg-white p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleReplySubmit(latestMessage.id);
                    }}
                    className="flex items-end gap-3"
                  >
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={replyTexts[latestMessage.id] || ''}
                        onChange={(e) => setReplyTexts({ ...replyTexts, [latestMessage.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleReplySubmit(latestMessage.id);
                          }
                        }}
                        placeholder="Type your reply here... (Press Enter to send, Shift+Enter for new line)"
                        rows={1}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-gray-50 focus:bg-white transition-all text-sm"
                        disabled={replyingTo === latestMessage.id}
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={replyingTo === latestMessage.id || !replyTexts[latestMessage.id]?.trim()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      {replyingTo === latestMessage.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-full p-8 mb-4 mx-auto w-32 h-32 flex items-center justify-center">
                  <MessageSquare className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a user to start chatting</h3>
                <p className="text-sm text-gray-500">Choose a user from the left sidebar to view and reply to their messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OffersTab({ offers, onReload }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showOfferToroConfig, setShowOfferToroConfig] = useState(false);
  const [showInstantNetworkConfig, setShowInstantNetworkConfig] = useState(false);
  const [showCPALeadConfig, setShowCPALeadConfig] = useState(false);
  const [showPropellerAdsConfig, setShowPropellerAdsConfig] = useState(false);
  const [showPopAdsConfig, setShowPopAdsConfig] = useState(false);
  const [showCaptchaConfig, setShowCaptchaConfig] = useState(false);
  const [showAyetStudiosConfig, setShowAyetStudiosConfig] = useState(false);
  const [showCPXResearchConfig, setShowCPXResearchConfig] = useState(false);
  const [showLootablyConfig, setShowLootablyConfig] = useState(false);
  const [showAdGemConfig, setShowAdGemConfig] = useState(false);
  const [showHideoutTvConfig, setShowHideoutTvConfig] = useState(false);
  const [offertoroApiKey, setOffertoroApiKey] = useState('');
  const [instantNetwork, setInstantNetwork] = useState('');
  const [instantNetworkApiKey, setInstantNetworkApiKey] = useState('');
  const [ayetStudiosApiKey, setAyetStudiosApiKey] = useState('');
  const [ayetStudiosOfferwallUrl, setAyetStudiosOfferwallUrl] = useState('');
  const [cpxResearchApiKey, setCpxResearchApiKey] = useState('');
  const [cpxResearchOfferwallUrl, setCpxResearchOfferwallUrl] = useState('');
  const [lootablyApiKey, setLootablyApiKey] = useState('');
  const [lootablyOfferwallUrl, setLootablyOfferwallUrl] = useState('');
  const [adgemApiKey, setAdgemApiKey] = useState('');
  const [adgemOfferwallUrl, setAdgemOfferwallUrl] = useState('');
  const [hideoutTvApiKey, setHideoutTvApiKey] = useState('');
  const [hideoutTvOfferwallUrl, setHideoutTvOfferwallUrl] = useState('');
  const [cpaleadPublisherId, setCPALeadPublisherId] = useState('');
  const [cpaleadCustomAdUrl, setCPALeadCustomAdUrl] = useState('');
  const [cpaleadLinkLockerUrl, setCPALeadLinkLockerUrl] = useState('');
  const [cpaleadFileLockerUrl, setCPALeadFileLockerUrl] = useState('');
  const [cpaleadQuizUrl, setCPALeadQuizUrl] = useState('');
  const [propellerAdsBannerZoneId, setPropellerAdsBannerZoneId] = useState('');
  const [propellerAdsInterstitialZoneId, setPropellerAdsInterstitialZoneId] = useState('');
  const [popAdsSiteId, setPopAdsSiteId] = useState('');
  const [popAdsBannerId, setPopAdsBannerId] = useState('');
  const [captchaPointsPerSolve, setCaptchaPointsPerSolve] = useState(1);
  const [syncing, setSyncing] = useState(false);
  
  // Multiple source management
  const [showMultiSourceConfig, setShowMultiSourceConfig] = useState(false);
  const [quizSources, setQuizSources] = useState([]);
  const [surveySources, setSurveySources] = useState([]);
  const [videoSources, setVideoSources] = useState([]);
  const [appSources, setAppSources] = useState([]);
  const [cpaleadIndividualOffers, setCPALeadIndividualOffers] = useState([]);
  const [newSource, setNewSource] = useState({ type: 'quiz', name: '', url: '', source: '' });
  const [newCPALeadOffer, setNewCPALeadOffer] = useState({ name: '', url: '', category: 'all' });
  const [showCPALeadIndividualOffers, setShowCPALeadIndividualOffers] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rewardPoints: '',
    link: '',
    active: true,
                category: 'surveys',
    isAffiliate: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load settings from Firestore (primary source)
    // Also check localStorage as fallback for backward compatibility
    const loadSettings = async () => {
      const settingsResult = await getAdminSettings();
      if (settingsResult.success && settingsResult.settings) {
        const settings = settingsResult.settings;
        // Load from Firestore
        setOffertoroApiKey(settings.offertoroApiKey || '');
        setInstantNetwork(settings.instantNetwork || '');
        setInstantNetworkApiKey(settings.instantNetworkApiKey || '');
        setCPALeadPublisherId(settings.cpaleadPublisherId || '');
        setCPALeadCustomAdUrl(settings.cpaleadCustomAdUrl || '');
        setCPALeadLinkLockerUrl(settings.cpaleadLinkLockerUrl || '');
        setCPALeadFileLockerUrl(settings.cpaleadFileLockerUrl || '');
        setCPALeadQuizUrl(settings.cpaleadQuizUrl || '');
        setPropellerAdsBannerZoneId(settings.propellerAdsBannerZoneId || '');
        setPropellerAdsInterstitialZoneId(settings.propellerAdsInterstitialZoneId || '');
        setPopAdsSiteId(settings.popAdsSiteId || '');
        setPopAdsBannerId(settings.popAdsBannerId || '');
        setAyetStudiosApiKey(settings.ayetStudiosApiKey || '');
        setAyetStudiosOfferwallUrl(settings.ayetStudiosOfferwallUrl || '');
        setCpxResearchApiKey(settings.cpxResearchApiKey || '');
        setCpxResearchOfferwallUrl(settings.cpxResearchOfferwallUrl || '');
        setLootablyApiKey(settings.lootablyApiKey || '');
        setLootablyOfferwallUrl(settings.lootablyOfferwallUrl || '');
        setAdgemApiKey(settings.adgemApiKey || '');
        setAdgemOfferwallUrl(settings.adgemOfferwallUrl || '');
        setHideoutTvApiKey(settings.hideoutTvApiKey || '');
        setHideoutTvOfferwallUrl(settings.hideoutTvOfferwallUrl || '');
        
        // Load additional sources for categories
        setQuizSources(settings.quizzes || []);
        setSurveySources(settings.surveys || []);
        setVideoSources(settings.videos || []);
        setAppSources(settings.apps || []);
        setCPALeadIndividualOffers(settings.cpaleadIndividualOffers || []);
        setCaptchaPointsPerSolve(settings.captchaPointsPerSolve || 1);
        
        // Also sync to localStorage for backward compatibility
        if (settings.offertoroApiKey) localStorage.setItem('offertoro_api_key', settings.offertoroApiKey);
        if (settings.instantNetwork) localStorage.setItem('instant_network', settings.instantNetwork);
        if (settings.instantNetworkApiKey) localStorage.setItem('instant_network_api_key', settings.instantNetworkApiKey);
        if (settings.cpaleadPublisherId) localStorage.setItem('cpalead_publisher_id', settings.cpaleadPublisherId);
        if (settings.cpaleadCustomAdUrl) localStorage.setItem('cpalead_custom_ad_url', settings.cpaleadCustomAdUrl);
        if (settings.cpaleadLinkLockerUrl) localStorage.setItem('cpalead_link_locker_url', settings.cpaleadLinkLockerUrl);
        if (settings.cpaleadFileLockerUrl) localStorage.setItem('cpalead_file_locker_url', settings.cpaleadFileLockerUrl);
        if (settings.cpaleadQuizUrl) localStorage.setItem('cpalead_quiz_url', settings.cpaleadQuizUrl);
        if (settings.propellerAdsBannerZoneId) localStorage.setItem('propeller_ads_banner_zone_id', settings.propellerAdsBannerZoneId);
        if (settings.propellerAdsInterstitialZoneId) localStorage.setItem('propeller_ads_interstitial_zone_id', settings.propellerAdsInterstitialZoneId);
        if (settings.popAdsSiteId) localStorage.setItem('popads_site_id', settings.popAdsSiteId);
        if (settings.popAdsBannerId) localStorage.setItem('popads_banner_id', settings.popAdsBannerId);
        if (settings.ayetStudiosApiKey) localStorage.setItem('ayet_studios_api_key', settings.ayetStudiosApiKey);
        if (settings.ayetStudiosOfferwallUrl) localStorage.setItem('ayet_studios_offerwall_url', settings.ayetStudiosOfferwallUrl);
        if (settings.cpxResearchApiKey) localStorage.setItem('cpx_research_api_key', settings.cpxResearchApiKey);
        if (settings.cpxResearchOfferwallUrl) localStorage.setItem('cpx_research_offerwall_url', settings.cpxResearchOfferwallUrl);
        if (settings.lootablyApiKey) localStorage.setItem('lootably_api_key', settings.lootablyApiKey);
        if (settings.lootablyOfferwallUrl) localStorage.setItem('lootably_offerwall_url', settings.lootablyOfferwallUrl);
        if (settings.adgemApiKey) localStorage.setItem('adgem_api_key', settings.adgemApiKey);
        if (settings.adgemOfferwallUrl) localStorage.setItem('adgem_offerwall_url', settings.adgemOfferwallUrl);
        if (settings.hideoutTvApiKey) localStorage.setItem('hideout_tv_api_key', settings.hideoutTvApiKey);
        if (settings.hideoutTvOfferwallUrl) localStorage.setItem('hideout_tv_offerwall_url', settings.hideoutTvOfferwallUrl);
      } else {
        // Fallback to localStorage if Firestore doesn't have settings
        const savedKey = localStorage.getItem('offertoro_api_key') || import.meta.env.VITE_OFFERTORO_API_KEY || '';
        setOffertoroApiKey(savedKey);
        
        const savedNetwork = localStorage.getItem('instant_network') || '';
        const savedNetworkKey = localStorage.getItem('instant_network_api_key') || '';
        setInstantNetwork(savedNetwork);
        setInstantNetworkApiKey(savedNetworkKey);
        
        const savedCPALeadId = localStorage.getItem('cpalead_publisher_id') || '';
        const savedLinkLocker = localStorage.getItem('cpalead_link_locker_url') || '';
        const savedFileLocker = localStorage.getItem('cpalead_file_locker_url') || '';
        const savedQuiz = localStorage.getItem('cpalead_quiz_url') || '';
        const savedAyetApiKey = localStorage.getItem('ayet_studios_api_key') || '';
        const savedAyetUrl = localStorage.getItem('ayet_studios_offerwall_url') || '';
        const savedCpxApiKey = localStorage.getItem('cpx_research_api_key') || '';
        const savedCpxUrl = localStorage.getItem('cpx_research_offerwall_url') || '';
        const savedLootablyApiKey = localStorage.getItem('lootably_api_key') || '';
        const savedLootablyUrl = localStorage.getItem('lootably_offerwall_url') || '';
        const savedAdgemApiKey = localStorage.getItem('adgem_api_key') || '';
        const savedAdgemUrl = localStorage.getItem('adgem_offerwall_url') || '';
        const savedHideoutTvApiKey = localStorage.getItem('hideout_tv_api_key') || '';
        const savedHideoutTvUrl = localStorage.getItem('hideout_tv_offerwall_url') || '';
        const savedCustomAd = localStorage.getItem('cpalead_custom_ad_url') || '';
        const savedPropellerBanner = localStorage.getItem('propeller_ads_banner_zone_id') || '';
        const savedPropellerInterstitial = localStorage.getItem('propeller_ads_interstitial_zone_id') || '';
        const savedPopAdsSite = localStorage.getItem('popads_site_id') || '';
        const savedPopAdsBanner = localStorage.getItem('popads_banner_id') || '';
        setCPALeadPublisherId(savedCPALeadId);
        setCPALeadCustomAdUrl(savedCustomAd);
        setCPALeadLinkLockerUrl(savedLinkLocker);
        setCPALeadFileLockerUrl(savedFileLocker);
        setCPALeadQuizUrl(savedQuiz);
        setPropellerAdsBannerZoneId(savedPropellerBanner);
        setPropellerAdsInterstitialZoneId(savedPropellerInterstitial);
        setPopAdsSiteId(savedPopAdsSite);
        setPopAdsBannerId(savedPopAdsBanner);
        setAyetStudiosApiKey(savedAyetApiKey);
        setAyetStudiosOfferwallUrl(savedAyetUrl);
        setCpxResearchApiKey(savedCpxApiKey);
        setCpxResearchOfferwallUrl(savedCpxUrl);
        setLootablyApiKey(savedLootablyApiKey);
        setLootablyOfferwallUrl(savedLootablyUrl);
        setAdgemApiKey(savedAdgemApiKey);
        setAdgemOfferwallUrl(savedAdgemUrl);
        setHideoutTvApiKey(savedHideoutTvApiKey);
        setHideoutTvOfferwallUrl(savedHideoutTvUrl);
      }
    };
    
    loadSettings();
  }, []);

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
      setFormData({ title: '', description: '', rewardPoints: '', link: '', active: true, category: 'general', isAffiliate: false });
      onReload();
    } else {
      alert('Failed to add offer: ' + result.error);
    }
  };

  const handleSyncOfferToro = async () => {
    if (!offertoroApiKey) {
      alert('Please enter your OfferToro API key first');
      setShowOfferToroConfig(true);
      return;
    }

    setSyncing(true);
    try {
      // Save API key to Firestore (primary) and localStorage (backup)
      const result = await updateAdminSettings({ offertoroApiKey });
      localStorage.setItem('offertoro_api_key', offertoroApiKey);

      if (result.success) {
        alert('✅ OfferToro offerwall is ready! All users can now see offers when they visit the Tasks page.\n\nNote: For full integration, configure postback URL in your OfferToro dashboard.');
      } else {
        // Fallback: still save to localStorage if Firestore fails
        alert('⚠️ Saved to local storage. Some users may not see offers. Error: ' + result.error);
      }
      
      // Optionally, you can try to fetch via API if available
      // const { fetchOffersFromAPI, formatOfferToroOffer } = await import('../utils/offertoro');
      // const offers = await fetchOffersFromAPI(offertoroApiKey, 'test');
      // if (offers.length > 0) {
      //   for (const offer of offers) {
      //     const formatted = formatOfferToroOffer(offer);
      //     await addOffer({ ...formatted, source: 'offertoro' });
      //   }
      //   alert(`Synced ${offers.length} offers from OfferToro!`);
      //   onReload();
      // }
    } catch (error) {
      console.error('Error syncing OfferToro:', error);
      alert('Error syncing OfferToro: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl mr-4">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Offers & Tasks</h2>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowInstantNetworkConfig(!showInstantNetworkConfig)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Gift className="w-5 h-5 mr-2" />
            Instant Networks
          </button>
          <button
            onClick={() => setShowOfferToroConfig(!showOfferToroConfig)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Gift className="w-5 h-5 mr-2" />
            OfferToro
          </button>
          <button
            onClick={() => setShowAyetStudiosConfig(!showAyetStudiosConfig)}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Ayet Studios (Videos)
          </button>
          <button
            onClick={() => setShowCPXResearchConfig(!showCPXResearchConfig)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <FileText className="w-5 h-5 mr-2" />
            CPX Research (Surveys)
          </button>
          <button
            onClick={() => setShowLootablyConfig(!showLootablyConfig)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 flex items-center"
          >
            <Gift className="w-5 h-5 mr-2" />
            Lootably (All Tasks)
          </button>
          <button
            onClick={() => setShowAdGemConfig(!showAdGemConfig)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center"
          >
            <Gift className="w-5 h-5 mr-2" />
            AdGem (All Tasks)
          </button>
          <button
            onClick={() => setShowHideoutTvConfig(!showHideoutTvConfig)}
            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-2 px-4 rounded-lg hover:from-pink-700 hover:to-rose-700 flex items-center"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Hideout.tv (Videos)
          </button>
          <button
            onClick={() => setShowCPALeadConfig(!showCPALeadConfig)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center"
          >
            <Gift className="w-5 h-5 mr-2" />
            CPAlead VIP
          </button>
          <button
            onClick={() => setShowCPALeadIndividualOffers(!showCPALeadIndividualOffers)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center"
          >
            <Gift className="w-5 h-5 mr-2" />
            CPAlead Individual Offers
          </button>
          <button
            onClick={() => setShowPropellerAdsConfig(!showPropellerAdsConfig)}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4 rounded-lg hover:from-orange-700 hover:to-red-700 flex items-center"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            PropellerAds
          </button>
          <button
            onClick={() => setShowPopAdsConfig(!showPopAdsConfig)}
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-teal-700 flex items-center"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            PopAds (Easy Setup)
          </button>
          <button
            onClick={() => setShowMultiSourceConfig(!showMultiSourceConfig)}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Quiz/Survey Sources
          </button>
          <button
            onClick={() => setShowCaptchaConfig(!showCaptchaConfig)}
            className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 flex items-center"
          >
            <ShieldCheck className="w-5 h-5 mr-2" />
            Captcha Settings
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Offer / Affiliate Link
          </button>
          <button
            onClick={async () => {
              const profitableTasks = [
                {
                  title: 'Install Paytm - Complete KYC',
                  description: 'Download Paytm app, complete KYC verification using referral. Safe digital wallet!',
                  rewardPoints: 500,
                  link: 'https://paytm.com/r/YOUR_REFERRAL_CODE',
                },
                {
                  title: 'Install PhonePe - Set Up UPI',
                  description: 'Install PhonePe app from this link to earn points. Complete UPI setup after installation. Note: If you already have PhonePe installed, you will not earn points for this task.',
                  rewardPoints: 400,
                  link: 'https://phon.pe/ktkefvjx',
                },
                {
                  title: 'Install Raid: Shadow Legends - Reach Level 10',
                  description: 'Download Raid: Shadow Legends, complete tutorial, reach level 10. Epic RPG game!',
                  rewardPoints: 400,
                  link: 'https://play.google.com/store/apps/details?id=com.plarium.raidlegends',
                },
                {
                  title: 'Install Flipkart App - Browse Products',
                  description: 'Download Flipkart app, browse products for 3 minutes. No purchase needed!',
                  rewardPoints: 250,
                  link: 'https://play.google.com/store/apps/details?id=com.flipkart.android',
                },
                {
                  title: 'Install Disney+ Hotstar - Watch Free Content',
                  description: 'Download Disney+ Hotstar, create account, watch any video for 10 minutes.',
                  rewardPoints: 350,
                  link: 'https://play.google.com/store/apps/details?id=in.startv.hotstar',
                },
              ];
              
              const confirm = window.confirm(`This will add ${profitableTasks.length} profitable task templates.\n\n⚠️ Remember to replace "YOUR_REFERRAL_CODE" with your actual referral codes!\n\nContinue?`);
              if (!confirm) return;
              
              for (const task of profitableTasks) {
                await addOffer(task);
              }
              alert(`✅ ${profitableTasks.length} profitable tasks added!\n\n💡 Don't forget to edit the links and replace YOUR_REFERRAL_CODE with your actual affiliate codes for maximum revenue!`);
              onReload();
            }}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Gift className="w-5 h-5 mr-2" />
            Load Profitable Tasks
          </button>
        </div>
      </div>

      {/* Instant Approval Networks Configuration */}
      {showInstantNetworkConfig && (
        <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Gift className="w-6 h-6 mr-2 text-green-600" />
            Instant Approval Networks
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            These networks offer <strong>instant approval</strong> (5 minutes to 24 hours) so you can start earning immediately!
            Recommended: <a href="https://offerwall.me/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-semibold">Offerwall.me</a> (5-minute setup)
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Network
              </label>
              <select
                value={instantNetwork}
                onChange={(e) => setInstantNetwork(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select Network --</option>
                <option value="offerwallme">Offerwall.me (Instant - 5 min setup)</option>
                <option value="offerwallpro">Offerwall PRO (Instant approval)</option>
                <option value="bitlabs">Bitlabs (24-hour approval)</option>
                <option value="adgatemedia">AdGate Media (24-48 hour approval)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key / Publisher ID
              </label>
              <input
                type="text"
                value={instantNetworkApiKey}
                onChange={(e) => setInstantNetworkApiKey(e.target.value)}
                placeholder="Enter your API key from the network"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from: {instantNetwork === 'offerwallme' && 'https://offerwall.me/'}
                {instantNetwork === 'offerwallpro' && 'https://offerwallpro.com/'}
                {instantNetwork === 'bitlabs' && 'https://bitlabs.gg/'}
                {instantNetwork === 'adgatemedia' && 'https://www.adgatemedia.com/'}
                {!instantNetwork && 'Select a network first'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!instantNetwork || !instantNetworkApiKey) {
                    alert('Please select a network and enter your API key');
                    return;
                  }
                  
                  // Save configuration to Firestore (primary) and localStorage (backup)
                  const result = await updateAdminSettings({
                    instantNetwork,
                    instantNetworkApiKey,
                  });
                  
                  localStorage.setItem('instant_network', instantNetwork);
                  localStorage.setItem('instant_network_api_key', instantNetworkApiKey);
                  
                  if (result.success) {
                    alert(`✅ ${instantNetwork} configured successfully! All users can now see offers.\n\n📝 Next Steps:\n1. Go to the Tasks page\n2. You'll see the offerwall from ${instantNetwork}\n3. Offers will appear automatically\n\n💡 Tip: Check your network dashboard for available offers!`);
                  } else {
                    alert(`⚠️ Saved locally. Some users may not see offers. Error: ${result.error}`);
                  }
                  
                  setShowInstantNetworkConfig(false);
                  onReload();
                }}
                className="btn-primary flex items-center"
              >
                Enable Network
              </button>
              <button
                onClick={() => setShowInstantNetworkConfig(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            {instantNetwork && instantNetworkApiKey && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Network configured. Offers will sync automatically or can be viewed via offerwall.
              </p>
            )}
          </div>
        </div>
      )}

      {/* PopAds Configuration - EASIER THAN PROPELLERADS */}
      {showPopAdsConfig && (
        <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <PlayCircle className="w-6 h-6 mr-2 text-green-600" />
            PopAds Integration (Recommended - Easy Setup!)
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            <strong>✅ MUCH EASIER than PropellerAds!</strong> Just need Site ID and Banner ID.
            <br /><strong>💰 Revenue:</strong> Earn money from popunder/interstitial ads (CPM-based).
            <br /><strong>📝 How to get your IDs:</strong>
            <br />1. Sign up at <a href="https://www.popads.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">popads.net</a>
            <br />2. Go to "Sites" → Add your website
            <br />3. After approval, go to "Sites" → Click on your site
            <br />4. You'll see "Site ID" and "Banner ID" - copy them
            <br />5. Paste them here
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-green-600 font-bold">⭐ PopAds Site ID</span>
              </label>
              <input
                type="text"
                value={popAdsSiteId}
                onChange={(e) => setPopAdsSiteId(e.target.value.trim())}
                placeholder="Enter Site ID (e.g., 1234567)"
                className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:border-green-500"
              />
              <p className="text-xs text-green-600 mt-1 font-semibold">
                💡 Get this from: PopAds Dashboard → Sites → Your Website → Site ID
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-green-600 font-bold">⭐ PopAds Banner ID (For Watch Ad)</span>
              </label>
              <input
                type="text"
                value={popAdsBannerId}
                onChange={(e) => setPopAdsBannerId(e.target.value.trim())}
                placeholder="Enter Banner ID (e.g., 8765432)"
                className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:border-green-500"
              />
              <p className="text-xs text-green-600 mt-1 font-semibold">
                💡 Get this from: PopAds Dashboard → Sites → Your Website → Banner ID
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This will show popunder/interstitial ads in the Watch Ad feature, generating revenue from views!
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!popAdsSiteId && !popAdsBannerId) {
                    alert('Please enter at least one ID (Site ID or Banner ID)');
                    return;
                  }
                  
                  const settingsToSave = {};
                  if (popAdsSiteId) {
                    settingsToSave.popAdsSiteId = popAdsSiteId;
                  }
                  if (popAdsBannerId) {
                    settingsToSave.popAdsBannerId = popAdsBannerId;
                  }
                  
                  // Preserve existing settings
                  const currentSettings = await getAdminSettings();
                  if (currentSettings.success && currentSettings.settings) {
                    Object.keys(currentSettings.settings).forEach(key => {
                      if (!settingsToSave.hasOwnProperty(key) && key !== 'updatedAt') {
                        settingsToSave[key] = currentSettings.settings[key];
                      }
                    });
                  }
                  
                  const result = await updateAdminSettings(settingsToSave);
                  
                  // Also save to localStorage
                  if (popAdsSiteId) {
                    localStorage.setItem('popads_site_id', popAdsSiteId);
                  }
                  if (popAdsBannerId) {
                    localStorage.setItem('popads_banner_id', popAdsBannerId);
                  }
                  
                  let message = `✅ PopAds configured successfully!\n\n`;
                  if (popAdsSiteId) {
                    message += `✅ Site ID configured - PopAds ready\n\n`;
                  }
                  if (popAdsBannerId) {
                    message += `✅ Watch Ad feature will show popunder/interstitial ads\n\n`;
                  }
                  message += `💰 Revenue: You'll earn money from ad views/impressions!`;
                  
                  if (!result.success) {
                    message = `⚠️ Saved locally. Error: ${result.error}\n\n${message}`;
                  }
                  
                  alert(message);
                  setShowPopAdsConfig(false);
                  onReload();
                }}
                className="btn-primary flex items-center bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              >
                Enable PopAds
              </button>
              <button
                onClick={() => setShowPopAdsConfig(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            
            {popAdsSiteId && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  ✓ Site ID configured. PopAds ready to use.
                </p>
              </div>
            )}
            {popAdsBannerId && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  ✓ Banner ID configured. Watch Ad feature will show popunder/interstitial ads.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CPAlead Individual Offers Configuration */}
      {showCPALeadIndividualOffers && (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Gift className="w-6 h-6 mr-2 text-purple-600" />
            CPAlead Individual Offers Manager
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Add individual CPAlead offer links manually. Copy each offer link from CPAlead dashboard and paste here.
            <br /><strong>💰 Revenue:</strong> Earn money when users complete offers (CPA model).
            <br /><strong>📝 Steps:</strong>
            <br />1. Go to CPAlead Dashboard → All Offers
            <br />2. Click on any offer (Minecraft, Roblox, GTA 5, Fortnite, etc.)
            <br />3. Click "Copy Link" button
            <br />4. Paste the link here with a name and select category
            <br />5. Save - offers will appear in the selected category on Tasks page
          </p>
          
          {/* Add New Offer Form */}
          <div className="mb-6 p-4 bg-white rounded-lg border border-purple-200">
            <h4 className="font-semibold text-gray-800 mb-3">Add New CPAlead Offer</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Name</label>
                <input
                  type="text"
                  value={newCPALeadOffer.name}
                  onChange={(e) => setNewCPALeadOffer({ ...newCPALeadOffer, name: e.target.value })}
                  placeholder="e.g., Smooth Gui Minecraft"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer URL (Copy Link from CPAlead)</label>
                <input
                  type="text"
                  value={newCPALeadOffer.url}
                  onChange={(e) => setNewCPALeadOffer({ ...newCPALeadOffer, url: e.target.value })}
                  placeholder="https://cpalead.com/offer/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newCPALeadOffer.category}
                  onChange={(e) => setNewCPALeadOffer({ ...newCPALeadOffer, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Tasks</option>
                  <option value="games">Game Tasks</option>
                  <option value="quizzes">Quizzes</option>
                  <option value="surveys">Surveys</option>
                  <option value="videos">Watch Videos</option>
                  <option value="apps">Install Apps</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                if (!newCPALeadOffer.url || !newCPALeadOffer.name) {
                  alert('Please fill in Offer Name and URL');
                  return;
                }
                setCPALeadIndividualOffers([...cpaleadIndividualOffers, { ...newCPALeadOffer, id: Date.now() }]);
                setNewCPALeadOffer({ name: '', url: '', category: 'all' });
              }}
              className="mt-3 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
            >
              Add Offer
            </button>
          </div>

          {/* Display Current Offers */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-3">Current Offers ({cpaleadIndividualOffers.length})</h4>
            {cpaleadIndividualOffers.length === 0 ? (
              <p className="text-gray-500 text-sm">No offers added yet. Add your first offer above!</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cpaleadIndividualOffers.map((offer, index) => (
                  <div key={offer.id || index} className="bg-white rounded-lg border border-purple-200 p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{offer.name}</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                          {offer.category === 'all' ? 'All Tasks' : offer.category === 'games' ? 'Game Tasks' : offer.category === 'quizzes' ? 'Quizzes' : offer.category === 'surveys' ? 'Surveys' : offer.category === 'videos' ? 'Videos' : 'Apps'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">{offer.url}</p>
                    </div>
                    <button
                      onClick={() => {
                        setCPALeadIndividualOffers(cpaleadIndividualOffers.filter((_, i) => i !== index));
                      }}
                      className="ml-3 bg-red-500 text-white py-1 px-3 rounded text-xs hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={async () => {
                // Preserve existing settings when saving
                const currentSettings = await getAdminSettings();
                let settingsToSave = {};
                
                if (currentSettings.success && currentSettings.settings) {
                  // Keep all existing settings
                  settingsToSave = { ...currentSettings.settings };
                }
                
                // Update with new offers
                settingsToSave.cpaleadIndividualOffers = cpaleadIndividualOffers;
                
                console.log('💾 Saving CPAlead Individual Offers:', cpaleadIndividualOffers);
                console.log('💾 Full settings to save:', settingsToSave);
                
                const result = await updateAdminSettings(settingsToSave);
                
                if (result.success) {
                  alert(`✅ ${cpaleadIndividualOffers.length} CPAlead offers saved successfully! They will appear in the selected categories on the Tasks page.`);
                  setShowCPALeadIndividualOffers(false);
                  onReload();
                } else {
                  alert(`⚠️ Failed to save: ${result.error}`);
                }
              }}
              className="btn-primary flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Save All Offers
            </button>
            <button
              onClick={() => setShowCPALeadIndividualOffers(false)}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PropellerAds Configuration */}
      {showPropellerAdsConfig && (
        <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <PlayCircle className="w-6 h-6 mr-2 text-orange-600" />
            PropellerAds Integration
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Integrate PropellerAds for <strong>Banner Ads</strong> and <strong>Watch Ad</strong> feature.
            <br /><strong>💰 Revenue:</strong> Earn money from ad views/impressions (CPM-based).
            <br />To get your Zone IDs:
            <br />1. Go to PropellerAds Dashboard → Zone Groups
            <br />2. Create a Banner zone (for banner ads)
            <br />3. Create an Interstitial zone (for watch ad feature)
            <br />4. Copy the Zone ID from each zone
            <br />5. Paste them here
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-orange-600 font-bold">⭐ PropellerAds Banner Zone ID</span>
              </label>
              <input
                type="text"
                value={propellerAdsBannerZoneId}
                onChange={(e) => setPropellerAdsBannerZoneId(e.target.value.trim())}
                placeholder="Enter Banner Zone ID (e.g., 12345678)"
                className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500"
              />
              <p className="text-xs text-orange-600 mt-1 font-semibold">
                💡 Get this from: PropellerAds Dashboard → Zone Groups → Create Banner Zone → Copy Zone ID
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This will show banner ads at the bottom of every page
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-orange-600 font-bold">⭐ PropellerAds Interstitial Zone ID (For Watch Ad)</span>
              </label>
              <input
                type="text"
                value={propellerAdsInterstitialZoneId}
                onChange={(e) => setPropellerAdsInterstitialZoneId(e.target.value.trim())}
                placeholder="Enter Interstitial Zone ID (e.g., 87654321)"
                className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:border-orange-500"
              />
              <p className="text-xs text-orange-600 mt-1 font-semibold">
                💡 Get this from: PropellerAds Dashboard → Zone Groups → Create Interstitial Zone → Copy Zone ID
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This will show video/interstitial ads in the Watch Ad feature, generating revenue from views!
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!propellerAdsBannerZoneId && !propellerAdsInterstitialZoneId) {
                    alert('Please enter at least one Zone ID (Banner or Interstitial)');
                    return;
                  }
                  
                  const settingsToSave = {};
                  if (propellerAdsBannerZoneId) {
                    settingsToSave.propellerAdsBannerZoneId = propellerAdsBannerZoneId;
                  }
                  if (propellerAdsInterstitialZoneId) {
                    settingsToSave.propellerAdsInterstitialZoneId = propellerAdsInterstitialZoneId;
                  }
                  
                  // Preserve existing settings
                  const currentSettings = await getAdminSettings();
                  if (currentSettings.success && currentSettings.settings) {
                    Object.keys(currentSettings.settings).forEach(key => {
                      if (!settingsToSave.hasOwnProperty(key) && key !== 'updatedAt') {
                        settingsToSave[key] = currentSettings.settings[key];
                      }
                    });
                  }
                  
                  const result = await updateAdminSettings(settingsToSave);
                  
                  // Also save to localStorage
                  if (propellerAdsBannerZoneId) {
                    localStorage.setItem('propeller_ads_banner_zone_id', propellerAdsBannerZoneId);
                  }
                  if (propellerAdsInterstitialZoneId) {
                    localStorage.setItem('propeller_ads_interstitial_zone_id', propellerAdsInterstitialZoneId);
                  }
                  
                  let message = `✅ PropellerAds configured successfully!\n\n`;
                  if (propellerAdsBannerZoneId) {
                    message += `✅ Banner ads will show at the bottom of every page\n\n`;
                  }
                  if (propellerAdsInterstitialZoneId) {
                    message += `✅ Watch Ad feature will show video/interstitial ads\n\n`;
                  }
                  message += `💰 Revenue: You'll earn money from ad views/impressions!`;
                  
                  if (!result.success) {
                    message = `⚠️ Saved locally. Error: ${result.error}\n\n${message}`;
                  }
                  
                  alert(message);
                  setShowPropellerAdsConfig(false);
                  onReload();
                }}
                className="btn-primary flex items-center bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                Enable PropellerAds
              </button>
              <button
                onClick={() => setShowPropellerAdsConfig(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            
            {propellerAdsBannerZoneId && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  ✓ Banner Zone ID configured. Banner ads will appear at the bottom of pages.
                </p>
              </div>
            )}
            {propellerAdsInterstitialZoneId && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  ✓ Interstitial Zone ID configured. Watch Ad feature will show video/interstitial ads.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CPAlead Configuration */}
      {showCPALeadConfig && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Gift className="w-6 h-6 mr-2 text-blue-600" />
            CPAlead VIP Integration
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            You're verified on CPAlead! Enter your <strong>Direct Link URL</strong> to start earning.
            <br /><strong>📊 Goal:</strong> Earn $50 in 8 days to keep your account active.
            <br />To get your Direct Link:
            <br />1. Go to CPAlead → Reward Tools → Your Offerwall
            <br />2. Click <strong>"GET CODE"</strong> button
            <br />3. Copy the <strong>"Direct Link"</strong> URL
            <br />4. Paste it here
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPAlead Offerwall Direct Link URL
              </label>
              <input
                type="text"
                value={cpaleadPublisherId}
                onChange={(e) => setCPALeadPublisherId(e.target.value.trim())}
                placeholder="Paste Offerwall Direct Link URL (e.g., https://zwidgetbv3dft.xyz/list/gMez9KHT)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Get this from: CPAlead Dashboard → Reward Tools → Your Offerwall → "GET CODE" → Copy "Direct Link"
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-600 font-bold">⭐ CPAlead Custom Ad URL (For Watch Ad)</span>
              </label>
              <input
                type="text"
                value={cpaleadCustomAdUrl}
                onChange={(e) => setCPALeadCustomAdUrl(e.target.value.trim())}
                placeholder="Paste Custom Ad Direct Link URL (e.g., https://zwidgetbv3dft.xyz/custom/XXXXX)"
                className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500"
              />
              <p className="text-xs text-purple-600 mt-1 font-semibold">
                💡 IMPORTANT: This is for "Watch Ad" feature. Get this from: CPAlead Dashboard → Ad Tools → Create Custom Ad → Get Code → Copy "Direct Link" URL
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This will show actual video/interstitial ads instead of offers, generating revenue from ad views!
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPAlead Link Locker URL (Optional)
              </label>
              <input
                type="text"
                value={cpaleadLinkLockerUrl}
                onChange={(e) => setCPALeadLinkLockerUrl(e.target.value.trim())}
                placeholder="Paste Link Locker Direct Link URL (e.g., https://qckclk.com/unlock/Nar3BFq)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Get this from: CPAlead Dashboard → Reward Tools → Your Link Locker → "GET CODE" → Copy "Direct Link"
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPAlead File Locker URL (Optional)
              </label>
              <input
                type="text"
                value={cpaleadFileLockerUrl}
                onChange={(e) => setCPALeadFileLockerUrl(e.target.value.trim())}
                placeholder="Paste File Locker Direct Link URL (e.g., https://akamaicdn.org/unlock/ksraA49S)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Get this from: CPAlead Dashboard → Reward Tools → Your File Locker → "GET CODE" → Copy "Direct Link"
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPAlead Quiz URL (Optional)
              </label>
              <input
                type="text"
                value={cpaleadQuizUrl}
                onChange={(e) => setCPALeadQuizUrl(e.target.value.trim())}
                placeholder="Paste Quiz Direct Link URL (e.g., https://zwidgetbv3dft.xyz/quiz/XXXXX)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Get this from: CPAlead Dashboard → Reward Tools → Your Quiz → "GET CODE" → Copy "Direct Link"
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!cpaleadPublisherId) {
                    alert('Please enter your CPAlead Offerwall Direct Link URL');
                    return;
                  }
                  
                  // Save all configurations to Firestore (primary) and localStorage (backup)
                  // Use merge: true to preserve existing sources
                  const settingsToSave = {
                    cpaleadPublisherId,
                  };
                  if (cpaleadCustomAdUrl) {
                    settingsToSave.cpaleadCustomAdUrl = cpaleadCustomAdUrl;
                  }
                  if (cpaleadLinkLockerUrl) {
                    settingsToSave.cpaleadLinkLockerUrl = cpaleadLinkLockerUrl;
                  }
                  if (cpaleadFileLockerUrl) {
                    settingsToSave.cpaleadFileLockerUrl = cpaleadFileLockerUrl;
                  }
                  if (cpaleadQuizUrl) {
                    settingsToSave.cpaleadQuizUrl = cpaleadQuizUrl;
                  }
                  
                  // Preserve existing sources when saving
                  const currentSettings = await getAdminSettings();
                  if (currentSettings.success && currentSettings.settings) {
                    if (currentSettings.settings.quizzes) settingsToSave.quizzes = currentSettings.settings.quizzes;
                    if (currentSettings.settings.surveys) settingsToSave.surveys = currentSettings.settings.surveys;
                    if (currentSettings.settings.videos) settingsToSave.videos = currentSettings.settings.videos;
                    if (currentSettings.settings.apps) settingsToSave.apps = currentSettings.settings.apps;
                  }
                  
                  const result = await updateAdminSettings(settingsToSave);
                  
                  // Also save to localStorage for backward compatibility
                  localStorage.setItem('cpalead_publisher_id', cpaleadPublisherId);
                  if (cpaleadCustomAdUrl) {
                    localStorage.setItem('cpalead_custom_ad_url', cpaleadCustomAdUrl);
                  }
                  if (cpaleadLinkLockerUrl) {
                    localStorage.setItem('cpalead_link_locker_url', cpaleadLinkLockerUrl);
                  }
                  if (cpaleadFileLockerUrl) {
                    localStorage.setItem('cpalead_file_locker_url', cpaleadFileLockerUrl);
                  }
                  if (cpaleadQuizUrl) {
                    localStorage.setItem('cpalead_quiz_url', cpaleadQuizUrl);
                  }
                  
                  let message = `✅ CPAlead tools configured successfully! All users can now see offers.\n\n📝 Next Steps:\n1. Go to the Tasks page\n2. You'll see all configured CPAlead tools\n3. Users complete offers → You earn money!\n\n🎯 Remember: You need to earn $50 in 8 days!`;
                  if (cpaleadCustomAdUrl) message += '\n\n⭐ Custom Ad URL added - Watch Ad feature will show real ads!';
                  if (cpaleadLinkLockerUrl) message += '\n\n✅ Link Locker added';
                  if (cpaleadFileLockerUrl) message += '\n\n✅ File Locker added';
                  if (cpaleadQuizUrl) message += '\n\n✅ Quiz added';
                  
                  if (!result.success) {
                    message = `⚠️ Saved locally. Some users may not see offers. Error: ${result.error}\n\n${message}`;
                  }
                  
                  alert(message);
                  
                  setShowCPALeadConfig(false);
                  onReload();
                }}
                className="btn-primary flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Enable CPAlead Tools
              </button>
              <button
                onClick={() => setShowCPALeadConfig(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            {cpaleadPublisherId && (
              <p className="text-xs text-green-600 mt-2">
                ✓ CPAlead configured. Offerwall will be available to users on the Tasks page.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Captcha Configuration */}
      {showCaptchaConfig && (
        <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <ShieldCheck className="w-6 h-6 mr-2 text-orange-600" />
            Captcha Solving Settings
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Configure how many points users earn for each solved captcha. This is a custom captcha-solving system where users solve captchas directly on your site.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points Per Solved Captcha
              </label>
              <input
                type="number"
                min="1"
                value={captchaPointsPerSolve}
                onChange={(e) => setCaptchaPointsPerSolve(parseInt(e.target.value) || 1)}
                placeholder="Enter points (e.g., 1, 2, 5)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Recommended: 1-5 points per captcha. Higher points = more user engagement but higher costs.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!captchaPointsPerSolve || captchaPointsPerSolve < 1) {
                    alert('Please enter a valid number of points (minimum 1)');
                    return;
                  }
                  
                  const result = await updateAdminSettings({
                    captchaPointsPerSolve: captchaPointsPerSolve,
                  });
                  
                  if (result.success) {
                    alert(`✅ Captcha settings saved! Users will now earn ${captchaPointsPerSolve} point(s) per solved captcha.\n\nChanges will take effect immediately for all users.`);
                    setShowCaptchaConfig(false);
                    onReload();
                  } else {
                    alert(`⚠️ Failed to save settings. Error: ${result.error}`);
                  }
                }}
                className="btn-primary flex items-center bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
              >
                Save Captcha Settings
              </button>
              <button
                onClick={() => setShowCaptchaConfig(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            {captchaPointsPerSolve && captchaPointsPerSolve > 0 && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Current setting: <strong>{captchaPointsPerSolve} point(s)</strong> per solved captcha
              </p>
            )}
          </div>
        </div>
      )}

      {/* Ayet Studios Configuration */}
      {showAyetStudiosConfig && (
        <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <PlayCircle className="w-6 h-6 mr-2 text-red-600" />
            Ayet Studios Video Integration
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Get your API key or offerwall URL from{' '}
            <a href="https://ayetstudios.com/publishers" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
              Ayet Studios Dashboard
            </a>
            . Once configured, users will see video watching tasks on the Videos category.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ayet Studios API Key (Optional)
              </label>
              <input
                type="text"
                value={ayetStudiosApiKey}
                onChange={(e) => setAyetStudiosApiKey(e.target.value)}
                placeholder="Enter your Ayet Studios API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                If you have an API key, enter it here. Otherwise, use the offerwall URL below.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ayet Studios Offerwall URL (Recommended)
              </label>
              <input
                type="text"
                value={ayetStudiosOfferwallUrl}
                onChange={(e) => setAyetStudiosOfferwallUrl(e.target.value)}
                placeholder="https://offerwall.ayetstudios.com/?pub=YOUR_PUB_ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your full offerwall URL from Ayet Studios dashboard. You can use {'{USER_ID}'} or {'{sub}'} as placeholder for user ID.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!ayetStudiosApiKey && !ayetStudiosOfferwallUrl) {
                    alert('Please enter either API key or offerwall URL');
                    return;
                  }

                  setSyncing(true);
                  try {
                    const result = await updateAdminSettings({
                      ayetStudiosApiKey: ayetStudiosApiKey || '',
                      ayetStudiosOfferwallUrl: ayetStudiosOfferwallUrl || '',
                    });
                    
                    if (ayetStudiosApiKey) localStorage.setItem('ayet_studios_api_key', ayetStudiosApiKey);
                    if (ayetStudiosOfferwallUrl) localStorage.setItem('ayet_studios_offerwall_url', ayetStudiosOfferwallUrl);

                    if (result.success) {
                      alert('✅ Ayet Studios video offerwall is ready! All users can now watch videos and earn points in the Videos category.');
                      setShowAyetStudiosConfig(false);
                      onReload();
                    } else {
                      alert('⚠️ Saved to local storage. Some users may not see videos. Error: ' + result.error);
                    }
                  } catch (error) {
                    console.error('Error saving Ayet Studios config:', error);
                    alert('Error saving configuration: ' + error.message);
                  } finally {
                    setSyncing(false);
                  }
                }}
                disabled={syncing || (!ayetStudiosApiKey && !ayetStudiosOfferwallUrl)}
                className="btn-primary flex items-center bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                {syncing ? 'Configuring...' : 'Enable Ayet Studios'}
              </button>
              <button
                onClick={() => setShowAyetStudiosConfig(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            {(ayetStudiosApiKey || ayetStudiosOfferwallUrl) && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Configuration saved. Ayet Studios videos will be available to users.
              </p>
            )}
          </div>
        </div>
      )}

      {/* CPX Research Configuration */}
      {showCPXResearchConfig && (
        <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-indigo-600" />
            CPX Research Survey Integration
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Get your API key or offerwall URL from{' '}
            <a href="https://cpx-research.com/publishers" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              CPX Research Dashboard
            </a>
            . CPX Research offers high-paying surveys with instant approval. Once configured, users will see surveys in the Surveys category. Note: Survey rewards (+0.00) are shown after completion.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPX Research API Key (Optional)
              </label>
              <input
                type="text"
                value={cpxResearchApiKey}
                onChange={(e) => setCpxResearchApiKey(e.target.value)}
                placeholder="Enter your CPX Research API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                If you have an API key, enter it here. Otherwise, use the offerwall URL below.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPX Research Offerwall URL (Recommended)
              </label>
              <input
                type="text"
                value={cpxResearchOfferwallUrl}
                onChange={(e) => setCpxResearchOfferwallUrl(e.target.value)}
                placeholder="https://offers.cpx-research.com/?pub=YOUR_PUB_ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste your full CPX Research iframe src URL here. You can use placeholders like {'{unique_user_id}'}, {'{user_name}'}, {'{user_email}'}, {'{secure_hash}'}. The system will automatically replace them with actual user data.
              </p>
              <p className="text-xs text-blue-600 mt-1 font-semibold">
                💡 Example: https://offers.cpx-research.com/index.php?app_id=29825&ext_user_id={'{unique_user_id}'}&username={'{user_name}'}&email={'{user_email}'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!cpxResearchApiKey && !cpxResearchOfferwallUrl) {
                    alert('Please enter either API key or offerwall URL');
                    return;
                  }

                  setSyncing(true);
                  try {
                    const result = await updateAdminSettings({
                      cpxResearchApiKey: cpxResearchApiKey || '',
                      cpxResearchOfferwallUrl: cpxResearchOfferwallUrl || '',
                    });
                    
                    if (cpxResearchApiKey) localStorage.setItem('cpx_research_api_key', cpxResearchApiKey);
                    if (cpxResearchOfferwallUrl) localStorage.setItem('cpx_research_offerwall_url', cpxResearchOfferwallUrl);

                    if (result.success) {
                      alert('✅ CPX Research surveys are ready! All users can now complete surveys and earn high rewards in the Surveys category. Note: Survey rewards (+0.00) are shown after completion.');
                      setShowCPXResearchConfig(false);
                      onReload();
                    } else {
                      alert('⚠️ Saved to local storage. Some users may not see surveys. Error: ' + result.error);
                    }
                  } catch (error) {
                    console.error('Error saving CPX Research config:', error);
                    alert('Error saving configuration: ' + error.message);
                  } finally {
                    setSyncing(false);
                  }
                }}
                disabled={syncing || (!cpxResearchApiKey && !cpxResearchOfferwallUrl)}
                className="btn-primary flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {syncing ? 'Configuring...' : 'Enable CPX Research'}
              </button>
              <button
                onClick={() => setShowCPXResearchConfig(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            {(cpxResearchApiKey || cpxResearchOfferwallUrl) && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Configuration saved. CPX Research surveys will be available to users. Rewards shown after completion.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Lootably Configuration */}
      {showLootablyConfig && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Gift className="w-6 h-6 mr-2 text-blue-600" />
            Lootably Integration (Instant Approval)
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Get your API key from{' '}
            <a href="https://www.lootably.com/publishers" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Lootably Dashboard
            </a>
            . Lootably offers surveys, apps, videos, and more with instant approval. Once configured, users will see offers in multiple categories.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lootably API Key (Optional)
              </label>
              <input
                type="text"
                value={lootablyApiKey}
                onChange={(e) => setLootablyApiKey(e.target.value)}
                placeholder="Enter your Lootably API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lootably Offerwall URL (Recommended)
              </label>
              <input
                type="text"
                value={lootablyOfferwallUrl}
                onChange={(e) => setLootablyOfferwallUrl(e.target.value)}
                placeholder="https://www.lootably.com/offers?pub=YOUR_API_KEY&sub={USER_ID}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{USER_ID}'} as placeholder for user ID. System will replace it automatically.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!lootablyApiKey && !lootablyOfferwallUrl) {
                    alert('Please enter either API key or offerwall URL');
                    return;
                  }
                  setSyncing(true);
                  try {
                    const result = await updateAdminSettings({ lootablyApiKey, lootablyOfferwallUrl });
                    if (lootablyApiKey) localStorage.setItem('lootably_api_key', lootablyApiKey);
                    if (lootablyOfferwallUrl) localStorage.setItem('lootably_offerwall_url', lootablyOfferwallUrl);
                    if (result.success) {
                      alert('✅ Lootably is ready! Users can now see offers in Surveys, Videos, and Apps categories.');
                      setShowLootablyConfig(false);
                      onReload();
                    } else {
                      alert('⚠️ Saved to local storage. Error: ' + result.error);
                    }
                  } catch (error) {
                    console.error('Error saving Lootably config:', error);
                    alert('Error saving configuration: ' + error.message);
                  } finally {
                    setSyncing(false);
                  }
                }}
                disabled={syncing || (!lootablyApiKey && !lootablyOfferwallUrl)}
                className="btn-primary flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {syncing ? 'Configuring...' : 'Enable Lootably'}
              </button>
              <button
                onClick={() => setShowLootablyConfig(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AdGem Configuration */}
      {showAdGemConfig && (
        <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Gift className="w-6 h-6 mr-2 text-green-600" />
            AdGem Integration (Instant Approval)
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Get your API key from{' '}
            <a href="https://www.adgem.com/publishers" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
              AdGem Dashboard
            </a>
            . AdGem offers surveys, apps, videos, and more with instant approval. Once configured, users will see offers in multiple categories.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AdGem API Key (Optional)
              </label>
              <input
                type="text"
                value={adgemApiKey}
                onChange={(e) => setAdgemApiKey(e.target.value)}
                placeholder="Enter your AdGem API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AdGem Offerwall URL (Recommended)
              </label>
              <input
                type="text"
                value={adgemOfferwallUrl}
                onChange={(e) => setAdgemOfferwallUrl(e.target.value)}
                placeholder="https://www.adgem.com/offers?pub=YOUR_API_KEY&sub={USER_ID}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{USER_ID}'} as placeholder for user ID. System will replace it automatically.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!adgemApiKey && !adgemOfferwallUrl) {
                    alert('Please enter either API key or offerwall URL');
                    return;
                  }
                  setSyncing(true);
                  try {
                    const result = await updateAdminSettings({ adgemApiKey, adgemOfferwallUrl });
                    if (adgemApiKey) localStorage.setItem('adgem_api_key', adgemApiKey);
                    if (adgemOfferwallUrl) localStorage.setItem('adgem_offerwall_url', adgemOfferwallUrl);
                    if (result.success) {
                      alert('✅ AdGem is ready! Users can now see offers in Surveys, Videos, and Apps categories.');
                      setShowAdGemConfig(false);
                      onReload();
                    } else {
                      alert('⚠️ Saved to local storage. Error: ' + result.error);
                    }
                  } catch (error) {
                    console.error('Error saving AdGem config:', error);
                    alert('Error saving configuration: ' + error.message);
                  } finally {
                    setSyncing(false);
                  }
                }}
                disabled={syncing || (!adgemApiKey && !adgemOfferwallUrl)}
                className="btn-primary flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {syncing ? 'Configuring...' : 'Enable AdGem'}
              </button>
              <button
                onClick={() => setShowAdGemConfig(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hideout.tv Configuration */}
      {showHideoutTvConfig && (
        <div className="mb-6 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border-2 border-pink-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <PlayCircle className="w-6 h-6 mr-2 text-pink-600" />
            Hideout.tv Integration (Instant Approval)
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Get your API key from{' '}
            <a href="https://www.hideout.tv/publishers" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
              Hideout.tv Dashboard
            </a>
            . Hideout.tv offers video watching with instant approval. Once configured, users will see videos in the Videos category.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hideout.tv API Key (Optional)
              </label>
              <input
                type="text"
                value={hideoutTvApiKey}
                onChange={(e) => setHideoutTvApiKey(e.target.value)}
                placeholder="Enter your Hideout.tv API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hideout.tv Offerwall URL (Recommended)
              </label>
              <input
                type="text"
                value={hideoutTvOfferwallUrl}
                onChange={(e) => setHideoutTvOfferwallUrl(e.target.value)}
                placeholder="https://www.hideout.tv/offers?pub=YOUR_API_KEY&sub={USER_ID}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{USER_ID}'} as placeholder for user ID. System will replace it automatically.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!hideoutTvApiKey && !hideoutTvOfferwallUrl) {
                    alert('Please enter either API key or offerwall URL');
                    return;
                  }
                  setSyncing(true);
                  try {
                    const result = await updateAdminSettings({ hideoutTvApiKey, hideoutTvOfferwallUrl });
                    if (hideoutTvApiKey) localStorage.setItem('hideout_tv_api_key', hideoutTvApiKey);
                    if (hideoutTvOfferwallUrl) localStorage.setItem('hideout_tv_offerwall_url', hideoutTvOfferwallUrl);
                    if (result.success) {
                      alert('✅ Hideout.tv is ready! Users can now watch videos and earn points in the Videos category.');
                      setShowHideoutTvConfig(false);
                      onReload();
                    } else {
                      alert('⚠️ Saved to local storage. Error: ' + result.error);
                    }
                  } catch (error) {
                    console.error('Error saving Hideout.tv config:', error);
                    alert('Error saving configuration: ' + error.message);
                  } finally {
                    setSyncing(false);
                  }
                }}
                disabled={syncing || (!hideoutTvApiKey && !hideoutTvOfferwallUrl)}
                className="btn-primary flex items-center bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
              >
                {syncing ? 'Configuring...' : 'Enable Hideout.tv'}
              </button>
              <button
                onClick={() => setShowHideoutTvConfig(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OfferToro Configuration */}
      {showOfferToroConfig && (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Gift className="w-6 h-6 mr-2 text-purple-600" />
            OfferToro Integration
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Get your API key from{' '}
            <a href="https://www.offertoro.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
              OfferToro Dashboard
            </a>
            . Once configured, users will see OfferToro offers on the Tasks page.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OfferToro API Key
              </label>
              <input
                type="text"
                value={offertoroApiKey}
                onChange={(e) => setOffertoroApiKey(e.target.value)}
                placeholder="Enter your OfferToro API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSyncOfferToro}
                disabled={syncing || !offertoroApiKey}
                className="btn-primary flex items-center"
              >
                {syncing ? 'Configuring...' : 'Enable OfferToro'}
              </button>
              <button
                onClick={() => setShowOfferToroConfig(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            {offertoroApiKey && (
              <p className="text-xs text-green-600 mt-2">
                ✓ API key saved. OfferToro offerwall will be available to users.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Multiple Quiz/Survey Sources Configuration */}
      {showMultiSourceConfig && (
        <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Plus className="w-6 h-6 mr-2 text-indigo-600" />
            Add Multiple Quiz/Survey/Video/App Sources
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Add multiple quiz, survey, video, or app sources from different websites. They will appear in the appropriate category on the Tasks page.
          </p>
          
          {/* Add New Source Form */}
          <div className="mb-6 p-4 bg-white rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-gray-800 mb-3">Add New Source</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newSource.type}
                  onChange={(e) => setNewSource({ ...newSource, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="quiz">Quiz</option>
                  <option value="survey">Survey</option>
                  <option value="video">Video</option>
                  <option value="app">App</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source Name</label>
                <input
                  type="text"
                  value={newSource.source}
                  onChange={(e) => setNewSource({ ...newSource, source: e.target.value })}
                  placeholder="e.g., CPAlead, OfferToro"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  placeholder="e.g., CPAlead Quizzes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="text"
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  placeholder="Enter source URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={() => {
                if (!newSource.url || !newSource.source) {
                  alert('Please fill in URL and Source name');
                  return;
                }
                const sourceData = { ...newSource };
                switch (newSource.type) {
                  case 'quiz':
                    setQuizSources([...quizSources, sourceData]);
                    break;
                  case 'survey':
                    setSurveySources([...surveySources, sourceData]);
                    break;
                  case 'video':
                    setVideoSources([...videoSources, sourceData]);
                    break;
                  case 'app':
                    setAppSources([...appSources, sourceData]);
                    break;
                }
                setNewSource({ type: 'quiz', name: '', url: '', source: '' });
              }}
              className="mt-3 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            >
              Add Source
            </button>
          </div>

          {/* Display Current Sources */}
          <div className="space-y-4">
            {/* Quiz Sources */}
            {quizSources.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-700 mb-2">Quiz Sources ({quizSources.length})</h4>
                {quizSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded mb-2">
                    <div>
                      <span className="font-medium">{source.name || `${source.source} Quiz`}</span>
                      <span className="text-xs text-gray-500 ml-2">({source.source})</span>
                    </div>
                    <button
                      onClick={() => {
                        setQuizSources(quizSources.filter((_, i) => i !== index));
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Survey Sources */}
            {surveySources.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">Survey Sources ({surveySources.length})</h4>
                {surveySources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded mb-2">
                    <div>
                      <span className="font-medium">{source.name || `${source.source} Surveys`}</span>
                      <span className="text-xs text-gray-500 ml-2">({source.source})</span>
                    </div>
                    <button
                      onClick={() => {
                        setSurveySources(surveySources.filter((_, i) => i !== index));
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Video Sources */}
            {videoSources.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-700 mb-2">Video Sources ({videoSources.length})</h4>
                {videoSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded mb-2">
                    <div>
                      <span className="font-medium">{source.name || `${source.source} Videos`}</span>
                      <span className="text-xs text-gray-500 ml-2">({source.source})</span>
                    </div>
                    <button
                      onClick={() => {
                        setVideoSources(videoSources.filter((_, i) => i !== index));
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* App Sources */}
            {appSources.length > 0 && (
              <div className="p-4 bg-white rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-700 mb-2">App Sources ({appSources.length})</h4>
                {appSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-indigo-50 rounded mb-2">
                    <div>
                      <span className="font-medium">{source.name || `${source.source} Apps`}</span>
                      <span className="text-xs text-gray-500 ml-2">({source.source})</span>
                    </div>
                    <button
                      onClick={() => {
                        setAppSources(appSources.filter((_, i) => i !== index));
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={async () => {
                const result = await updateAdminSettings({
                  quizzes: quizSources,
                  surveys: surveySources,
                  videos: videoSources,
                  apps: appSources,
                });
                
                if (result.success) {
                  alert(`✅ ${quizSources.length} quiz, ${surveySources.length} survey, ${videoSources.length} video, and ${appSources.length} app sources saved successfully! All users will see them in the appropriate categories.`);
                  setShowMultiSourceConfig(false);
                  onReload();
                } else {
                  alert(`⚠️ Failed to save: ${result.error}`);
                }
              }}
              className="btn-primary flex items-center"
            >
              Save All Sources
            </button>
            <button
              onClick={() => setShowMultiSourceConfig(false)}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Quick Affiliate Task Templates */}
      {!showAddForm && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Add Affiliate Tasks</h3>
          <p className="text-sm text-gray-600 mb-4">Click any button below to quickly add common affiliate tasks. Edit the links with your affiliate codes before saving.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => {
                setFormData({
                  title: 'Install Paytm - Complete KYC',
                  description: 'Download Paytm app using my referral, complete KYC verification. Safe digital wallet! Takes 5 minutes.',
                  rewardPoints: '500',
                  link: 'https://paytm.com/r/YOUR_REFERRAL_CODE',
                  active: true,
                  category: 'finance',
                  isAffiliate: true,
                });
                setShowAddForm(true);
              }}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm"
            >
              💰 Paytm Referral
            </button>
            <button
              onClick={() => {
                setFormData({
                  title: 'Install PhonePe - Set Up UPI',
                  description: 'Install PhonePe app from this link to earn points. Complete UPI setup after installation. Note: If you already have PhonePe installed, you will not earn points for this task.',
                  rewardPoints: '400',
                  link: 'https://phon.pe/ktkefvjx',
                  active: true,
                  category: 'finance',
                  isAffiliate: true,
                });
                setShowAddForm(true);
              }}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
            >
              💳 PhonePe Referral
            </button>
            <button
              onClick={() => {
                setFormData({
                  title: 'Install Raid: Shadow Legends - Reach Level 10',
                  description: 'Download Raid: Shadow Legends from Play Store, complete tutorial, and reach account level 10. Epic RPG game!',
                  rewardPoints: '400',
                  link: 'https://play.google.com/store/apps/details?id=com.plarium.raidlegends',
                  active: true,
                  category: 'games',
                  isAffiliate: false,
                });
                setShowAddForm(true);
              }}
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 text-sm"
            >
              🎮 Game Install
            </button>
            <button
              onClick={() => {
                setFormData({
                  title: 'Install Flipkart App - Browse Products',
                  description: 'Download Flipkart shopping app, create account if new, and browse products for 3 minutes. No purchase needed!',
                  rewardPoints: '250',
                  link: 'https://play.google.com/store/apps/details?id=com.flipkart.android',
                  active: true,
                  category: 'shopping',
                  isAffiliate: false,
                });
                setShowAddForm(true);
              }}
              className="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 text-sm"
            >
              🛒 Shopping App
            </button>
            <button
              onClick={() => {
                setFormData({
                  title: 'Install Disney+ Hotstar - Watch Free Content',
                  description: 'Download Disney+ Hotstar, create free account, and watch any video for 10 minutes. Movies, shows, and sports!',
                  rewardPoints: '350',
                  link: 'https://play.google.com/store/apps/details?id=in.startv.hotstar',
                  active: true,
                  category: 'entertainment',
                  isAffiliate: false,
                });
                setShowAddForm(true);
              }}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 text-sm"
            >
              📺 Streaming App
            </button>
            <button
              onClick={() => {
                setFormData({
                  title: 'Follow Us on Instagram',
                  description: 'Follow our Instagram account @YourUsername, like 5 recent posts, and stay following for at least 7 days. Support us!',
                  rewardPoints: '100',
                  link: 'https://instagram.com/YourUsername',
                  active: true,
                  category: 'social',
                  isAffiliate: false,
                });
                setShowAddForm(true);
              }}
              className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 text-sm"
            >
              📱 Social Media
            </button>
          </div>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4 border-2 border-purple-200">
          <div className="bg-purple-100 p-3 rounded-lg mb-4">
            <p className="text-sm text-purple-800">
              <strong>💡 Tip:</strong> For affiliate links, replace placeholder codes (like YOUR_REFERRAL_CODE) with your actual referral codes or affiliate IDs to start earning commissions!
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Install Paytm - Complete KYC"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows="3"
              placeholder="Describe what users need to do to complete this task..."
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Points *
                <span className="text-xs text-gray-500 ml-1">(10 points = ₹1)</span>
              </label>
              <input
                type="number"
                value={formData.rewardPoints}
                onChange={(e) => setFormData({ ...formData, rewardPoints: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 500"
                min="1"
                required
              />
              {formData.rewardPoints && (
                <p className="text-xs text-gray-600 mt-1">
                  = ₹{(parseInt(formData.rewardPoints) / 10).toFixed(2)} to user
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task / Referral / Affiliate Link *
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/your-affiliate-link?ref=YOUR_CODE"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                {formData.link.includes('YOUR_REFERRAL_CODE') || formData.link.includes('YOUR_') || formData.link.includes('YOUR_CODE') ? (
                  <span className="text-orange-600">⚠️ Replace placeholder with your actual referral/affiliate code!</span>
                ) : (
                  <span className="text-green-600">✓ Link format looks good - Your referral/affiliate link will be used when users click</span>
                )}
              </p>
              <p className="text-xs text-blue-600 mt-1 font-semibold">
                💡 Tip: Add your referral code or affiliate ID to the URL. Users will click this link directly, so you'll earn commission!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="surveys">Surveys</option>
                <option value="quizzes">Quizzes</option>
                <option value="videos">Videos</option>
                <option value="apps">Apps</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAffiliate"
                checked={formData.isAffiliate}
                onChange={(e) => setFormData({ ...formData, isAffiliate: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="isAffiliate" className="ml-2 text-sm text-gray-700">
                This is an affiliate/referral link (I earn commission)
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? 'Adding...' : 'Add Task / Affiliate Link'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setFormData({ title: '', description: '', rewardPoints: '', link: '', active: true, category: 'surveys', isAffiliate: false });
              }}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
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
