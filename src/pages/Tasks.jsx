import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveOffers, getUserOngoingTasks, startTask, getAdminSettings, subscribeToAdminSettings } from '../firebase/firestore';
import { Coins, Gift, Clock, ArrowLeft, ExternalLink, HelpCircle, PlayCircle, FileText, Smartphone } from 'lucide-react';
import OfferToroOfferwall from '../components/OfferToroOfferwall';
import InstantNetworkOfferwall from '../components/InstantNetworkOfferwall';
import CPALeadOfferwall from '../components/CPALeadOfferwall';
import CPALeadLinkLocker from '../components/CPALeadLinkLocker';
import CPALeadFileLocker from '../components/CPALeadFileLocker';
import CPALeadQuiz from '../components/CPALeadQuiz';
import AyetStudiosOfferwall from '../components/AyetStudiosOfferwall';
import CPXResearchQuiz from '../components/CPXResearchQuiz';
import LootablyOfferwall from '../components/LootablyOfferwall';
import AdGemOfferwall from '../components/AdGemOfferwall';
import HideoutTvOfferwall from '../components/HideoutTvOfferwall';

export default function Tasks({ user }) {
  const [availableTasks, setAvailableTasks] = useState([]);
  const [ongoingTasks, setOngoingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all'); // 'quizzes', 'surveys', 'videos', 'apps', 'all'
  
  // Individual component visibility states
  const [showOfferToro, setShowOfferToro] = useState(false);
  const [showInstantNetwork, setShowInstantNetwork] = useState(false);
  const [showCPALead, setShowCPALead] = useState(false);
  const [showCPALeadLinkLocker, setShowCPALeadLinkLocker] = useState(false);
  const [showCPALeadFileLocker, setShowCPALeadFileLocker] = useState(false);
  const [showCPALeadQuiz, setShowCPALeadQuiz] = useState(false);
  const [showAyetStudios, setShowAyetStudios] = useState(false);
  const [showCPXResearch, setShowCPXResearch] = useState(false);
  const [showLootably, setShowLootably] = useState(false);
  const [showAdGem, setShowAdGem] = useState(false);
  const [showHideoutTv, setShowHideoutTv] = useState(false);
  
  // Settings states
  const [offertoroApiKey, setOffertoroApiKey] = useState('');
  const [instantNetwork, setInstantNetwork] = useState('');
  const [instantNetworkApiKey, setInstantNetworkApiKey] = useState('');
  const [cpaleadPublisherId, setCPALeadPublisherId] = useState('');
  const [cpaleadLinkLockerUrl, setCPALeadLinkLockerUrl] = useState('');
  const [cpaleadFileLockerUrl, setCPALeadFileLockerUrl] = useState('');
  const [cpaleadQuizUrl, setCPALeadQuizUrl] = useState('');
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
  
  // Additional quiz/survey sources (for future expansion)
  const [quizSources, setQuizSources] = useState([]);
  const [surveySources, setSurveySources] = useState([]);
  const [videoSources, setVideoSources] = useState([]);
  const [appSources, setAppSources] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
    
    // Load settings from Firestore (primary source) with localStorage fallback
    const loadSettings = async () => {
      const settingsResult = await getAdminSettings();
      if (settingsResult.success && settingsResult.settings) {
        const settings = settingsResult.settings;
        // Load from Firestore - these are global settings available to all users
        setOffertoroApiKey(settings.offertoroApiKey || '');
        setInstantNetwork(settings.instantNetwork || '');
        setInstantNetworkApiKey(settings.instantNetworkApiKey || '');
        setCPALeadPublisherId(settings.cpaleadPublisherId || '');
        setCPALeadLinkLockerUrl(settings.cpaleadLinkLockerUrl || '');
        setCPALeadFileLockerUrl(settings.cpaleadFileLockerUrl || '');
        setCPALeadQuizUrl(settings.cpaleadQuizUrl || '');
        
        // Load additional sources for categories
        setQuizSources(settings.quizzes || []);
        setSurveySources(settings.surveys || []);
        setVideoSources(settings.videos || []);
        setAppSources(settings.apps || []);
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
    setCPALeadPublisherId(savedCPALeadId);
    setCPALeadLinkLockerUrl(savedLinkLocker);
    setCPALeadFileLockerUrl(savedFileLocker);
    setCPALeadQuizUrl(savedQuiz);
      }
    };
    
    loadSettings();
    
    // Subscribe to real-time updates so all users see changes immediately
    const unsubscribe = subscribeToAdminSettings((settings) => {
      if (settings) {
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
        setQuizSources(settings.quizzes || []);
        setSurveySources(settings.surveys || []);
        setVideoSources(settings.videos || []);
        setAppSources(settings.apps || []);
      }
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const loadTasks = async (skipLoadingState = false) => {
    if (!skipLoadingState) {
      setLoading(true);
    }
    try {
      // Get available tasks (all active offers)
      const offersResult = await getActiveOffers();
      
      // Get ongoing tasks for this user (only if user exists)
      let ongoingResult = { success: false, tasks: [] };
      if (user && user.uid) {
        ongoingResult = await getUserOngoingTasks(user.uid);
      }
      
      if (ongoingResult.success) {
        setOngoingTasks(ongoingResult.tasks);
        
        // Filter out tasks that are already ongoing
        if (offersResult.success) {
          const ongoingOfferIds = new Set(ongoingResult.tasks.map(t => t.offerId));
          const available = offersResult.offers.filter(offer => !ongoingOfferIds.has(offer.id));
          setAvailableTasks(available);
        } else {
          setAvailableTasks([]);
        }
      } else {
        if (offersResult.success) {
          setAvailableTasks(offersResult.offers);
        } else {
          setAvailableTasks([]);
        }
        setOngoingTasks([]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      try {
        const offersResult = await getActiveOffers();
        if (offersResult.success) {
          setAvailableTasks(offersResult.offers);
        }
      } catch (e) {
        console.error('Error loading offers:', e);
        setAvailableTasks([]); // Ensure it's always an array
      }
    } finally {
      if (!skipLoadingState) {
        setLoading(false);
      }
    }
  };

  // Enhanced completion handler that immediately refreshes data
  const handleTaskComplete = async (completionData) => {
    console.log('✅ Task/Quiz/Survey/Video completed:', completionData);
    
    // Verify completion before proceeding - ensure task is actually completed
    if (!completionData || completionData.success === false) {
      console.warn('⚠️ Task completion verification failed:', completionData);
      return;
    }

    // Verify reward points are valid
    const reward = completionData.reward || completionData.points || 0;
    if (reward <= 0) {
      console.warn('⚠️ Invalid reward points:', reward);
      return;
    }

    // Immediately refresh tasks to show updated state
    await loadTasks(true); // Skip loading state to avoid UI flicker
    
    console.log(`✅ Points awarded! User earned ${reward} points`);
  };

  // Helper function to check if a category has any items
  // CPAlead offerwall, link locker, and file locker are disabled for now
  const hasCategoryItems = (category) => {
    // Safety check: ensure availableTasks is an array
    const safeAvailableTasks = Array.isArray(availableTasks) ? availableTasks : [];
    
    // Manual tasks disabled - removed categoryOffers filtering
    
    switch (category) {
      case 'quizzes':
        return cpaleadQuizUrl || (Array.isArray(quizSources) && quizSources.length > 0);
      case 'surveys':
        // CPAlead offerwall disabled - removed cpaleadPublisherId
        return instantNetwork || offertoroApiKey || (cpxResearchApiKey || cpxResearchOfferwallUrl) || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || (Array.isArray(surveySources) && surveySources.length > 0);
      case 'videos':
        // CPAlead offerwall disabled - removed cpaleadPublisherId
        return instantNetwork || offertoroApiKey || (ayetStudiosApiKey || ayetStudiosOfferwallUrl) || (hideoutTvApiKey || hideoutTvOfferwallUrl) || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || (Array.isArray(videoSources) && videoSources.length > 0);
      case 'apps':
        return cpaleadPublisherId || instantNetwork || offertoroApiKey || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || (Array.isArray(appSources) && appSources.length > 0);
      case 'all':
        return true;
      default:
        return false;
    }
  };

  // Safety check: ensure user exists
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view tasks.</p>
        </div>
      </div>
    );
  }

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

      {/* Category Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          <CategoryTab
            icon={HelpCircle}
            label="All Tasks"
            category="all"
            activeCategory={activeCategory}
            onClick={() => setActiveCategory('all')}
            count={null}
          />
          <CategoryTab
            icon={FileText}
            label="Quizzes"
            category="quizzes"
            activeCategory={activeCategory}
            onClick={() => setActiveCategory('quizzes')}
            count={(cpaleadQuizUrl ? 1 : 0) + (Array.isArray(quizSources) ? quizSources.length : 0)}
            hasItems={hasCategoryItems('quizzes')}
          />
          <CategoryTab
            icon={HelpCircle}
            label="Surveys"
            category="surveys"
            activeCategory={activeCategory}
            onClick={() => setActiveCategory('surveys')}
            count={null}
            hasItems={hasCategoryItems('surveys')}
          />
          <CategoryTab
            icon={PlayCircle}
            label="Watch Videos"
            category="videos"
            activeCategory={activeCategory}
            onClick={() => setActiveCategory('videos')}
            count={null}
            hasItems={hasCategoryItems('videos')}
          />
          <CategoryTab
            icon={Smartphone}
            label="Install Apps"
            category="apps"
            activeCategory={activeCategory}
            onClick={() => setActiveCategory('apps')}
            count={null}
            hasItems={hasCategoryItems('apps')}
          />
        </div>
      </div>

      {/* Category Content */}
      {(activeCategory === 'all' || activeCategory === 'quizzes') && (
        <QuizzesCategory
          cpaleadQuizUrl={cpaleadQuizUrl}
          quizSources={quizSources}
          userId={user.uid}
          user={user}
          availableTasks={availableTasks}
          showCPALeadQuiz={showCPALeadQuiz}
          setShowCPALeadQuiz={setShowCPALeadQuiz}
          onComplete={handleTaskComplete}
        />
      )}

      {(activeCategory === 'all' || activeCategory === 'surveys') && (
        <SurveysCategory
          cpaleadPublisherId={cpaleadPublisherId}
          instantNetwork={instantNetwork}
          instantNetworkApiKey={instantNetworkApiKey}
          offertoroApiKey={offertoroApiKey}
          cpxResearchApiKey={cpxResearchApiKey}
          cpxResearchOfferwallUrl={cpxResearchOfferwallUrl}
          lootablyApiKey={lootablyApiKey}
          lootablyOfferwallUrl={lootablyOfferwallUrl}
          adgemApiKey={adgemApiKey}
          adgemOfferwallUrl={adgemOfferwallUrl}
          surveySources={surveySources}
          availableTasks={availableTasks}
          userId={user.uid}
          user={user}
          showCPALead={showCPALead}
          setShowCPALead={setShowCPALead}
          showInstantNetwork={showInstantNetwork}
          setShowInstantNetwork={setShowInstantNetwork}
          showOfferToro={showOfferToro}
          setShowOfferToro={setShowOfferToro}
          showCPXResearch={showCPXResearch}
          setShowCPXResearch={setShowCPXResearch}
          showLootably={showLootably}
          setShowLootably={setShowLootably}
          showAdGem={showAdGem}
          setShowAdGem={setShowAdGem}
          onComplete={handleTaskComplete}
        />
      )}

      {(activeCategory === 'all' || activeCategory === 'videos') && (
        <VideosCategory
          cpaleadPublisherId={cpaleadPublisherId}
          instantNetwork={instantNetwork}
          instantNetworkApiKey={instantNetworkApiKey}
          offertoroApiKey={offertoroApiKey}
          ayetStudiosApiKey={ayetStudiosApiKey}
          ayetStudiosOfferwallUrl={ayetStudiosOfferwallUrl}
          hideoutTvApiKey={hideoutTvApiKey}
          hideoutTvOfferwallUrl={hideoutTvOfferwallUrl}
          lootablyApiKey={lootablyApiKey}
          lootablyOfferwallUrl={lootablyOfferwallUrl}
          adgemApiKey={adgemApiKey}
          adgemOfferwallUrl={adgemOfferwallUrl}
          videoSources={videoSources}
          availableTasks={availableTasks}
          userId={user.uid}
          showCPALead={showCPALead}
          setShowCPALead={setShowCPALead}
          showInstantNetwork={showInstantNetwork}
          setShowInstantNetwork={setShowInstantNetwork}
          showOfferToro={showOfferToro}
          setShowOfferToro={setShowOfferToro}
          showAyetStudios={showAyetStudios}
          setShowAyetStudios={setShowAyetStudios}
          showHideoutTv={showHideoutTv}
          setShowHideoutTv={setShowHideoutTv}
          showLootably={showLootably}
          setShowLootably={setShowLootably}
          showAdGem={showAdGem}
          setShowAdGem={setShowAdGem}
          onComplete={handleTaskComplete}
        />
      )}

      {(activeCategory === 'all' || activeCategory === 'apps') && (
        <AppsCategory
          cpaleadPublisherId={cpaleadPublisherId}
          instantNetwork={instantNetwork}
          instantNetworkApiKey={instantNetworkApiKey}
          offertoroApiKey={offertoroApiKey}
          lootablyApiKey={lootablyApiKey}
          lootablyOfferwallUrl={lootablyOfferwallUrl}
          adgemApiKey={adgemApiKey}
          adgemOfferwallUrl={adgemOfferwallUrl}
          appSources={appSources}
          availableTasks={availableTasks}
          userId={user.uid}
          showCPALead={showCPALead}
          setShowCPALead={setShowCPALead}
          showInstantNetwork={showInstantNetwork}
          setShowInstantNetwork={setShowInstantNetwork}
          showOfferToro={showOfferToro}
          setShowOfferToro={setShowOfferToro}
          showLootably={showLootably}
          setShowLootably={setShowLootably}
          showAdGem={showAdGem}
          setShowAdGem={setShowAdGem}
          onComplete={handleTaskComplete}
        />
      )}

      {/* Manual Tasks / External Offers with Referral Links - DISABLED */}
      {false && Array.isArray(availableTasks) && availableTasks.length > 0 && (
        <div className="card mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Gift className="w-6 h-6 mr-2 text-purple-600" />
            Manual Tasks
            <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
              {availableTasks.length}
            </span>
          </h2>
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
        </div>
      )}
    </div>
  );
}

// Category Tab Component
function CategoryTab({ icon: Icon, label, category, activeCategory, onClick, count, hasItems = true }) {
  if (!hasItems && category !== 'all') return null;
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
        activeCategory === category
          ? 'bg-purple-600 text-white shadow-lg transform scale-105'
          : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-2 border-gray-200 hover:border-purple-300'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {count !== null && count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          activeCategory === category ? 'bg-white text-purple-600' : 'bg-purple-100 text-purple-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Quizzes Category Component
function QuizzesCategory({ cpaleadQuizUrl, quizSources, userId, user, showCPALeadQuiz, setShowCPALeadQuiz, availableTasks = [], onComplete }) {
  // Manual tasks disabled - removed quizOffers
  const safeQuizSources = Array.isArray(quizSources) ? quizSources : [];
  const hasQuizzes = cpaleadQuizUrl || safeQuizSources.length > 0;
  
  if (!hasQuizzes) {
    return (
      <div className="card mb-8">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No quizzes available. Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* CPAlead Quiz */}
      {cpaleadQuizUrl && (
        <div className="card border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                <FileText className="w-6 h-6 mr-2 text-purple-600" />
                CPAlead Quiz
              </h2>
            </div>
            <button
              onClick={() => setShowCPALeadQuiz(!showCPALeadQuiz)}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center ml-4"
            >
              {showCPALeadQuiz ? 'Hide' : 'Start Quiz'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showCPALeadQuiz && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <CPALeadQuiz
                key={`quiz-${Date.now()}-${Math.random()}`}
                quizUrl={cpaleadQuizUrl}
                userId={userId}
                onComplete={async (data) => {
                  console.log('Quiz completion callback:', data);
                  
                  // Verify completion before proceeding
                  if (data && data.success !== false && data.reward) {
                    // Points are already awarded by CPALeadQuiz component
                    await handleTaskComplete(data);
                    
                    // Force component refresh to show new quiz after a delay
                    setTimeout(() => {
                      setShowCPALeadQuiz(false);
                      setTimeout(() => {
                        setShowCPALeadQuiz(true);
                      }, 200);
                    }, 2000);
                  }
                }}
              />
            </div>
          )}
        </div>
      )}


      {/* Manual Quiz Offers / External Offers with Referral Links - DISABLED */}
      {false && Array.isArray(availableTasks) && availableTasks
        .filter(offer => offer && (offer.category === 'quiz' || offer.category === 'quizzes'))
        .map((task) => (
          <div key={task.id} className="card border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                  <FileText className="w-6 h-6 mr-2 text-purple-600" />
                  {task.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                {task.isAffiliate && (
                  <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-semibold">
                    💰 Affiliate Link
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{task.rewardPoints}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
                <button
                  onClick={async () => {
                    const result = await startTask(userId, task.id, {
                      title: task.title,
                      description: task.description,
                      link: task.link,
                      rewardPoints: task.rewardPoints,
                    });
                    if (result.success) {
                      if (task.link) {
                        window.open(task.link, '_blank', 'noopener,noreferrer');
                      }
                      onComplete();
                      alert('Task started! Complete it to earn rewards.');
                    } else {
                      alert('Failed to start task: ' + result.error);
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center"
                >
                  Start Quiz
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* Additional Quiz Sources */}
      {quizSources.map((source, index) => (
        <div key={index} className="card border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                {source.name || `${source.source} Quiz`}
              </h2>
            </div>
            <button
              onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center ml-4"
            >
              Start Quiz
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          </div>
            ))}
          </div>
  );
}

// Surveys Category Component
function SurveysCategory({
  cpaleadPublisherId,
  instantNetwork,
  instantNetworkApiKey,
  offertoroApiKey,
  cpxResearchApiKey,
  cpxResearchOfferwallUrl,
  lootablyApiKey,
  lootablyOfferwallUrl,
  adgemApiKey,
  adgemOfferwallUrl,
  surveySources = [],
  availableTasks = [],
  userId,
  user,
  showCPALead,
  setShowCPALead,
  showInstantNetwork,
  setShowInstantNetwork,
  showOfferToro,
  setShowOfferToro,
  showCPXResearch,
  setShowCPXResearch,
  showLootably,
  setShowLootably,
  showAdGem,
  setShowAdGem,
  onComplete
}) {
      // Safety checks
      const safeSurveySources = Array.isArray(surveySources) ? surveySources : [];
      // Manual tasks disabled - removed surveyOffers
      
      // CPAlead offerwall disabled - removed cpaleadPublisherId
      const hasSurveys = (instantNetwork && instantNetworkApiKey) || offertoroApiKey || (cpxResearchApiKey || cpxResearchOfferwallUrl) || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || safeSurveySources.length > 0;

  if (!hasSurveys) {
    return (
      <div className="card mb-8">
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No surveys available. Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* CPAlead Offerwall (contains surveys) - DISABLED */}
      {false && cpaleadPublisherId && (
        <div className="card border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
              CPAlead Surveys
            </h2>
            <button
              onClick={() => setShowCPALead(!showCPALead)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showCPALead ? 'Hide' : 'View Surveys'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showCPALead && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <CPALeadOfferwall
                publisherId={cpaleadPublisherId}
                userId={userId}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* Instant Network (contains surveys) */}
      {instantNetwork && instantNetworkApiKey && instantNetwork !== 'offerwallme' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-green-600" />
              {instantNetwork === 'offerwallme' && 'Offerwall.me'}
              {instantNetwork === 'offerwallpro' && 'Offerwall PRO'}
              {instantNetwork === 'bitlabs' && 'Bitlabs'}
              {instantNetwork === 'adgatemedia' && 'AdGate Media'}
              {' '}Surveys
            </h2>
            <button
              onClick={() => setShowInstantNetwork(!showInstantNetwork)}
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center"
            >
              {showInstantNetwork ? 'Hide' : 'View Surveys'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showInstantNetwork && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <InstantNetworkOfferwall
                network={instantNetwork}
                apiKey={instantNetworkApiKey}
                userId={userId}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* OfferToro (contains surveys) */}
      {offertoroApiKey && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-purple-600" />
              OfferToro Surveys
            </h2>
            <button
              onClick={() => setShowOfferToro(!showOfferToro)}
              className="btn-primary flex items-center"
            >
              {showOfferToro ? 'Hide' : 'View Surveys'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showOfferToro && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <OfferToroOfferwall
                apiKey={offertoroApiKey}
                userId={userId}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* CPX Research (High-Paying Surveys) */}
      {(cpxResearchApiKey || cpxResearchOfferwallUrl) && (
        <div className="card border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                <HelpCircle className="w-6 h-6 mr-2 text-indigo-600" />
                CPX Research Surveys
              </h2>
            </div>
            <button
              onClick={() => setShowCPXResearch(!showCPXResearch)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg flex items-center ml-4"
            >
              {showCPXResearch ? 'Hide' : 'Start Surveys'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showCPXResearch && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <CPXResearchQuiz
                apiKey={cpxResearchApiKey}
                userId={userId}
                user={user}
                offerwallUrl={cpxResearchOfferwallUrl}
                secureHashKey={null}
                onComplete={(data) => {
                  if (data.success) onComplete();
                  else {
                    alert(`Survey completed! Reward: ${data.reward || 0} points`);
                    onComplete();
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Lootably (Surveys, Apps, Videos) */}
      {(lootablyApiKey || lootablyOfferwallUrl) && (
        <div className="card border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
                Lootably Surveys
              </h2>
            </div>
            <button
              onClick={() => setShowLootably(!showLootably)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2 px-4 rounded-lg flex items-center ml-4"
            >
              {showLootably ? 'Hide' : 'View Surveys'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showLootably && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <LootablyOfferwall
                apiKey={lootablyApiKey}
                userId={userId}
                offerwallUrl={lootablyOfferwallUrl}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* AdGem (Surveys, Apps, Videos) */}
      {(adgemApiKey || adgemOfferwallUrl) && (
        <div className="card border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                <HelpCircle className="w-6 h-6 mr-2 text-green-600" />
                AdGem Surveys
              </h2>
            </div>
            <button
              onClick={() => setShowAdGem(!showAdGem)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-lg flex items-center ml-4"
            >
              {showAdGem ? 'Hide' : 'View Surveys'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showAdGem && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <AdGemOfferwall
                apiKey={adgemApiKey}
                userId={userId}
                offerwallUrl={adgemOfferwallUrl}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* Manual Survey Offers / External Offers - DISABLED */}
      {false && Array.isArray(availableTasks) && availableTasks
        .filter(offer => offer && (offer.category === 'survey' || offer.category === 'surveys'))
        .map((task) => (
          <div key={task.id} className="card border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                  <HelpCircle className="w-6 h-6 mr-2 text-green-600" />
                  {task.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                {task.isAffiliate && (
                  <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-semibold">
                    💰 Affiliate Link
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{task.rewardPoints}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
                <button
                  onClick={async () => {
                    const result = await startTask(userId, task.id, {
                      title: task.title,
                      description: task.description,
                      link: task.link,
                      rewardPoints: task.rewardPoints,
                    });
                    if (result.success) {
                      if (task.link) {
                        window.open(task.link, '_blank', 'noopener,noreferrer');
                      }
                      onComplete();
                      alert('Task started! Complete it to earn rewards.');
                    } else {
                      alert('Failed to start task: ' + result.error);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center"
                >
                  Start Survey
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* Additional Survey Sources */}
      {surveySources.map((source, index) => (
        <div key={index} className="card border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-green-600" />
              {source.name || `${source.source} Surveys`}
            </h2>
            <button
              onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              View Surveys
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          </div>
            ))}
          </div>
  );
}

// Videos Category Component
function VideosCategory({
  cpaleadPublisherId,
  instantNetwork,
  instantNetworkApiKey,
  offertoroApiKey,
  ayetStudiosApiKey,
  ayetStudiosOfferwallUrl,
  hideoutTvApiKey,
  hideoutTvOfferwallUrl,
  lootablyApiKey,
  lootablyOfferwallUrl,
  adgemApiKey,
  adgemOfferwallUrl,
  videoSources = [],
  availableTasks = [],
  userId,
  showCPALead,
  setShowCPALead,
  showInstantNetwork,
  setShowInstantNetwork,
  showOfferToro,
  setShowOfferToro,
  showAyetStudios,
  setShowAyetStudios,
  showHideoutTv,
  setShowHideoutTv,
  showLootably,
  setShowLootably,
  showAdGem,
  setShowAdGem,
  onComplete
}) {
      // Safety checks
      const safeVideoSources = Array.isArray(videoSources) ? videoSources : [];
      // Manual tasks disabled - removed videoOffers
      
      // CPAlead offerwall disabled - removed cpaleadPublisherId
      const hasVideos = (instantNetwork && instantNetworkApiKey) || offertoroApiKey || (ayetStudiosApiKey || ayetStudiosOfferwallUrl) || (hideoutTvApiKey || hideoutTvOfferwallUrl) || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || safeVideoSources.length > 0;

  if (!hasVideos) {
    return (
      <div className="card mb-8">
        <div className="text-center py-12">
          <PlayCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No video tasks available. Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* CPAlead Offerwall (contains videos) - DISABLED */}
      {false && cpaleadPublisherId && (
        <div className="card border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <PlayCircle className="w-6 h-6 mr-2 text-red-600" />
              CPAlead Video Tasks
            </h2>
            <button
              onClick={() => setShowCPALead(!showCPALead)}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showCPALead ? 'Hide' : 'View Videos'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showCPALead && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <CPALeadOfferwall
                publisherId={cpaleadPublisherId}
                userId={userId}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* Instant Network (contains videos) */}
      {instantNetwork && instantNetworkApiKey && instantNetwork !== 'offerwallme' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <PlayCircle className="w-6 h-6 mr-2 text-red-600" />
              {instantNetwork === 'offerwallme' && 'Offerwall.me'}
              {instantNetwork === 'offerwallpro' && 'Offerwall PRO'}
              {instantNetwork === 'bitlabs' && 'Bitlabs'}
              {instantNetwork === 'adgatemedia' && 'AdGate Media'}
              {' '}Video Tasks
            </h2>
            <button
              onClick={() => setShowInstantNetwork(!showInstantNetwork)}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center"
            >
              {showInstantNetwork ? 'Hide' : 'View Videos'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showInstantNetwork && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <InstantNetworkOfferwall
                network={instantNetwork}
                apiKey={instantNetworkApiKey}
                userId={userId}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* Ayet Studios (Video-focused) */}
      {(ayetStudiosApiKey || ayetStudiosOfferwallUrl) && (
        <div className="card border-2 border-red-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <PlayCircle className="w-6 h-6 mr-2 text-red-600" />
              Ayet Studios Videos
            </h2>
            <button
              onClick={() => setShowAyetStudios(!showAyetStudios)}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showAyetStudios ? 'Hide' : 'Watch Videos'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showAyetStudios && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <AyetStudiosOfferwall
                apiKey={ayetStudiosApiKey}
                userId={userId}
                offerwallUrl={ayetStudiosOfferwallUrl}
                onComplete={(data) => {
                  if (data.success) onComplete();
                  else {
                    alert(`Video completed! Reward: ${data.reward || 0} points`);
                    onComplete();
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Hideout.tv (Video-focused) */}
      {(hideoutTvApiKey || hideoutTvOfferwallUrl) && (
        <div className="card border-2 border-pink-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <PlayCircle className="w-6 h-6 mr-2 text-pink-600" />
              Hideout.tv Videos
            </h2>
            <button
              onClick={() => setShowHideoutTv(!showHideoutTv)}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showHideoutTv ? 'Hide' : 'Watch Videos'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showHideoutTv && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <HideoutTvOfferwall
                apiKey={hideoutTvApiKey}
                userId={userId}
                offerwallUrl={hideoutTvOfferwallUrl}
                onComplete={(data) => {
                  if (data.success) onComplete();
                  else {
                    alert(`Video completed! Reward: ${data.reward || 0} points`);
                    onComplete();
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Lootably (contains videos) */}
      {(lootablyApiKey || lootablyOfferwallUrl) && (
        <div className="card border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <PlayCircle className="w-6 h-6 mr-2 text-blue-600" />
              Lootably Videos
            </h2>
            <button
              onClick={() => setShowLootably(!showLootably)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showLootably ? 'Hide' : 'Watch Videos'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showLootably && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <LootablyOfferwall
                apiKey={lootablyApiKey}
                userId={userId}
                offerwallUrl={lootablyOfferwallUrl}
                onComplete={(data) => {
                  if (data.success) onComplete();
                  else {
                    alert(`Video completed! Reward: ${data.reward || 0} points`);
                    onComplete();
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* AdGem (contains videos) */}
      {(adgemApiKey || adgemOfferwallUrl) && (
        <div className="card border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <PlayCircle className="w-6 h-6 mr-2 text-green-600" />
              AdGem Videos
            </h2>
            <button
              onClick={() => setShowAdGem(!showAdGem)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showAdGem ? 'Hide' : 'Watch Videos'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showAdGem && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <AdGemOfferwall
                apiKey={adgemApiKey}
                userId={userId}
                offerwallUrl={adgemOfferwallUrl}
                onComplete={(data) => {
                  if (data.success) onComplete();
                  else {
                    alert(`Video completed! Reward: ${data.reward || 0} points`);
                    onComplete();
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* OfferToro (contains videos) */}
      {offertoroApiKey && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <PlayCircle className="w-6 h-6 mr-2 text-red-600" />
              OfferToro Video Tasks
            </h2>
            <button
              onClick={() => setShowOfferToro(!showOfferToro)}
              className="btn-primary flex items-center"
            >
              {showOfferToro ? 'Hide' : 'View Videos'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showOfferToro && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <OfferToroOfferwall
                apiKey={offertoroApiKey}
                userId={userId}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* Manual Video Offers / External Offers - DISABLED */}
      {false && Array.isArray(availableTasks) && availableTasks
        .filter(offer => offer && (offer.category === 'video' || offer.category === 'videos'))
        .map((task) => (
          <div key={task.id} className="card border-2 border-red-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                  <PlayCircle className="w-6 h-6 mr-2 text-red-600" />
                  {task.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                {task.isAffiliate && (
                  <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-semibold">
                    💰 Affiliate Link
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{task.rewardPoints}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
                <button
                  onClick={async () => {
                    const result = await startTask(userId, task.id, {
                      title: task.title,
                      description: task.description,
                      link: task.link,
                      rewardPoints: task.rewardPoints,
                    });
                    if (result.success) {
                      if (task.link) {
                        window.open(task.link, '_blank', 'noopener,noreferrer');
                      }
                      onComplete();
                      alert('Task started! Complete it to earn rewards.');
                    } else {
                      alert('Failed to start task: ' + result.error);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center"
                >
                  Watch Video
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* Additional Video Sources */}
      {videoSources.map((source, index) => (
        <div key={index} className="card border-2 border-red-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <PlayCircle className="w-6 h-6 mr-2 text-red-600" />
              {source.name || `${source.source} Videos`}
            </h2>
            <button
              onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              View Videos
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Apps Category Component
function AppsCategory({
  cpaleadPublisherId,
  instantNetwork,
  instantNetworkApiKey,
  offertoroApiKey,
  lootablyApiKey,
  lootablyOfferwallUrl,
  adgemApiKey,
  adgemOfferwallUrl,
  appSources = [],
  availableTasks = [],
  userId,
  showCPALead,
  setShowCPALead,
  showInstantNetwork,
  setShowInstantNetwork,
  showOfferToro,
  setShowOfferToro,
  showLootably,
  setShowLootably,
  showAdGem,
  setShowAdGem,
  onComplete
}) {
      // Safety checks
      const safeAppSources = Array.isArray(appSources) ? appSources : [];
      // Manual tasks disabled - removed appOffers
      
      const hasApps = cpaleadPublisherId || (instantNetwork && instantNetworkApiKey) || offertoroApiKey || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || safeAppSources.length > 0;

  if (!hasApps) {
    return (
      <div className="card mb-8">
        <div className="text-center py-12">
          <Smartphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No app installation tasks available. Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* CPAlead Offerwall (contains apps) */}
      {cpaleadPublisherId && (
        <div className="card border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-indigo-600" />
              CPAlead App Tasks
            </h2>
            <button
              onClick={() => setShowCPALead(!showCPALead)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showCPALead ? 'Hide' : 'View Apps'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showCPALead && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <CPALeadOfferwall
                publisherId={cpaleadPublisherId}
                userId={userId}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* Instant Network (contains apps) */}
      {instantNetwork && instantNetworkApiKey && instantNetwork !== 'offerwallme' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-indigo-600" />
              {instantNetwork === 'offerwallme' && 'Offerwall.me'}
              {instantNetwork === 'offerwallpro' && 'Offerwall PRO'}
              {instantNetwork === 'bitlabs' && 'Bitlabs'}
              {instantNetwork === 'adgatemedia' && 'AdGate Media'}
              {' '}App Tasks
            </h2>
            <button
              onClick={() => setShowInstantNetwork(!showInstantNetwork)}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center"
            >
              {showInstantNetwork ? 'Hide' : 'View Apps'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showInstantNetwork && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <InstantNetworkOfferwall
                network={instantNetwork}
                apiKey={instantNetworkApiKey}
                userId={userId}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* OfferToro (contains apps) */}
      {offertoroApiKey && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-indigo-600" />
              OfferToro App Tasks
            </h2>
            <button
              onClick={() => setShowOfferToro(!showOfferToro)}
              className="btn-primary flex items-center"
            >
              {showOfferToro ? 'Hide' : 'View Apps'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showOfferToro && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <OfferToroOfferwall
                apiKey={offertoroApiKey}
                userId={userId}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* Lootably (contains apps) */}
      {(lootablyApiKey || lootablyOfferwallUrl) && (
        <div className="card border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-blue-600" />
              Lootably App Tasks
            </h2>
            <button
              onClick={() => setShowLootably(!showLootably)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showLootably ? 'Hide' : 'View Apps'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showLootably && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <LootablyOfferwall
                apiKey={lootablyApiKey}
                userId={userId}
                offerwallUrl={lootablyOfferwallUrl}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* AdGem (contains apps) */}
      {(adgemApiKey || adgemOfferwallUrl) && (
        <div className="card border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-green-600" />
              AdGem App Tasks
            </h2>
            <button
              onClick={() => setShowAdGem(!showAdGem)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              {showAdGem ? 'Hide' : 'View Apps'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showAdGem && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <AdGemOfferwall
                apiKey={adgemApiKey}
                userId={userId}
                offerwallUrl={adgemOfferwallUrl}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* Manual App Offers / External Offers - DISABLED */}
      {false && Array.isArray(availableTasks) && availableTasks
        .filter(offer => offer && (offer.category === 'app' || offer.category === 'apps'))
        .map((task) => (
          <div key={task.id} className="card border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                  <Smartphone className="w-6 h-6 mr-2 text-indigo-600" />
                  {task.title}
                </h2>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                {task.isAffiliate && (
                  <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-semibold">
                    💰 Affiliate Link
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{task.rewardPoints}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
                <button
                  onClick={async () => {
                    const result = await startTask(userId, task.id, {
                      title: task.title,
                      description: task.description,
                      link: task.link,
                      rewardPoints: task.rewardPoints,
                    });
                    if (result.success) {
                      if (task.link) {
                        window.open(task.link, '_blank', 'noopener,noreferrer');
                      }
                      onComplete();
                      alert('Task started! Complete it to earn rewards.');
                    } else {
                      alert('Failed to start task: ' + result.error);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center"
                >
                  Install App
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* Additional App Sources */}
      {appSources.map((source, index) => (
        <div key={index} className="card border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-indigo-600" />
              {source.name || `${source.source} Apps`}
          </h2>
            <button
              onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              View Apps
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
            </div>
      ))}
    </div>
  );
}

function AvailableTaskCard({ task, userId, onStart }) {
  const handleStartTask = async () => {
    const result = await startTask(userId, task.id, {
      title: task.title,
      description: task.description,
      link: task.link,
      rewardPoints: task.rewardPoints,
    });

    if (result.success) {
      if (task.link) {
        window.open(task.link, '_blank', 'noopener,noreferrer');
      }
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
