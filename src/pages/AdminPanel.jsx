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
  updateSupportMessageStatus,
  getAdminSettings,
  updateAdminSettings,
  getAllClientCaptchas,
  getQuizCompletionStats
} from '../firebase/firestore';
import { Users, DollarSign, Gift, Settings, Ban, CheckCircle, XCircle, Plus, HelpCircle, MessageSquare, ShieldCheck, Image, Loader2, PlayCircle, FileText } from 'lucide-react';
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
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
        {quizStats && (
          <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <p className="text-indigo-100 text-sm font-medium">Quiz Completions</p>
            <p className="text-3xl font-bold mt-2">{quizStats.totalCompletions}</p>
            <p className="text-xs text-indigo-200 mt-1">Est. Revenue: ₹{quizStats.estimatedRevenue.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'withdrawals', label: `Withdrawals (${pendingWithdrawals.length})`, icon: DollarSign },
            { id: 'support', label: `Support (${pendingSupportMessages.length})`, icon: HelpCircle },
            { id: 'offers', label: 'Offers', icon: Gift },
            { id: 'captchas', label: `Captchas (${clientCaptchas.filter(c => c.status === 'pending').length})`, icon: ShieldCheck },
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

      {activeTab === 'captchas' && (
        <ClientCaptchasTab
          captchas={clientCaptchas}
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
                  ₹{((user.totalEarned || 0) / 10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
  const [showOfferToroConfig, setShowOfferToroConfig] = useState(false);
  const [showInstantNetworkConfig, setShowInstantNetworkConfig] = useState(false);
  const [showCPALeadConfig, setShowCPALeadConfig] = useState(false);
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
  const [cpaleadLinkLockerUrl, setCPALeadLinkLockerUrl] = useState('');
  const [cpaleadFileLockerUrl, setCPALeadFileLockerUrl] = useState('');
  const [cpaleadQuizUrl, setCPALeadQuizUrl] = useState('');
  const [captchaPointsPerSolve, setCaptchaPointsPerSolve] = useState(1);
  const [syncing, setSyncing] = useState(false);
  
  // Multiple source management
  const [showMultiSourceConfig, setShowMultiSourceConfig] = useState(false);
  const [quizSources, setQuizSources] = useState([]);
  const [surveySources, setSurveySources] = useState([]);
  const [videoSources, setVideoSources] = useState([]);
  const [appSources, setAppSources] = useState([]);
  const [newSource, setNewSource] = useState({ type: 'quiz', name: '', url: '', source: '' });
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
        setCPALeadLinkLockerUrl(settings.cpaleadLinkLockerUrl || '');
        setCPALeadFileLockerUrl(settings.cpaleadFileLockerUrl || '');
        setCPALeadQuizUrl(settings.cpaleadQuizUrl || '');
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
        setCaptchaPointsPerSolve(settings.captchaPointsPerSolve || 1);
        
        // Also sync to localStorage for backward compatibility
        if (settings.offertoroApiKey) localStorage.setItem('offertoro_api_key', settings.offertoroApiKey);
        if (settings.instantNetwork) localStorage.setItem('instant_network', settings.instantNetwork);
        if (settings.instantNetworkApiKey) localStorage.setItem('instant_network_api_key', settings.instantNetworkApiKey);
        if (settings.cpaleadPublisherId) localStorage.setItem('cpalead_publisher_id', settings.cpaleadPublisherId);
        if (settings.cpaleadLinkLockerUrl) localStorage.setItem('cpalead_link_locker_url', settings.cpaleadLinkLockerUrl);
        if (settings.cpaleadFileLockerUrl) localStorage.setItem('cpalead_file_locker_url', settings.cpaleadFileLockerUrl);
        if (settings.cpaleadQuizUrl) localStorage.setItem('cpalead_quiz_url', settings.cpaleadQuizUrl);
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
        setCPALeadPublisherId(savedCPALeadId);
        setCPALeadLinkLockerUrl(savedLinkLocker);
        setCPALeadFileLockerUrl(savedFileLocker);
        setCPALeadQuizUrl(savedQuiz);
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
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Offers & Tasks</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowInstantNetworkConfig(!showInstantNetworkConfig)}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Gift className="w-5 h-5 mr-2" />
            Instant Networks
          </button>
          <button
            onClick={() => setShowOfferToroConfig(!showOfferToroConfig)}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Gift className="w-5 h-5 mr-2" />
            OfferToro
          </button>
          <button
            onClick={() => setShowAyetStudiosConfig(!showAyetStudiosConfig)}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 px-4 rounded-lg hover:from-red-700 hover:to-orange-700 flex items-center"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Ayet Studios (Videos)
          </button>
          <button
            onClick={() => setShowCPXResearchConfig(!showCPXResearchConfig)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 flex items-center"
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
                CPAlead Direct Link URL
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
