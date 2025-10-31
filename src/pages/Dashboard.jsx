import { useState, useEffect } from 'react';
import { getUserData, getActiveOffers, updateWatchCount, subscribeToOffers } from '../firebase/firestore';
import { Coins, PlayCircle, Gift, TrendingUp } from 'lucide-react';
import WatchAdModal from '../components/WatchAdModal';
import SidebarAd from '../components/SidebarAd';

export default function Dashboard({ user }) {
  const [userData, setUserData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdModal, setShowAdModal] = useState(false);

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToOffers((updatedOffers) => {
      setOffers(updatedOffers);
    });

    return () => unsubscribe();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Ensure daily reset before reading
      try { await (await import('../firebase/firestore')).ensureDailyWatchReset?.(user.uid); } catch {}
      const userResult = await getUserData(user.uid);
      const offersResult = await getActiveOffers();

      if (userResult.success) {
        setUserData(userResult.data);
      } else {
        // If user document doesn't exist, create default values
        console.log('User data not found, using defaults:', userResult.error);
        setUserData({
          points: 0,
          watchCount: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          name: user.displayName || user.email || 'User',
          email: user.email,
        });
      }
      
      if (offersResult.success) {
        setOffers(offersResult.offers);
      } else {
        console.log('Offers error:', offersResult.error);
        setOffers([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values on error
      setUserData({
        points: 0,
        watchCount: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        name: user.displayName || user.email || 'User',
        email: user.email,
      });
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchAd = async () => {
    if (!userData) return;

    // Check daily limit
    if (userData.watchCount >= 3) {
      alert('You have reached your daily limit of 3 ads. Please come back tomorrow!');
      return;
    }

    setShowAdModal(true);
  };

  const onAdComplete = async () => {
    const result = await updateWatchCount(user.uid, 20);
    if (result.success) {
      await loadData();
      setShowAdModal(false);
      alert('🎉 You earned 20 points!');
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
  const rupees = (points / 100).toFixed(2);
  const canWatchAd = userData.watchCount < 3;

  const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT;
  const inlineSlot = import.meta.env.VITE_ADSENSE_INLINE_SLOT;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-9">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Points</p>
              <p className="text-3xl font-bold mt-2">{points.toLocaleString()}</p>
            </div>
            <Coins className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Wallet Balance</p>
              <p className="text-3xl font-bold mt-2">₹{rupees}</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Ads Watched Today</p>
              <p className="text-3xl font-bold mt-2">{userData.watchCount || 0}/3</p>
            </div>
            <PlayCircle className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={handleWatchAd}
          disabled={!canWatchAd}
          className={`card text-left hover:shadow-xl transition-all duration-200 ${
            canWatchAd
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer transform hover:-translate-y-1'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Watch Ad</h3>
              <p className="text-sm opacity-90">
                {canWatchAd
                  ? 'Earn 20 points by watching an ad'
                  : 'Daily limit reached (3/3)'}
              </p>
            </div>
            <PlayCircle className="w-16 h-16 opacity-50" />
          </div>
        </button>

        <div className="card bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Refer & Earn</h3>
              <p className="text-sm opacity-90">Get 5% bonus from friends' earnings</p>
            </div>
            <Gift className="w-16 h-16 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Gift className="w-6 h-6 mr-2 text-purple-600" />
          Available Tasks
        </h2>

        {offers.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No tasks available at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <TaskCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>

          {showAdModal && (
            <WatchAdModal
              onClose={() => setShowAdModal(false)}
              onComplete={onAdComplete}
            />
          )}
        </div>

        {/* Sidebar Ad - Desktop only, non-intrusive */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20">
            <SidebarAd />
          </div>
        </div>
      </div>

      {/* Inline Ad - Service worker will inject automatically */}
      <div className="mt-8 mb-4" data-ad-zone="inline">
        {/* Service worker will inject inline ads here automatically */}
      </div>
    </div>
  );
}

function TaskCard({ offer }) {
  const handleTaskClick = () => {
    if (offer.link) {
      window.open(offer.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{offer.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-purple-600 font-bold">
          <Coins className="w-5 h-5 mr-1" />
          {offer.rewardPoints} points
        </div>
        <button
          onClick={handleTaskClick}
          className="btn-primary text-sm py-2 px-4"
        >
          Start Task
        </button>
      </div>
    </div>
  );
}

