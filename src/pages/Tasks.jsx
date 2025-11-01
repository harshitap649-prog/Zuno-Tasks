import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveOffers, getUserOngoingTasks, startTask } from '../firebase/firestore';
import { Coins, Gift, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import OfferToroOfferwall from '../components/OfferToroOfferwall';
import InstantNetworkOfferwall from '../components/InstantNetworkOfferwall';
import CPALeadOfferwall from '../components/CPALeadOfferwall';
import CPALeadLinkLocker from '../components/CPALeadLinkLocker';
import CPALeadFileLocker from '../components/CPALeadFileLocker';
import CPALeadQuiz from '../components/CPALeadQuiz';

export default function Tasks({ user }) {
  const [availableTasks, setAvailableTasks] = useState([]);
  const [ongoingTasks, setOngoingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOfferToro, setShowOfferToro] = useState(false);
  const [showInstantNetwork, setShowInstantNetwork] = useState(false);
  const [showCPALead, setShowCPALead] = useState(false);
  const [showCPALeadLinkLocker, setShowCPALeadLinkLocker] = useState(false);
  const [showCPALeadFileLocker, setShowCPALeadFileLocker] = useState(false);
  const [showCPALeadQuiz, setShowCPALeadQuiz] = useState(false);
  const [offertoroApiKey, setOffertoroApiKey] = useState('');
  const [instantNetwork, setInstantNetwork] = useState('');
  const [instantNetworkApiKey, setInstantNetworkApiKey] = useState('');
  const [cpaleadPublisherId, setCPALeadPublisherId] = useState('');
  const [cpaleadLinkLockerUrl, setCPALeadLinkLockerUrl] = useState('');
  const [cpaleadFileLockerUrl, setCPALeadFileLockerUrl] = useState('');
  const [cpaleadQuizUrl, setCPALeadQuizUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
    // Load OfferToro API key
    const savedKey = localStorage.getItem('offertoro_api_key') || import.meta.env.VITE_OFFERTORO_API_KEY || '';
    setOffertoroApiKey(savedKey);
    
    // Load instant network config
    const savedNetwork = localStorage.getItem('instant_network') || '';
    const savedNetworkKey = localStorage.getItem('instant_network_api_key') || '';
    setInstantNetwork(savedNetwork);
    setInstantNetworkApiKey(savedNetworkKey);
    
    // Load CPAlead config
    const savedCPALeadId = localStorage.getItem('cpalead_publisher_id') || '';
    const savedLinkLocker = localStorage.getItem('cpalead_link_locker_url') || '';
    const savedFileLocker = localStorage.getItem('cpalead_file_locker_url') || '';
    const savedQuiz = localStorage.getItem('cpalead_quiz_url') || '';
    setCPALeadPublisherId(savedCPALeadId);
    setCPALeadLinkLockerUrl(savedLinkLocker);
    setCPALeadFileLockerUrl(savedFileLocker);
    setCPALeadQuizUrl(savedQuiz);
  }, [user]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      // Get available tasks (all active offers)
      const offersResult = await getActiveOffers();
      
      // Get ongoing tasks for this user
      const ongoingResult = await getUserOngoingTasks(user.uid);
      
      if (ongoingResult.success) {
        setOngoingTasks(ongoingResult.tasks);
        
        // Filter out tasks that are already ongoing
        if (offersResult.success) {
          const ongoingOfferIds = new Set(ongoingResult.tasks.map(t => t.offerId));
          const available = offersResult.offers.filter(offer => !ongoingOfferIds.has(offer.id));
          setAvailableTasks(available);
        } else {
          // If offers failed but we have ongoing tasks, set empty available
          setAvailableTasks([]);
        }
      } else {
        // No ongoing tasks or error
        if (offersResult.success) {
          setAvailableTasks(offersResult.offers);
        } else {
          setAvailableTasks([]);
        }
        setOngoingTasks([]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      // On error, still try to load offers
      try {
        const offersResult = await getActiveOffers();
        if (offersResult.success) {
          setAvailableTasks(offersResult.offers);
        }
      } catch (e) {
        console.error('Error loading offers:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Gift className="w-8 h-8 mr-3 text-purple-600" />
            Available Tasks
          </h1>
        </div>
      </div>

      {/* Ongoing Tasks Section - DISABLED (only showing CPAlead tasks) */}
      {false && ongoingTasks.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center mb-6">
            <Clock className="w-6 h-6 mr-2 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-800">Ongoing Tasks</h2>
            <span className="ml-3 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
              {ongoingTasks.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingTasks.map((task) => (
              <OngoingTaskCard key={task.id} task={task} onUpdate={loadTasks} />
            ))}
          </div>
        </div>
      )}

      {/* Instant Network Offerwall Section */}
      {instantNetwork && instantNetworkApiKey && instantNetwork !== 'offerwallme' && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Gift className="w-6 h-6 mr-2 text-green-600" />
              {instantNetwork === 'offerwallme' && 'Offerwall.me'}
              {instantNetwork === 'offerwallpro' && 'Offerwall PRO'}
              {instantNetwork === 'bitlabs' && 'Bitlabs'}
              {instantNetwork === 'adgatemedia' && 'AdGate Media'}
              {' '}Tasks
            </h2>
            <button
              onClick={() => setShowInstantNetwork(!showInstantNetwork)}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center"
            >
              {showInstantNetwork ? 'Hide Offerwall' : 'View Offers'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showInstantNetwork && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <InstantNetworkOfferwall
                network={instantNetwork}
                apiKey={instantNetworkApiKey}
                userId={user.uid}
                onComplete={(data) => {
                  alert(`Task completed! Reward: ${data.reward} points`);
                  loadTasks();
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* CPAlead Offerwall Section */}
      {cpaleadPublisherId && (
        <div className="card mb-8 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Gift className="w-6 h-6 mr-2 text-blue-600" />
              CPAlead VIP - High-Paying Offers
            </h2>
            <button
              onClick={() => setShowCPALead(!showCPALead)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showCPALead ? 'Hide Offerwall' : 'View CPAlead Offers'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showCPALead && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <CPALeadOfferwall
                publisherId={cpaleadPublisherId}
                userId={user.uid}
                onComplete={(data) => {
                  alert(`Task completed! Reward: ${data.reward} points`);
                  loadTasks();
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* CPAlead Link Locker Section */}
      {cpaleadLinkLockerUrl && (
        <div className="card mb-8 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Gift className="w-6 h-6 mr-2 text-blue-500" />
              CPAlead Link Locker - Unlock Premium Links
            </h2>
            <button
              onClick={() => setShowCPALeadLinkLocker(!showCPALeadLinkLocker)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showCPALeadLinkLocker ? 'Hide' : 'Open Link Locker'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showCPALeadLinkLocker && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <CPALeadLinkLocker
                lockerUrl={cpaleadLinkLockerUrl}
                userId={user.uid}
              />
            </div>
          )}
        </div>
      )}

      {/* CPAlead File Locker Section */}
      {cpaleadFileLockerUrl && (
        <div className="card mb-8 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Gift className="w-6 h-6 mr-2 text-green-600" />
              CPAlead File Locker - Unlock Premium Files
            </h2>
            <button
              onClick={() => setShowCPALeadFileLocker(!showCPALeadFileLocker)}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showCPALeadFileLocker ? 'Hide' : 'Open File Locker'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showCPALeadFileLocker && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <CPALeadFileLocker
                lockerUrl={cpaleadFileLockerUrl}
                userId={user.uid}
              />
            </div>
          )}
        </div>
      )}

      {/* CPAlead Quiz Section */}
      {cpaleadQuizUrl && (
        <div className="card mb-8 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Gift className="w-6 h-6 mr-2 text-purple-600" />
              CPAlead Quiz - Test Your Knowledge & Earn
            </h2>
            <button
              onClick={() => setShowCPALeadQuiz(!showCPALeadQuiz)}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showCPALeadQuiz ? 'Hide' : 'Start Quiz'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showCPALeadQuiz && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <CPALeadQuiz
                quizUrl={cpaleadQuizUrl}
                userId={user.uid}
                onComplete={(data) => {
                  alert(`Quiz completed! Reward: ${data.reward} points`);
                  loadTasks();
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* OfferToro Offerwall Section */}
      {offertoroApiKey && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Gift className="w-6 h-6 mr-2 text-purple-600" />
              OfferToro Tasks
            </h2>
            <button
              onClick={() => setShowOfferToro(!showOfferToro)}
              className="btn-primary flex items-center"
            >
              {showOfferToro ? 'Hide Offerwall' : 'View OfferToro Tasks'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showOfferToro && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <OfferToroOfferwall
                apiKey={offertoroApiKey}
                userId={user.uid}
                onComplete={(data) => {
                  alert(`Task completed! Reward: ${data.reward} points`);
                  loadTasks();
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Available Tasks Section - DISABLED (only showing CPAlead tasks) */}
      {/* Manual tasks like PhonePe, Paytm, etc. are hidden - only CPAlead offerwalls are shown */}
      {false && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Gift className="w-6 h-6 mr-2 text-purple-600" />
            Available Tasks
            <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
              {availableTasks.length}
            </span>
          </h2>

          {availableTasks.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No tasks available at the moment. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTasks.map((task) => (
                <AvailableTaskCard 
                  key={task.id} 
                  task={task} 
                  userId={user.uid}
                  onStart={loadTasks}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AvailableTaskCard({ task, userId, onStart }) {
  const handleStartTask = async () => {
    // Start the task in database
    const result = await startTask(userId, task.id, {
      title: task.title,
      description: task.description,
      link: task.link,
      rewardPoints: task.rewardPoints,
    });

    if (result.success) {
      // Open the task link
      if (task.link) {
        window.open(task.link, '_blank', 'noopener,noreferrer');
      }
      // Refresh tasks list
      if (onStart) {
        onStart();
      }
      alert('Task started! Complete it to earn rewards.');
    } else {
      alert('Failed to start task: ' + result.error);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{task.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-purple-600 font-bold">
          <Coins className="w-5 h-5 mr-1" />
          {task.rewardPoints} points
        </div>
        <button
          onClick={handleStartTask}
          className="btn-primary text-sm py-2 px-4"
        >
          Start Task
        </button>
      </div>
    </div>
  );
}

function OngoingTaskCard({ task, onUpdate }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'started':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_verification':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border-2 border-orange-200 rounded-lg p-6 bg-orange-50 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex-1">{task.taskTitle || 'Task'}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
          {task.status || 'Started'}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-4">{task.taskDescription || 'Complete this task to earn rewards'}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-orange-600 font-bold">
          <Coins className="w-5 h-5 mr-1" />
          {task.rewardPoints || 0} points
        </div>
        <button
          onClick={() => {
            if (task.taskLink) {
              window.open(task.taskLink, '_blank', 'noopener,noreferrer');
            }
          }}
          className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 text-sm transition-colors"
        >
          Continue Task
        </button>
      </div>
    </div>
  );
}

