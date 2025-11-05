import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveOffers, getUserOngoingTasks, startTask, getAdminSettings, subscribeToAdminSettings, subscribeToOffers } from '../firebase/firestore';
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
  const [activeCategory, setActiveCategory] = useState('all'); // 'games', 'quizzes', 'surveys', 'videos', 'apps', 'all'
  const [newTasksNotification, setNewTasksNotification] = useState(null);
  const previousTasksCountRef = useRef(0);
  
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
  const [cpaleadIndividualOffers, setCPALeadIndividualOffers] = useState([]);
  
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
        const loadedOffers = settings.cpaleadIndividualOffers || [];
        console.log('📋 Loading CPAlead Individual Offers from Firebase:', loadedOffers);
        setCPALeadIndividualOffers(loadedOffers);
        previousTasksCountRef.current = loadedOffers.length;
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
    
    // Subscribe to real-time updates for offers (from Firestore 'offers' collection)
    const unsubscribeOffers = subscribeToOffers((offers) => {
      console.log('🔄 Real-time offers update:', offers.length, 'offers');
      
      // Filter out tasks that are already ongoing
      if (user && user.uid) {
        getUserOngoingTasks(user.uid).then((ongoingResult) => {
          if (ongoingResult.success) {
            const ongoingOfferIds = new Set(ongoingResult.tasks.map(t => t.offerId));
            const available = offers.filter(offer => !ongoingOfferIds.has(offer.id));
            setAvailableTasks(available);
            setOngoingTasks(ongoingResult.tasks);
            
            // Show notification if new tasks are added
            if (previousTasksCountRef.current > 0 && available.length > previousTasksCountRef.current) {
              const newCount = available.length - previousTasksCountRef.current;
              setNewTasksNotification(`🎉 ${newCount} new task${newCount > 1 ? 's' : ''} available!`);
              setTimeout(() => setNewTasksNotification(null), 5000);
            }
            previousTasksCountRef.current = available.length;
          } else {
            setAvailableTasks(offers);
          }
        });
      } else {
        setAvailableTasks(offers);
        
        // Show notification if new tasks are added
        if (previousTasksCountRef.current > 0 && offers.length > previousTasksCountRef.current) {
          const newCount = offers.length - previousTasksCountRef.current;
          setNewTasksNotification(`🎉 ${newCount} new task${newCount > 1 ? 's' : ''} available!`);
          setTimeout(() => setNewTasksNotification(null), 5000);
        }
        previousTasksCountRef.current = offers.length;
      }
    });
    
    // Subscribe to real-time updates for admin settings (CPALead individual offers, etc.)
    const unsubscribeSettings = subscribeToAdminSettings((settings) => {
      if (settings) {
        console.log('🔄 Real-time admin settings update');
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
        const realtimeOffers = settings.cpaleadIndividualOffers || [];
        
        // Show notification if new individual offers are added
        if (previousTasksCountRef.current > 0 && realtimeOffers.length > previousTasksCountRef.current) {
          const newCount = realtimeOffers.length - previousTasksCountRef.current;
          setNewTasksNotification(`🎉 ${newCount} new offer${newCount > 1 ? 's' : ''} added!`);
          setTimeout(() => setNewTasksNotification(null), 5000);
        }
        
        console.log('📋 Real-time update - CPAlead Individual Offers:', realtimeOffers);
        setCPALeadIndividualOffers(realtimeOffers);
        previousTasksCountRef.current = realtimeOffers.length;
      }
    });
    
    return () => {
      if (unsubscribeOffers) unsubscribeOffers();
      if (unsubscribeSettings) unsubscribeSettings();
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
      case 'games':
        const hasGames = Array.isArray(cpaleadIndividualOffers) && cpaleadIndividualOffers.length > 0;
        console.log('🎮 hasCategoryItems(games):', hasGames, 'offers:', cpaleadIndividualOffers);
        return hasGames;
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

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (newTasksNotification) {
      const timer = setTimeout(() => setNewTasksNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [newTasksNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* New Tasks Notification */}
        {newTasksNotification && (
          <div className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between animate-slide-down">
            <span className="font-semibold">{newTasksNotification}</span>
            <button
              onClick={() => setNewTasksNotification(null)}
              className="ml-4 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Hero Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 p-2 hover:bg-white/50 rounded-lg transition-all duration-200 inline-flex items-center group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
            <span className="ml-2 text-gray-600 group-hover:text-purple-600 transition-colors">Back to Dashboard</span>
          </button>
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                <Gift className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Available Tasks
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Complete tasks, quizzes, surveys, and watch videos to earn points and cash rewards.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <CategoryTab
              icon={HelpCircle}
              label="All Tasks"
              category="all"
              activeCategory={activeCategory}
              onClick={() => setActiveCategory('all')}
              count={null}
            />
            <CategoryTab
              icon={Gift}
              label="Game Tasks"
              category="games"
              activeCategory={activeCategory}
              onClick={() => setActiveCategory('games')}
              count={Array.isArray(cpaleadIndividualOffers) ? cpaleadIndividualOffers.length : 0}
              hasItems={hasCategoryItems('games')}
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
      {(activeCategory === 'all' || activeCategory === 'games') && (
        <GameTasksCategory
          cpaleadIndividualOffers={cpaleadIndividualOffers}
        />
      )}

      {(activeCategory === 'all' || activeCategory === 'quizzes') && (
        <QuizzesCategory
          cpaleadQuizUrl={cpaleadQuizUrl}
          quizSources={quizSources}
          cpaleadIndividualOffers={cpaleadIndividualOffers.filter(o => o.category === 'quizzes' || o.category === 'all')}
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
          cpaleadIndividualOffers={cpaleadIndividualOffers.filter(o => o.category === 'surveys' || o.category === 'all')}
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
          cpaleadIndividualOffers={cpaleadIndividualOffers.filter(o => o.category === 'videos' || o.category === 'all')}
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
          cpaleadIndividualOffers={cpaleadIndividualOffers.filter(o => o.category === 'apps' || o.category === 'all')}
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
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 md:p-5 mt-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <Gift className="w-4 h-4 mr-2 text-purple-600" />
              Manual Tasks
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                {availableTasks.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
    </div>
  );
}

// Category Tab Component
function CategoryTab({ icon: Icon, label, category, activeCategory, onClick, count, hasItems = true }) {
  if (!hasItems && category !== 'all') return null;
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
        activeCategory === category
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white transform scale-105 shadow-xl'
          : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-2 border-gray-200 hover:border-purple-300 hover:scale-105'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {count !== null && count > 0 && (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          activeCategory === category ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-purple-100 text-purple-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Game Tasks Category Component
function GameTasksCategory({ cpaleadIndividualOffers = [] }) {
  const safeIndividualOffers = Array.isArray(cpaleadIndividualOffers) ? cpaleadIndividualOffers : [];
  
  console.log('🎮 GameTasksCategory - Received offers:', safeIndividualOffers);
  
  if (safeIndividualOffers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 md:p-5 mb-4">
        <div className="text-center py-8">
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-gray-100 p-4 rounded-lg">
              <Gift className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">No game tasks available</p>
          <p className="text-gray-400 text-xs">Add CPAlead offers in Admin Panel to see them here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      {/* All CPAlead Individual Offers */}
      {safeIndividualOffers.map((offer, index) => (
        <div key={offer.id || index} className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">{offer.name}</h2>
                <p className="text-sm text-gray-600">Complete this game offer to earn rewards!</p>
              </div>
            </div>
            <button
              onClick={() => window.open(offer.url, '_blank', 'noopener,noreferrer')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              Start Offer
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Quizzes Category Component
function QuizzesCategory({ cpaleadQuizUrl, quizSources, cpaleadIndividualOffers = [], userId, user, showCPALeadQuiz, setShowCPALeadQuiz, availableTasks = [], onComplete }) {
  // Manual tasks disabled - removed quizOffers
  const safeQuizSources = Array.isArray(quizSources) ? quizSources : [];
  const safeIndividualOffers = Array.isArray(cpaleadIndividualOffers) ? cpaleadIndividualOffers : [];
  const hasQuizzes = cpaleadQuizUrl || safeQuizSources.length > 0 || safeIndividualOffers.length > 0;
  
  if (!hasQuizzes) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 md:p-5 mb-4">
        <div className="text-center py-8">
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-gray-100 p-4 rounded-lg">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">No quizzes available</p>
          <p className="text-gray-400 text-xs">Check back later for new quiz opportunities!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      {/* CPAlead Quiz */}
      {cpaleadQuizUrl && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">CPAlead Quiz</h2>
                <p className="text-sm text-gray-600">Complete quizzes and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => setShowCPALeadQuiz(!showCPALeadQuiz)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              {showCPALeadQuiz ? 'Hide' : 'Start Quiz'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showCPALeadQuiz && (
            <div className="mt-6 border-t border-purple-200 pt-6">
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
          <div key={task.id} className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-800 flex items-center mb-1">
                  <FileText className="w-4 h-4 mr-2 text-purple-600" />
                  {task.title}
                </h2>
                <p className="text-xs text-gray-600 mb-1.5">{task.description}</p>
                {task.isAffiliate && (
                  <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full font-semibold">
                    💰 Affiliate Link
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">{task.rewardPoints}</div>
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
                  className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded-lg flex items-center text-xs"
                >
                  Start Quiz
                  <ExternalLink className="w-3 h-3 ml-1.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* Additional Quiz Sources */}
      {quizSources.map((source, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg mr-3">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">{source.name || `${source.source} Quiz`}</h2>
                <p className="text-sm text-gray-600">Complete this quiz to earn rewards!</p>
              </div>
            </div>
            <button
              onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              Start Quiz
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      ))}

      {/* CPAlead Individual Offers (Quizzes) */}
      {safeIndividualOffers.map((offer, index) => (
        <div key={offer.id || index} className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">{offer.name}</h2>
                <p className="text-sm text-gray-600">Complete this offer to earn rewards!</p>
              </div>
            </div>
            <button
              onClick={() => window.open(offer.url, '_blank', 'noopener,noreferrer')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              Start Offer
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
  cpaleadIndividualOffers = [],
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
      const safeIndividualOffers = Array.isArray(cpaleadIndividualOffers) ? cpaleadIndividualOffers : [];
      // Manual tasks disabled - removed surveyOffers
      
      // CPAlead offerwall disabled - removed cpaleadPublisherId
      const hasSurveys = (instantNetwork && instantNetworkApiKey) || offertoroApiKey || (cpxResearchApiKey || cpxResearchOfferwallUrl) || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || safeSurveySources.length > 0 || safeIndividualOffers.length > 0;

  if (!hasSurveys) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 md:p-5 mb-4">
        <div className="text-center py-8">
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-gray-100 p-4 rounded-lg">
              <HelpCircle className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">No surveys available</p>
          <p className="text-gray-400 text-xs">Check back later for new survey opportunities!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      {/* CPAlead Offerwall (contains surveys) - DISABLED */}
      {false && cpaleadPublisherId && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center">
              <HelpCircle className="w-4 h-4 mr-2 text-blue-600" />
              CPAlead Surveys
            </h2>
            <button
              onClick={() => setShowCPALead(!showCPALead)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-1.5 px-3 rounded-lg flex items-center text-xs"
            >
              {showCPALead ? 'Hide' : 'View Surveys'}
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </button>
          </div>
          {showCPALead && (
            <div className="mt-3 border rounded-lg overflow-hidden">
              <CPALeadOfferwall
                publisherId={cpaleadPublisherId}
                userId={userId}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* CPX Research (High-Paying Surveys) */}
      {(cpxResearchApiKey || cpxResearchOfferwallUrl) && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-indigo-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg mr-3">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">CPX Research Surveys</h2>
                <p className="text-sm text-gray-600">High-paying surveys available!</p>
              </div>
            </div>
            <button
              onClick={() => setShowCPXResearch(!showCPXResearch)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              {showCPXResearch ? 'Hide' : 'Start Surveys'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showCPXResearch && (
            <div className="mt-6 border-t border-indigo-200 pt-6">
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

      {/* Instant Network (contains surveys) */}
      {instantNetwork && instantNetworkApiKey && instantNetwork !== 'offerwallme' && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg mr-3">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">
                  {instantNetwork === 'offerwallme' && 'Offerwall.me'}
                  {instantNetwork === 'offerwallpro' && 'Offerwall PRO'}
                  {instantNetwork === 'bitlabs' && 'Bitlabs'}
                  {instantNetwork === 'adgatemedia' && 'AdGate Media'}
                  {' '}Surveys
                </h2>
                <p className="text-sm text-gray-600">
                  {instantNetwork === 'offerwallpro' ? 'Coming Soon' : 'Complete surveys and earn points!'}
                </p>
              </div>
            </div>
            {instantNetwork === 'offerwallpro' ? (
              <button
                disabled
                className="bg-gray-400 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg cursor-not-allowed flex-shrink-0 ml-4"
              >
                Coming Soon
              </button>
            ) : (
              <button
                onClick={() => setShowInstantNetwork(!showInstantNetwork)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
              >
                {showInstantNetwork ? 'Hide' : 'View Surveys'}
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
          {showInstantNetwork && instantNetwork !== 'offerwallpro' && (
            <div className="mt-6 border-t border-green-200 pt-6">
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
        <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">OfferToro Surveys</h2>
                <p className="text-sm text-gray-600">Complete surveys and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => setShowOfferToro(!showOfferToro)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              {showOfferToro ? 'Hide' : 'View Surveys'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showOfferToro && (
            <div className="mt-6 border-t border-purple-200 pt-6">
              <OfferToroOfferwall
                apiKey={offertoroApiKey}
                userId={userId}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* Lootably (Surveys, Apps, Videos) */}
      {(lootablyApiKey || lootablyOfferwallUrl) && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-800 flex items-center mb-1">
                <HelpCircle className="w-4 h-4 mr-2 text-blue-600" />
                Lootably Surveys
              </h2>
            </div>
            <button
              onClick={() => setShowLootably(!showLootably)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-1.5 px-3 rounded-lg flex items-center ml-3 text-xs"
            >
              {showLootably ? 'Hide' : 'View Surveys'}
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </button>
          </div>
          {showLootably && (
            <div className="mt-3 border rounded-lg overflow-hidden">
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
        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-800 flex items-center mb-1">
                <HelpCircle className="w-4 h-4 mr-2 text-green-600" />
                AdGem Surveys
              </h2>
            </div>
            <button
              onClick={() => setShowAdGem(!showAdGem)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-1.5 px-3 rounded-lg flex items-center ml-3 text-xs"
            >
              {showAdGem ? 'Hide' : 'View Surveys'}
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </button>
          </div>
          {showAdGem && (
            <div className="mt-3 border rounded-lg overflow-hidden">
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
          <div key={task.id} className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-4 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-800 flex items-center mb-1">
                  <HelpCircle className="w-4 h-4 mr-2 text-green-600" />
                  {task.title}
                </h2>
                <p className="text-xs text-gray-600 mb-1.5">{task.description}</p>
                {task.isAffiliate && (
                  <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full font-semibold">
                    💰 Affiliate Link
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{task.rewardPoints}</div>
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
                  className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg flex items-center text-xs"
                >
                  Start Survey
                  <ExternalLink className="w-3 h-3 ml-1.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* Additional Survey Sources */}
      {surveySources.map((source, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg mr-3">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">{source.name || `${source.source} Surveys`}</h2>
                <p className="text-sm text-gray-600">Complete surveys and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              View Surveys
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      ))}

      {/* CPAlead Individual Offers (Surveys) */}
      {safeIndividualOffers.map((offer, index) => (
        <div key={offer.id || index} className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">{offer.name}</h2>
                <p className="text-sm text-gray-600">Complete this offer to earn rewards!</p>
              </div>
            </div>
            <button
              onClick={() => window.open(offer.url, '_blank', 'noopener,noreferrer')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              Start Offer
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
  cpaleadIndividualOffers = [],
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
      const safeIndividualOffers = Array.isArray(cpaleadIndividualOffers) ? cpaleadIndividualOffers : [];
      // Manual tasks disabled - removed videoOffers
      
      // CPAlead offerwall disabled - removed cpaleadPublisherId
      const hasVideos = (instantNetwork && instantNetworkApiKey) || offertoroApiKey || (ayetStudiosApiKey || ayetStudiosOfferwallUrl) || (hideoutTvApiKey || hideoutTvOfferwallUrl) || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || safeVideoSources.length > 0 || safeIndividualOffers.length > 0;

  if (!hasVideos) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 md:p-5 mb-4">
        <div className="text-center py-8">
          <PlayCircle className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No video tasks available. Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      {/* CPAlead Offerwall (contains videos) - DISABLED */}
      {false && cpaleadPublisherId && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center">
              <PlayCircle className="w-4 h-4 mr-2 text-red-600" />
              CPAlead Video Tasks
            </h2>
            <button
              onClick={() => setShowCPALead(!showCPALead)}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-1.5 px-3 rounded-lg flex items-center text-xs"
            >
              {showCPALead ? 'Hide' : 'View Videos'}
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </button>
          </div>
          {showCPALead && (
            <div className="mt-3 border rounded-lg overflow-hidden">
              <CPALeadOfferwall
                publisherId={cpaleadPublisherId}
                userId={userId}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* Ayet Studios (Video-focused) */}
      {(ayetStudiosApiKey || ayetStudiosOfferwallUrl) && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-red-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-lg mr-3">
                <PlayCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">Ayet Studios Videos</h2>
                <p className="text-sm text-gray-600">Watch videos and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => setShowAyetStudios(!showAyetStudios)}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              {showAyetStudios ? 'Hide' : 'Watch Videos'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showAyetStudios && (
            <div className="mt-6 border-t border-red-200 pt-6">
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

      {/* Instant Network (contains videos) */}
      {instantNetwork && instantNetworkApiKey && instantNetwork !== 'offerwallme' && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-red-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-lg mr-3">
                <PlayCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">
                  {instantNetwork === 'offerwallme' && 'Offerwall.me'}
                  {instantNetwork === 'offerwallpro' && 'Offerwall PRO'}
                  {instantNetwork === 'bitlabs' && 'Bitlabs'}
                  {instantNetwork === 'adgatemedia' && 'AdGate Media'}
                  {' '}Video Tasks
                </h2>
                <p className="text-sm text-gray-600">
                  {instantNetwork === 'offerwallpro' ? 'Coming Soon' : 'Watch videos and earn points!'}
                </p>
              </div>
            </div>
            {instantNetwork === 'offerwallpro' ? (
              <button
                disabled
                className="bg-gray-400 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg cursor-not-allowed flex-shrink-0 ml-4"
              >
                Coming Soon
              </button>
            ) : (
              <button
                onClick={() => setShowInstantNetwork(!showInstantNetwork)}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
              >
                {showInstantNetwork ? 'Hide' : 'View Videos'}
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
          {showInstantNetwork && instantNetwork !== 'offerwallpro' && (
            <div className="mt-6 border-t border-red-200 pt-6">
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

      {/* Hideout.tv (Video-focused) */}
      {(hideoutTvApiKey || hideoutTvOfferwallUrl) && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-pink-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-2 rounded-lg mr-3">
                <PlayCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">Hideout.tv Videos</h2>
                <p className="text-sm text-gray-600">Watch videos and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => setShowHideoutTv(!showHideoutTv)}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              {showHideoutTv ? 'Hide' : 'Watch Videos'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showHideoutTv && (
            <div className="mt-6 border-t border-pink-200 pt-6">
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
        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg mr-3">
                <PlayCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">Lootably Videos</h2>
                <p className="text-sm text-gray-600">Watch videos and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => setShowLootably(!showLootably)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              {showLootably ? 'Hide' : 'Watch Videos'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showLootably && (
            <div className="mt-6 border-t border-blue-200 pt-6">
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
        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg mr-3">
                <PlayCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">AdGem Videos</h2>
                <p className="text-sm text-gray-600">Watch videos and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdGem(!showAdGem)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              {showAdGem ? 'Hide' : 'Watch Videos'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showAdGem && (
            <div className="mt-6 border-t border-green-200 pt-6">
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
        <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                <PlayCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">OfferToro Video Tasks</h2>
                <p className="text-sm text-gray-600">Watch videos and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => setShowOfferToro(!showOfferToro)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              {showOfferToro ? 'Hide' : 'View Videos'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showOfferToro && (
            <div className="mt-6 border-t border-purple-200 pt-6">
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
          <div key={task.id} className="bg-white rounded-lg shadow-lg border-2 border-red-200 p-4 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-800 flex items-center mb-1">
                  <PlayCircle className="w-4 h-4 mr-2 text-red-600" />
                  {task.title}
                </h2>
                <p className="text-xs text-gray-600 mb-1.5">{task.description}</p>
                {task.isAffiliate && (
                  <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full font-semibold">
                    💰 Affiliate Link
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">{task.rewardPoints}</div>
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
                  className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-lg flex items-center text-xs"
                >
                  Watch Video
                  <ExternalLink className="w-3 h-3 ml-1.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* Additional Video Sources */}
      {videoSources.map((source, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg border-2 border-red-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-lg mr-3">
                <PlayCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">{source.name || `${source.source} Videos`}</h2>
                <p className="text-sm text-gray-600">Watch videos and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              View Videos
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      ))}

      {/* CPAlead Individual Offers (Videos) */}
      {safeIndividualOffers.map((offer, index) => (
        <div key={offer.id || index} className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                <PlayCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">{offer.name}</h2>
                <p className="text-sm text-gray-600">Complete this offer to earn rewards!</p>
              </div>
            </div>
            <button
              onClick={() => window.open(offer.url, '_blank', 'noopener,noreferrer')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              Start Offer
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
  cpaleadIndividualOffers = [],
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
      const safeIndividualOffers = Array.isArray(cpaleadIndividualOffers) ? cpaleadIndividualOffers : [];
      // Manual tasks disabled - removed appOffers
      
      const hasApps = cpaleadPublisherId || (instantNetwork && instantNetworkApiKey) || offertoroApiKey || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || safeAppSources.length > 0 || safeIndividualOffers.length > 0;

  if (!hasApps) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 md:p-5 mb-4">
        <div className="text-center py-8">
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-gray-100 p-4 rounded-lg">
              <Smartphone className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">No app installation tasks available</p>
          <p className="text-gray-400 text-xs">Check back later for new app opportunities!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      {/* CPAlead Offerwall (contains apps) */}
      {cpaleadPublisherId && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">CPAlead App Tasks</h2>
                <p className="text-sm text-gray-600">Install apps and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => setShowCPALead(!showCPALead)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              {showCPALead ? 'Hide' : 'View Apps'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showCPALead && (
            <div className="mt-6 border-t border-purple-200 pt-6">
              {cpaleadPublisherId && userId ? (
                <CPALeadOfferwall
                  publisherId={cpaleadPublisherId}
                  userId={userId}
                  onComplete={handleTaskComplete}
                />
              ) : (
                <div className="p-4 text-center bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {!cpaleadPublisherId && '⚠️ CPAlead Publisher ID is not configured. Please add it in Admin Panel.'}
                    {!userId && '⚠️ User ID is missing. Please refresh the page.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instant Network (contains apps) */}
      {instantNetwork && instantNetworkApiKey && instantNetwork !== 'offerwallme' && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg mr-3">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">
                  {instantNetwork === 'offerwallme' && 'Offerwall.me'}
                  {instantNetwork === 'offerwallpro' && 'Offerwall PRO'}
                  {instantNetwork === 'bitlabs' && 'Bitlabs'}
                  {instantNetwork === 'adgatemedia' && 'AdGate Media'}
                  {' '}App Tasks
                </h2>
                <p className="text-sm text-gray-600">
                  {instantNetwork === 'offerwallpro' ? 'Coming Soon' : 'Install apps and earn points!'}
                </p>
              </div>
            </div>
            {instantNetwork === 'offerwallpro' ? (
              <button
                disabled
                className="bg-gray-400 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg cursor-not-allowed flex-shrink-0 ml-4"
              >
                Coming Soon
              </button>
            ) : (
              <button
                onClick={() => setShowInstantNetwork(!showInstantNetwork)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
              >
                {showInstantNetwork ? 'Hide' : 'View Apps'}
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
          {showInstantNetwork && instantNetwork !== 'offerwallpro' && (
            <div className="mt-6 border-t border-green-200 pt-6">
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
        <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">OfferToro App Tasks</h2>
                <p className="text-sm text-gray-600">Install apps and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => setShowOfferToro(!showOfferToro)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              {showOfferToro ? 'Hide' : 'View Apps'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showOfferToro && (
            <div className="mt-6 border-t border-purple-200 pt-6">
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
        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg mr-3">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">Lootably App Tasks</h2>
                <p className="text-sm text-gray-600">Install apps and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => setShowLootably(!showLootably)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              {showLootably ? 'Hide' : 'View Apps'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showLootably && (
            <div className="mt-6 border-t border-blue-200 pt-6">
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
        <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg mr-3">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">AdGem App Tasks</h2>
                <p className="text-sm text-gray-600">Install apps and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => setShowAdGem(!showAdGem)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              {showAdGem ? 'Hide' : 'View Apps'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
          {showAdGem && (
            <div className="mt-6 border-t border-green-200 pt-6">
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
          <div key={task.id} className="bg-white rounded-lg shadow-lg border-2 border-indigo-200 p-4 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-800 flex items-center mb-1">
                  <Smartphone className="w-4 h-4 mr-2 text-indigo-600" />
                  {task.title}
                </h2>
                <p className="text-xs text-gray-600 mb-1.5">{task.description}</p>
                {task.isAffiliate && (
                  <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full font-semibold">
                    💰 Affiliate Link
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-600">{task.rewardPoints}</div>
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3 rounded-lg flex items-center text-xs"
                >
                  Install App
                  <ExternalLink className="w-3 h-3 ml-1.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

      {/* Additional App Sources */}
      {appSources.map((source, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">{source.name || `${source.source} Apps`}</h2>
                <p className="text-sm text-gray-600">Install apps and earn points!</p>
              </div>
            </div>
            <button
              onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              View Apps
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      ))}

      {/* CPAlead Individual Offers (Apps) */}
      {safeIndividualOffers.map((offer, index) => (
        <div key={offer.id || index} className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">{offer.name}</h2>
                <p className="text-sm text-gray-600">Complete this offer to earn rewards!</p>
              </div>
            </div>
            <button
              onClick={() => window.open(offer.url, '_blank', 'noopener,noreferrer')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0 ml-4"
            >
              Start Offer
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
    <div className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 bg-white">
      <h3 className="text-sm font-semibold text-gray-800 mb-1.5">{task.title}</h3>
      <p className="text-gray-600 text-xs mb-3">{task.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-purple-600 font-bold text-sm">
          <Coins className="w-4 h-4 mr-1" />
          {task.rewardPoints} points
        </div>
        <button
          onClick={handleStartTask}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs py-1.5 px-3 rounded-lg"
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
    <div className="border-2 border-orange-200 rounded-lg p-3 bg-orange-50 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-1.5">
        <h3 className="text-sm font-semibold text-gray-800 flex-1">{task.taskTitle || 'Task'}</h3>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
          {task.status || 'Started'}
        </span>
      </div>
      <p className="text-gray-600 text-xs mb-3">{task.taskDescription || 'Complete this task to earn rewards'}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-orange-600 font-bold text-sm">
          <Coins className="w-4 h-4 mr-1" />
          {task.rewardPoints || 0} points
        </div>
        <button
          onClick={() => {
            if (task.taskLink) {
              window.open(task.taskLink, '_blank', 'noopener,noreferrer');
            }
          }}
          className="bg-orange-600 text-white py-1.5 px-3 rounded-lg hover:bg-orange-700 text-xs transition-colors"
        >
          Continue Task
        </button>
      </div>
    </div>
  );
}
