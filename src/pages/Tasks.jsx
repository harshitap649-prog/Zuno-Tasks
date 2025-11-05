import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveOffers, getUserOngoingTasks, startTask, getAdminSettings, subscribeToAdminSettings, subscribeToOffers, trackOfferClick, claimOfferPoints, checkOfferClaimed } from '../firebase/firestore';
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
  const [error, setError] = useState(null);
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

  const loadTasks = async (skipLoadingState = false) => {
    console.log('📋 loadTasks called, skipLoadingState:', skipLoadingState);
    if (!skipLoadingState) {
      setLoading(true);
    }
    try {
      // Get available tasks (all active offers)
      const offersResult = await getActiveOffers();
      console.log('📋 Offers result:', offersResult);
      
      // Get ongoing tasks for this user (only if user exists)
      let ongoingResult = { success: false, tasks: [] };
      if (user && user.uid) {
        try {
          ongoingResult = await getUserOngoingTasks(user.uid);
          console.log('📋 Ongoing tasks result:', ongoingResult);
        } catch (ongoingError) {
          console.error('Error getting ongoing tasks:', ongoingError);
          ongoingResult = { success: false, tasks: [] };
        }
      }
      
      if (ongoingResult.success) {
        setOngoingTasks(ongoingResult.tasks || []);
        
        // Filter out tasks that are already ongoing
        if (offersResult.success) {
          const ongoingOfferIds = new Set((ongoingResult.tasks || []).map(t => t.offerId));
          const available = (offersResult.offers || []).filter(offer => !ongoingOfferIds.has(offer.id));
          setAvailableTasks(available);
          console.log('📋 Set available tasks:', available.length);
        } else {
          setAvailableTasks([]);
        }
      } else {
        if (offersResult.success) {
          setAvailableTasks(offersResult.offers || []);
          console.log('📋 Set available tasks (no ongoing):', offersResult.offers?.length || 0);
        } else {
          setAvailableTasks([]);
        }
        setOngoingTasks([]);
      }
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      setAvailableTasks([]);
      setOngoingTasks([]);
      // Don't set error state - just show empty tasks
    } finally {
      if (!skipLoadingState) {
        console.log('📋 Setting loading to false');
        setLoading(false);
      }
    }
  };

  // Ensure activeCategory is 'all' when page loads
  useEffect(() => {
    console.log('📋 Setting activeCategory to "all" on page load');
    setActiveCategory('all');
  }, []);

  useEffect(() => {
    console.log('📋 Tasks page useEffect triggered, user:', user?.uid);
    console.log('📋 Active category:', activeCategory);
    
    let unsubscribeOffers = null;
    let unsubscribeSettings = null;
    let isMounted = true;
    let initTimeout = null;
    let maxLoadingTimeout = null;
    
    // Ensure loading is set to false after a maximum time, even if something fails
    maxLoadingTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ Maximum loading timeout reached, forcing page to render');
        setLoading(false);
      }
    }, 12000); // 12 second absolute maximum
    
    const initializePage = async () => {
      try {
        console.log('📋 Initializing Tasks page...');
        // Load tasks first - with timeout to prevent infinite loading
        if (isMounted) {
          let timeoutFired = false;
          initTimeout = setTimeout(() => {
            if (isMounted && !timeoutFired) {
              timeoutFired = true;
              console.warn('⚠️ Tasks page loading timeout, forcing load complete');
              setLoading(false);
            }
          }, 6000); // 6 second timeout
          
          try {
            await Promise.race([
              loadTasks(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Load timeout')), 5000))
            ]);
          } catch (loadError) {
            console.error('❌ Error in loadTasks:', loadError);
            // Continue anyway - we'll show empty state
            setLoading(false);
          }
          
          if (initTimeout && !timeoutFired) {
            clearTimeout(initTimeout);
            initTimeout = null;
          }
        }
        
        if (!isMounted) {
          console.log('📋 Component unmounted, stopping initialization');
          return;
        }
        
        console.log('📋 Tasks loaded, proceeding to load settings...');
    
    // Load settings from Firestore (primary source) with localStorage fallback
    const loadSettings = async () => {
          try {
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
              console.log('📋 Loading CPAlead Individual Offers from Firebase:', loadedOffers.length, 'offers');
              console.log('📋 Offers details:', JSON.stringify(loadedOffers, null, 2));
              if (Array.isArray(loadedOffers) && loadedOffers.length > 0) {
                console.log('📋 First offer sample:', loadedOffers[0]);
                console.log('📋 Offer categories:', loadedOffers.map(o => ({ name: o.name, category: o.category || 'none' })));
              }
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
          } catch (settingsError) {
            console.error('Error loading settings:', settingsError);
            // Continue with empty settings
          }
        };
        
        await loadSettings();
        
        if (!isMounted) return;
        
        // Subscribe to real-time updates for offers (from Firestore 'offers' collection)
        try {
          unsubscribeOffers = subscribeToOffers((offers) => {
            if (!isMounted) return;
            console.log('🔄 Real-time offers update:', offers.length, 'offers');
            
            // Filter out tasks that are already ongoing
            if (user && user.uid) {
              getUserOngoingTasks(user.uid).then((ongoingResult) => {
                if (!isMounted) return;
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
              }).catch(err => {
                console.error('Error getting ongoing tasks:', err);
                if (isMounted) setAvailableTasks(offers);
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
        } catch (offersError) {
          console.error('Error subscribing to offers:', offersError);
        }
        
        if (!isMounted) return;
        
        // Subscribe to real-time updates for admin settings (CPALead individual offers, etc.)
        try {
          unsubscribeSettings = subscribeToAdminSettings((settings) => {
            if (!isMounted) return;
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
              
              console.log('📋 Real-time update - CPAlead Individual Offers:', realtimeOffers.length, 'offers');
              console.log('📋 Real-time offers details:', JSON.stringify(realtimeOffers, null, 2));
              if (Array.isArray(realtimeOffers) && realtimeOffers.length > 0) {
                console.log('📋 First offer sample:', realtimeOffers[0]);
                console.log('📋 Offer structure:', {
                  hasId: !!realtimeOffers[0].id,
                  hasUrl: !!realtimeOffers[0].url,
                  hasName: !!realtimeOffers[0].name,
                  hasCategory: !!realtimeOffers[0].category,
                  category: realtimeOffers[0].category
                });
              }
              setCPALeadIndividualOffers(realtimeOffers);
              previousTasksCountRef.current = realtimeOffers.length;
            }
          });
        } catch (settingsError) {
          console.error('Error subscribing to admin settings:', settingsError);
      }
    } catch (error) {
        console.error('❌ Critical error in Tasks page initialization:', error);
        if (isMounted) {
          setLoading(false);
          setError(error.message || 'Failed to load tasks page');
        }
      }
    };
    
    initializePage();
    
    return () => {
      console.log('🧹 Cleaning up Tasks page subscriptions');
      clearTimeout(maxLoadingTimeout);
      isMounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      try {
        if (unsubscribeOffers) unsubscribeOffers();
        if (unsubscribeSettings) unsubscribeSettings();
      } catch (error) {
        console.error('Error cleaning up subscriptions:', error);
      }
    };
  }, [user]);

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
    const safeIndividualOffers = Array.isArray(cpaleadIndividualOffers) ? cpaleadIndividualOffers : [];
    
    // Manual tasks disabled - removed categoryOffers filtering
    
    switch (category) {
      case 'quizzes':
        // Check for quiz URL, quiz sources, or individual offers with quizzes category
        const quizOffers = safeIndividualOffers.filter(o => o.category === 'quizzes' || o.category === 'all');
        return cpaleadQuizUrl || (Array.isArray(quizSources) && quizSources.length > 0) || quizOffers.length > 0;
      case 'surveys':
        // Check for survey offerwalls or individual offers with surveys category
        const surveyOffers = safeIndividualOffers.filter(o => o.category === 'surveys' || o.category === 'all');
        return instantNetwork || offertoroApiKey || (cpxResearchApiKey || cpxResearchOfferwallUrl) || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || (Array.isArray(surveySources) && surveySources.length > 0) || surveyOffers.length > 0;
      case 'videos':
        // Check for video offerwalls or individual offers with videos category
        const videoOffers = safeIndividualOffers.filter(o => o.category === 'videos' || o.category === 'all');
        return instantNetwork || offertoroApiKey || (ayetStudiosApiKey || ayetStudiosOfferwallUrl) || (hideoutTvApiKey || hideoutTvOfferwallUrl) || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || (Array.isArray(videoSources) && videoSources.length > 0) || videoOffers.length > 0;
      case 'apps':
        // Check for app offerwalls or individual offers with apps category
        const appOffers = safeIndividualOffers.filter(o => o.category === 'apps' || o.category === 'all');
        return cpaleadPublisherId || instantNetwork || offertoroApiKey || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || (Array.isArray(appSources) && appSources.length > 0) || appOffers.length > 0;
      case 'games':
        // Check for individual offers with games category OR no category (default to games)
        const gameOffers = safeIndividualOffers.filter(o => !o.category || o.category === 'games' || o.category === 'all');
        const hasGames = gameOffers.length > 0;
        console.log('🎮 hasCategoryItems(games):', hasGames, 'game offers:', gameOffers.length, 'total offers:', safeIndividualOffers.length);
        return hasGames;
      case 'all':
        return true; // Always show "All Tasks" tab
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
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show error if there's a critical error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4 font-semibold">Error Loading Tasks Page</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              loadTasks();
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
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
    console.log('📋 Tasks page is loading...');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading tasks...</p>
          <p className="text-gray-400 text-xs mt-2">Please wait...</p>
          <button
            onClick={() => {
              console.log('📋 User clicked "Skip Loading"');
              setLoading(false);
            }}
            className="mt-4 text-purple-600 hover:text-purple-700 text-sm underline"
          >
            Skip Loading
          </button>
        </div>
      </div>
    );
  }

  console.log('📋 Tasks page rendering, activeCategory:', activeCategory);
  console.log('📋 Available tasks:', availableTasks.length);
  console.log('📋 CPAlead individual offers:', cpaleadIndividualOffers.length);
  console.log('📋 User:', user?.uid);

  // Final safety check - ensure page always renders
  try {
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
              count={null}
              hasItems={hasCategoryItems('games')}
            />
            <CategoryTab
              icon={FileText}
              label="Quizzes"
              category="quizzes"
              activeCategory={activeCategory}
              onClick={() => setActiveCategory('quizzes')}
              count={null}
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

        {/* Category Content - Show all categories when "All Tasks" is selected */}
      {(activeCategory === 'all' || activeCategory === 'games') && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <Gift className="w-5 h-5 mr-2 text-purple-600" />
            Game Tasks
          </h2>
          <GameTasksCategory
            cpaleadIndividualOffers={(() => {
              const filtered = cpaleadIndividualOffers.filter(o => {
                // For "all" category, show offers with games category or no category (defaults to games)
                // For "games" category, show only games offers
                const category = o.category || '';
                return !category || category === 'games' || category === 'all';
              });
              console.log('🎮 Filtering Game Tasks - Total offers:', cpaleadIndividualOffers.length, 'Filtered:', filtered.length);
              console.log('🎮 Filtered offers:', filtered.map(o => ({ name: o.name, category: o.category || 'none' })));
              return filtered;
            })()}
            userId={user.uid}
            onComplete={handleTaskComplete}
          />
        </div>
      )}

      {(activeCategory === 'all' || activeCategory === 'quizzes') && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Quizzes
          </h2>
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
        </div>
      )}

      {(activeCategory === 'all' || activeCategory === 'surveys') && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-purple-600" />
            Surveys
          </h2>
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
        </div>
      )}

      {(activeCategory === 'all' || activeCategory === 'videos') && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <PlayCircle className="w-5 h-5 mr-2 text-purple-600" />
            Watch Videos
          </h2>
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
        </div>
      )}

      {(activeCategory === 'all' || activeCategory === 'apps') && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-purple-600" />
            Install Apps
          </h2>
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
        </div>
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
  } catch (renderError) {
    console.error('❌ Error rendering Tasks page:', renderError);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4 font-semibold">Error Rendering Tasks Page</p>
          <p className="text-gray-600 mb-4">{renderError.message || 'Unknown error occurred'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
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

// Individual Offer Card Component (Reusable)
function IndividualOfferCard({ offer, userId, onComplete, icon: Icon = ExternalLink, claimedOffers, setClaimedOffers, openedOffers, setOpenedOffers, offerOpenTimes, setOfferOpenTimes, claimingOffer, setClaimingOffer }) {
  const offerId = offer.id || offer.url;
  const isClaimed = claimedOffers.has(offerId);
  const isOpened = openedOffers.has(offerId);
  const offerWindowRef = useRef(null);
  const completionDetectedRef = useRef(false);
  const [showClaimButton, setShowClaimButton] = useState(false);
  
  // Listen for completion messages from CPAlead
  useEffect(() => {
    if (!userId || isClaimed || !isOpened) return;
    
    const handleMessage = async (event) => {
      // Log all messages for debugging
      console.log('📨 Received message from offer:', event.origin, event.data);
      
      // Security: Verify origin (allow CPAlead and related domains)
      const allowedOrigins = [
        'cpalead.com',
        'directcpi.com',
        'zwidget',
        'qckclk.com',
        'akamaicdn.org'
      ];
      
      if (!allowedOrigins.some(origin => event.origin.includes(origin))) {
        return;
      }
      
      // Handle completion events - check various formats
      if (event.data) {
        let rewardPoints = 30; // Default reward for individual offers
        let isComplete = false;
        
        // Try different data formats
        if (typeof event.data === 'object') {
          rewardPoints = parseInt(
            event.data.reward || 
            event.data.amount || 
            event.data.payout || 
            event.data.points || 
            30
          );
          
          // Check for completion events
          isComplete = (
            event.data.type === 'offer_complete' || 
            event.data.event === 'offer_complete' ||
            event.data.type === 'task_complete' ||
            event.data.type === 'cpalead_complete' ||
            event.data.status === 'complete' ||
            event.data.completed === true ||
            event.data.unlocked === true
          );
        } else if (typeof event.data === 'string') {
          const lowerData = event.data.toLowerCase();
          isComplete = (
            lowerData.includes('complete') || 
            lowerData.includes('success') || 
            lowerData.includes('unlock') ||
            lowerData.includes('earned') ||
            lowerData.includes('points awarded')
          );
          
          // Try to extract reward amount
          const match = event.data.match(/(\d+)\s*points?/i);
          if (match) {
            rewardPoints = parseInt(match[1]);
          }
        }
        
        if (isComplete && !completionDetectedRef.current) {
          console.log('✅ Offer completion detected via postMessage!', { offerId, rewardPoints });
          completionDetectedRef.current = true;
          setShowClaimButton(true);
          
          // Auto-claim points
          try {
            const result = await claimOfferPoints(userId, offerId, offer.name, rewardPoints);
            if (result.success) {
              alert(`🎉 Success! You earned ${rewardPoints} points! Total: ${result.newPoints} points`);
              setClaimedOffers(prev => new Set([...prev, offerId]));
              setOpenedOffers(prev => {
                const newSet = new Set(prev);
                newSet.delete(offerId);
                return newSet;
              });
              if (onComplete) {
                onComplete({ success: true, reward: rewardPoints, points: result.newPoints });
              }
            } else {
              console.warn('Auto-claim failed, showing manual claim button:', result.error);
            }
          } catch (error) {
            console.error('Error auto-claiming points:', error);
            // Show claim button for manual claim
          }
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [userId, offerId, offer.name, isClaimed, isOpened, setClaimedOffers, setOpenedOffers, onComplete]);
  
  // Monitor window focus and check for completion
  useEffect(() => {
    if (!userId || isClaimed || !isOpened || !offerWindowRef.current) return;
    
    const handleFocus = async () => {
      // When user returns to the page, check if enough time has passed
      const openTime = offerOpenTimes.get(offerId);
      if (openTime) {
        const timeSinceOpen = Date.now() - openTime;
        // If user was away for more than 30 seconds, they might have completed the offer
        if (timeSinceOpen > 30000 && !completionDetectedRef.current) {
          console.log('⏰ User returned after 30+ seconds, showing claim button');
          setShowClaimButton(true);
        }
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Check if offer window is still open
    const checkWindow = setInterval(() => {
      if (offerWindowRef.current) {
        try {
          if (offerWindowRef.current.closed) {
            console.log('🪟 Offer window closed, checking for completion');
            const openTime = offerOpenTimes.get(offerId);
            if (openTime) {
              const timeSinceOpen = Date.now() - openTime;
              // If window was open for more than 30 seconds before closing, likely completed
              if (timeSinceOpen > 30000 && !completionDetectedRef.current) {
                console.log('✅ Window closed after 30+ seconds, showing claim button');
                setShowClaimButton(true);
              }
            }
            offerWindowRef.current = null;
          }
        } catch (e) {
          // Cross-origin error, window might be closed
          offerWindowRef.current = null;
        }
      }
    }, 2000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(checkWindow);
    };
  }, [userId, offerId, isClaimed, isOpened, offerOpenTimes]);
  
  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-4 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-0.5">{offer.name}</h2>
            <p className="text-sm text-gray-600">Complete this offer to earn rewards!</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {isClaimed ? (
            <button
              disabled
              className="bg-gray-500 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center cursor-not-allowed"
            >
              ✓ Points Claimed
            </button>
          ) : (
            <>
              <button
                onClick={async () => {
                  if (!userId) {
                    alert('Please log in to start offers');
                    return;
                  }
                  
                  // Track the click
                  await trackOfferClick(userId, offerId, offer.name, offer.url);
                  
                  // Track when offer was opened
                  setOpenedOffers(prev => new Set([...prev, offerId]));
                  setOfferOpenTimes(prev => new Map([...prev, [offerId, Date.now()]]));
                  
                  // Open offer in new tab
                  window.open(offer.url, '_blank', 'noopener,noreferrer');
                  
                  // Show message
                  alert('✅ Offer opened! Complete the task and come back to click "Claim 30 Points" to get your reward.');
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Start Offer
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
              
              {isOpened && (
                <button
                  onClick={async () => {
                    if (!userId) {
                      alert('Please log in to claim points');
                      return;
                    }
                    
                    if (claimingOffer === offerId) return;
                    
                    setClaimingOffer(offerId);
                    
                    try {
                      const result = await claimOfferPoints(userId, offerId, offer.name, 30);
                      
                      if (result.success) {
                        alert(`🎉 Success! You earned 30 points! Total: ${result.newPoints} points`);
                        setClaimedOffers(prev => new Set([...prev, offerId]));
                        setOpenedOffers(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(offerId);
                          return newSet;
                        });
                        if (onComplete) {
                          onComplete({ success: true, reward: 30, points: result.newPoints });
                        }
                      } else {
                        alert(`⚠️ ${result.error || 'Failed to claim points. Make sure you completed the offer first.'}`);
                      }
                    } catch (error) {
                      console.error('Error claiming points:', error);
                      alert('⚠️ An error occurred. Please try again.');
                    } finally {
                      setClaimingOffer(null);
                    }
                  }}
                  disabled={claimingOffer === offerId}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {claimingOffer === offerId ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Claiming...</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      <span>Claim 30 Points</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Game Tasks Category Component
function GameTasksCategory({ cpaleadIndividualOffers = [], userId, onComplete }) {
  const safeIndividualOffers = Array.isArray(cpaleadIndividualOffers) ? cpaleadIndividualOffers : [];
  const [claimedOffers, setClaimedOffers] = useState(new Set());
  const [claimingOffer, setClaimingOffer] = useState(null);
  
  console.log('🎮 GameTasksCategory - Received offers:', safeIndividualOffers.length);
  console.log('🎮 GameTasksCategory - Offers data:', JSON.stringify(safeIndividualOffers, null, 2));
  if (safeIndividualOffers.length > 0) {
    console.log('🎮 GameTasksCategory - First offer:', safeIndividualOffers[0]);
    console.log('🎮 GameTasksCategory - First offer structure:', {
      id: safeIndividualOffers[0].id,
      name: safeIndividualOffers[0].name,
      url: safeIndividualOffers[0].url,
      category: safeIndividualOffers[0].category,
      imageUrl: safeIndividualOffers[0].imageUrl,
      platform: safeIndividualOffers[0].platform
    });
  }
  
  // Track opened offers
  const [openedOffers, setOpenedOffers] = useState(new Set());
  const [offerOpenTimes, setOfferOpenTimes] = useState(new Map());
  const [showClaimButtons, setShowClaimButtons] = useState(new Set()); // Track which offers should show claim button
  const offerWindowRefs = useRef(new Map()); // Store refs for each offer window
  
  // Check which offers are already claimed
  useEffect(() => {
    if (!userId || safeIndividualOffers.length === 0) return;
    
    const checkClaims = async () => {
      const claimedSet = new Set();
      for (const offer of safeIndividualOffers) {
        const offerId = offer.id || offer.url;
        const result = await checkOfferClaimed(userId, offerId);
        if (result.claimed) {
          claimedSet.add(offerId);
        }
      }
      setClaimedOffers(claimedSet);
    };
    
    checkClaims();
  }, [userId, safeIndividualOffers]);
  
  // Detect when user returns to the page (after completing offer)
  useEffect(() => {
    const handleFocus = () => {
      // When user returns to the page, check if enough time has passed
      const now = Date.now();
      offerOpenTimes.forEach((openTime, offerId) => {
        // Enable claim button if offer was opened more than 30 seconds ago
        if (now - openTime > 30000 && !claimedOffers.has(offerId)) {
          // Offer might be completed, claim button is already visible
        }
      });
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [offerOpenTimes, claimedOffers]);
  
  console.log('🎮 GameTasksCategory rendering with', safeIndividualOffers.length, 'offers');
  
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

  // Platform color mapping
  const getPlatformColors = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'minecraft':
        return { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' };
      case 'roblox':
        return { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' };
      case 'gta5':
      case 'gta 5':
        return { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' };
      case 'fortnite':
        return { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' };
      default:
        return { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-600' };
    }
  };

  const getPlatformLabel = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'minecraft':
        return 'MINECRAFT';
      case 'roblox':
        return 'ROBLOX';
      case 'gta5':
      case 'gta 5':
        return 'GTA 5';
      case 'fortnite':
        return 'FORTNITE';
      default:
        return platform?.toUpperCase() || 'GAME';
    }
  };

  return (
    <div className="mb-6">
      {/* Game Tasks Header */}
      <div className="mb-4 flex justify-center">
        <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg px-6 py-3 border border-purple-200 max-w-md">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">
              500+ Game Tasks
            </h2>
            <p className="text-xs text-gray-600">
              Complete one offer and get 30 points for each
            </p>
          </div>
          <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {safeIndividualOffers.length}+
          </div>
        </div>
      </div>

      {/* Game Tasks Grid - CPALead Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {safeIndividualOffers.map((offer, index) => {
          const platformColors = getPlatformColors(offer.platform);
          const platformLabel = getPlatformLabel(offer.platform);
          
          return (
            <div
              key={offer.id || index}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-700 group"
            >
              {/* Platform Badge */}
              {offer.platform && (
                <div className="absolute top-3 right-3 z-10">
                  <span className={`${platformColors.bg} ${platformColors.text} px-3 py-1 rounded-full text-xs font-bold shadow-lg border ${platformColors.border}`}>
                    {platformLabel}
                  </span>
                </div>
              )}

              {/* Image/Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden">
                {offer.imageUrl ? (
                  <img
                    src={offer.imageUrl}
                    alt={offer.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      e.target.style.display = 'none';
                      e.target.parentElement.classList.add('bg-gradient-to-br', 'from-purple-600', 'to-pink-600');
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600">
                    <Gift className="w-16 h-16 text-white/30" />
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-purple-300 transition-colors">
                  {offer.name}
                </h3>
                <p className="text-gray-400 text-xs mb-4 line-clamp-2">
                  Complete this game offer to earn rewards!
                </p>
                
                {/* Action Button */}
                {claimedOffers.has(offer.id || offer.url) ? (
                  <button
                    disabled
                    className="w-full bg-gray-500 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <span>✓ Points Claimed</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={async () => {
                        if (!userId) {
                          alert('Please log in to start offers');
                          return;
                        }
                        
                        const offerId = offer.id || offer.url;
                        
                        // Track the click
                        await trackOfferClick(userId, offerId, offer.name, offer.url);
                        
                        // Track when offer was opened
                        setOpenedOffers(prev => new Set([...prev, offerId]));
                        setOfferOpenTimes(prev => new Map([...prev, [offerId, Date.now()]]));
                        
                        // Open offer in new tab and store reference
                        const newWindow = window.open(offer.url, '_blank', 'noopener,noreferrer');
                        if (newWindow) {
                          offerWindowRefs.current.set(offerId, newWindow);
                        }
                        
                        // Show message
                        alert('✅ Offer opened! Complete the task - points will be awarded automatically when detected, or click "Claim 30 Points" if needed.');
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <span>Start Offer</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    
                    {/* Show claim button if offer was opened or completion detected */}
                    {(openedOffers.has(offer.id || offer.url) || showClaimButtons.has(offer.id || offer.url)) && !claimedOffers.has(offer.id || offer.url) && (
                      <button
                        onClick={async () => {
                          if (!userId) {
                            alert('Please log in to claim points');
                            return;
                          }
                          
                          const offerId = offer.id || offer.url;
                          if (claimingOffer === offerId) return;
                          
                          setClaimingOffer(offerId);
                          
                          try {
                            const result = await claimOfferPoints(userId, offerId, offer.name, 30);
                            
                            if (result.success) {
                              alert(`🎉 Success! You earned 30 points! Total: ${result.newPoints} points`);
                              setClaimedOffers(prev => new Set([...prev, offerId]));
                              setOpenedOffers(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(offerId);
                                return newSet;
                              });
                              if (onComplete) {
                                onComplete({ success: true, reward: 30, points: result.newPoints });
                              }
                            } else {
                              alert(`⚠️ ${result.error || 'Failed to claim points. Make sure you completed the offer first.'}`);
                            }
                          } catch (error) {
                            console.error('Error claiming points:', error);
                            alert('⚠️ An error occurred. Please try again.');
                          } finally {
                            setClaimingOffer(null);
                          }
                        }}
                        disabled={claimingOffer === (offer.id || offer.url)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {claimingOffer === (offer.id || offer.url) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            <span>Claiming...</span>
                          </>
                        ) : (
                          <>
                            <Coins className="w-4 h-4" />
                            <span>Claim 30 Points</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Quizzes Category Component
function QuizzesCategory({ cpaleadQuizUrl, quizSources, cpaleadIndividualOffers = [], userId, user, showCPALeadQuiz, setShowCPALeadQuiz, availableTasks = [], onComplete }) {
  // Manual tasks disabled - removed quizOffers
  const safeQuizSources = Array.isArray(quizSources) ? quizSources : [];
  const safeIndividualOffers = Array.isArray(cpaleadIndividualOffers) ? cpaleadIndividualOffers : [];
  const [claimedOffers, setClaimedOffers] = useState(new Set());
  const [claimingOffer, setClaimingOffer] = useState(null);
  const [openedOffers, setOpenedOffers] = useState(new Set());
  const [offerOpenTimes, setOfferOpenTimes] = useState(new Map());
  
  // Check which offers are already claimed
  useEffect(() => {
    if (!userId || safeIndividualOffers.length === 0) return;
    
    const checkClaims = async () => {
      const claimedSet = new Set();
      for (const offer of safeIndividualOffers) {
        const offerId = offer.id || offer.url;
        const result = await checkOfferClaimed(userId, offerId);
        if (result.claimed) {
          claimedSet.add(offerId);
        }
      }
      setClaimedOffers(claimedSet);
    };
    
    checkClaims();
  }, [userId, safeIndividualOffers]);
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
        <IndividualOfferCard
          key={offer.id || index}
          offer={offer}
          userId={userId}
          onComplete={onComplete}
          icon={FileText}
          claimedOffers={claimedOffers}
          setClaimedOffers={setClaimedOffers}
          openedOffers={openedOffers}
          setOpenedOffers={setOpenedOffers}
          offerOpenTimes={offerOpenTimes}
          setOfferOpenTimes={setOfferOpenTimes}
          claimingOffer={claimingOffer}
          setClaimingOffer={setClaimingOffer}
        />
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
      const [claimedOffers, setClaimedOffers] = useState(new Set());
      const [claimingOffer, setClaimingOffer] = useState(null);
      const [openedOffers, setOpenedOffers] = useState(new Set());
      const [offerOpenTimes, setOfferOpenTimes] = useState(new Map());
      
      // Check which offers are already claimed
      useEffect(() => {
        if (!userId || safeIndividualOffers.length === 0) return;
        
        const checkClaims = async () => {
          const claimedSet = new Set();
          for (const offer of safeIndividualOffers) {
            const offerId = offer.id || offer.url;
            const result = await checkOfferClaimed(userId, offerId);
            if (result.claimed) {
              claimedSet.add(offerId);
            }
          }
          setClaimedOffers(claimedSet);
        };
        
        checkClaims();
      }, [userId, safeIndividualOffers]);
      // Manual tasks disabled - removed surveyOffers
      
      // CPAlead offerwall disabled - removed cpaleadPublisherId
      // Filter individual offers for surveys category
      const surveyIndividualOffers = safeIndividualOffers.filter(o => o.category === 'surveys' || o.category === 'all');
      const hasSurveys = (instantNetwork && instantNetworkApiKey) || offertoroApiKey || (cpxResearchApiKey || cpxResearchOfferwallUrl) || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || safeSurveySources.length > 0 || surveyIndividualOffers.length > 0;

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
        <IndividualOfferCard
          key={offer.id || index}
          offer={offer}
          userId={userId}
          onComplete={onComplete}
          icon={HelpCircle}
          claimedOffers={claimedOffers}
          setClaimedOffers={setClaimedOffers}
          openedOffers={openedOffers}
          setOpenedOffers={setOpenedOffers}
          offerOpenTimes={offerOpenTimes}
          setOfferOpenTimes={setOfferOpenTimes}
          claimingOffer={claimingOffer}
          setClaimingOffer={setClaimingOffer}
        />
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
      const [claimedOffers, setClaimedOffers] = useState(new Set());
      const [claimingOffer, setClaimingOffer] = useState(null);
      const [openedOffers, setOpenedOffers] = useState(new Set());
      const [offerOpenTimes, setOfferOpenTimes] = useState(new Map());
      
      // Check which offers are already claimed
      useEffect(() => {
        if (!userId || safeIndividualOffers.length === 0) return;
        
        const checkClaims = async () => {
          const claimedSet = new Set();
          for (const offer of safeIndividualOffers) {
            const offerId = offer.id || offer.url;
            const result = await checkOfferClaimed(userId, offerId);
            if (result.claimed) {
              claimedSet.add(offerId);
            }
          }
          setClaimedOffers(claimedSet);
        };
        
        checkClaims();
      }, [userId, safeIndividualOffers]);
      // Manual tasks disabled - removed videoOffers
      
      // Filter individual offers for videos category
      const videoIndividualOffers = safeIndividualOffers.filter(o => o.category === 'videos' || o.category === 'all');
      // CPAlead offerwall disabled - removed cpaleadPublisherId
      const hasVideos = (instantNetwork && instantNetworkApiKey) || offertoroApiKey || (ayetStudiosApiKey || ayetStudiosOfferwallUrl) || (hideoutTvApiKey || hideoutTvOfferwallUrl) || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || safeVideoSources.length > 0 || videoIndividualOffers.length > 0;

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

      {/* Ayet Studios (Video-focused) - Coming Soon */}
      {(ayetStudiosApiKey || ayetStudiosOfferwallUrl) && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-red-200 p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-lg mr-3">
                <PlayCircle className="w-4 h-4 text-white" />
          </div>
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-0.5">Ayet Studios Videos</h2>
                <p className="text-sm text-gray-600">Coming Soon</p>
            </div>
        </div>
            <button
              disabled
              className="bg-gray-400 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center shadow-lg cursor-not-allowed flex-shrink-0 ml-4"
            >
              Coming Soon
            </button>
          </div>
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
        <IndividualOfferCard
          key={offer.id || index}
          offer={offer}
          userId={userId}
          onComplete={onComplete}
          icon={PlayCircle}
          claimedOffers={claimedOffers}
          setClaimedOffers={setClaimedOffers}
          openedOffers={openedOffers}
          setOpenedOffers={setOpenedOffers}
          offerOpenTimes={offerOpenTimes}
          setOfferOpenTimes={setOfferOpenTimes}
          claimingOffer={claimingOffer}
          setClaimingOffer={setClaimingOffer}
        />
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
      const [claimedOffers, setClaimedOffers] = useState(new Set());
      const [claimingOffer, setClaimingOffer] = useState(null);
      const [openedOffers, setOpenedOffers] = useState(new Set());
      const [offerOpenTimes, setOfferOpenTimes] = useState(new Map());
      
      // Check which offers are already claimed
      useEffect(() => {
        if (!userId || safeIndividualOffers.length === 0) return;
        
        const checkClaims = async () => {
          const claimedSet = new Set();
          for (const offer of safeIndividualOffers) {
            const offerId = offer.id || offer.url;
            const result = await checkOfferClaimed(userId, offerId);
            if (result.claimed) {
              claimedSet.add(offerId);
            }
          }
          setClaimedOffers(claimedSet);
        };
        
        checkClaims();
      }, [userId, safeIndividualOffers]);
      // Manual tasks disabled - removed appOffers
      
      // Filter individual offers for apps category
      const appIndividualOffers = safeIndividualOffers.filter(o => o.category === 'apps' || o.category === 'all');
      const hasApps = cpaleadPublisherId || (instantNetwork && instantNetworkApiKey) || offertoroApiKey || (lootablyApiKey || lootablyOfferwallUrl) || (adgemApiKey || adgemOfferwallUrl) || safeAppSources.length > 0 || appIndividualOffers.length > 0;

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
                <div className="w-full">
                  <CPALeadOfferwall
                    publisherId={cpaleadPublisherId}
                    userId={userId}
                    onComplete={onComplete || (() => {})}
                  />
                </div>
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
        <IndividualOfferCard
          key={offer.id || index}
          offer={offer}
          userId={userId}
          onComplete={onComplete}
          icon={Smartphone}
          claimedOffers={claimedOffers}
          setClaimedOffers={setClaimedOffers}
          openedOffers={openedOffers}
          setOpenedOffers={setOpenedOffers}
          offerOpenTimes={offerOpenTimes}
          setOfferOpenTimes={setOfferOpenTimes}
          claimingOffer={claimingOffer}
          setClaimingOffer={setClaimingOffer}
        />
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
