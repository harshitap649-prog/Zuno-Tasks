import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './config';

// Helpers
const getLocalDateKey = (d = new Date()) => {
  // Returns YYYY-MM-DD in local time for simple day comparisons
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// User Operations
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Ensure a user's daily watchCount is reset if a new local day has started
export const ensureDailyWatchReset = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return { success: false, error: 'User not found' };
    }

    const data = userSnap.data();
    const lastKey = (data.lastWatchResetKey || '').toString();
    const todayKey = getLocalDateKey();

    if (lastKey !== todayKey) {
      await updateDoc(userRef, {
        watchCount: 0,
        lastWatchReset: new Date().toISOString(),
        lastWatchResetKey: todayKey,
      });
      return { success: true, reset: true };
    }

    return { success: true, reset: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserPoints = async (uid, pointsToAdd) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentData = userDoc.data();
      const newPoints = currentData.points + pointsToAdd;
      const newTotalEarned = currentData.totalEarned + pointsToAdd;
      
      await updateDoc(userRef, {
        points: newPoints,
        totalEarned: newTotalEarned,
      });
      
      // Add transaction
      await addDoc(collection(db, 'transactions'), {
        userId: uid,
        type: 'task',
        points: pointsToAdd,
        timestamp: serverTimestamp(),
      });
      
      return { success: true, newPoints };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateWatchCount = async (uid, rewardPoints = 20) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentData = userDoc.data();
      // Reset daily counter if a new day started (local time)
      const todayKey = getLocalDateKey();
      const storedKey = (currentData.lastWatchResetKey || '').toString();
      const effectiveWatchCount = storedKey === todayKey ? (currentData.watchCount || 0) : 0;

      // Enforce 3 per day limit
      if (effectiveWatchCount >= 3) {
        return { success: false, error: 'Daily ad limit reached' };
      }

      const newWatchCount = effectiveWatchCount + 1;
      const newPoints = currentData.points + rewardPoints;
      const newTotalEarned = currentData.totalEarned + rewardPoints;
      
      await updateDoc(userRef, {
        watchCount: newWatchCount,
        points: newPoints,
        totalEarned: newTotalEarned,
        lastWatchReset: new Date().toISOString(),
        lastWatchResetKey: todayKey,
      });
      
      // Add transaction
      await addDoc(collection(db, 'transactions'), {
        userId: uid,
        type: 'ad',
        points: rewardPoints,
        timestamp: serverTimestamp(),
      });
      
      return { success: true, newWatchCount, newPoints };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Reset watch count (called by Cloud Function daily)
export const resetWatchCount = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const batch = [];
    
    usersSnapshot.forEach((userDoc) => {
      batch.push(
        updateDoc(doc(db, 'users', userDoc.id), {
          watchCount: 0,
          lastWatchReset: new Date().toISOString(),
        })
      );
    });
    
    await Promise.all(batch);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Offers/Tasks Operations
export const getActiveOffers = async () => {
  try {
    const q = query(collection(db, 'offers'), where('active', '==', true));
    const querySnapshot = await getDocs(q);
    const offers = [];
    
    querySnapshot.forEach((doc) => {
      offers.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, offers };
  } catch (error) {
    return { success: false, error: error.message, offers: [] };
  }
};

export const subscribeToOffers = (callback) => {
  const q = query(collection(db, 'offers'), where('active', '==', true));
  return onSnapshot(q, (snapshot) => {
    const offers = [];
    snapshot.forEach((doc) => {
      offers.push({ id: doc.id, ...doc.data() });
    });
    callback(offers);
  });
};

// Transaction Operations
export const getUserTransactions = async (uid, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', uid),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const transactions = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, transactions };
  } catch (error) {
    return { success: false, error: error.message, transactions: [] };
  }
};

// Withdrawal Operations
export const createWithdrawalRequest = async (uid, amount, upi) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = userDoc.data();
    const pointsRequired = amount * 100; // ₹100 = 10,000 points
    
    if (userData.points < pointsRequired) {
      return { success: false, error: 'Insufficient points' };
    }
    
    if (amount < 100) {
      return { success: false, error: 'Minimum withdrawal is ₹100' };
    }
    
    // Create withdrawal request
    await addDoc(collection(db, 'withdrawRequests'), {
      userId: uid,
      amount: amount,
      points: pointsRequired,
      upi: upi,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    
    // Deduct points immediately (will be refunded if rejected)
    await updateDoc(doc(db, 'users', uid), {
      points: userData.points - pointsRequired,
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserWithdrawals = async (uid) => {
  try {
    const q = query(
      collection(db, 'withdrawRequests'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const withdrawals = [];
    
    querySnapshot.forEach((doc) => {
      withdrawals.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, withdrawals };
  } catch (error) {
    return { success: false, error: error.message, withdrawals: [] };
  }
};

// Admin Operations
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message, users: [] };
  }
};

export const getAllWithdrawals = async () => {
  try {
    const q = query(collection(db, 'withdrawRequests'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const withdrawals = [];
    
    querySnapshot.forEach((doc) => {
      withdrawals.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, withdrawals };
  } catch (error) {
    return { success: false, error: error.message, withdrawals: [] };
  }
};

export const addOffer = async (offerData) => {
  try {
    await addDoc(collection(db, 'offers'), {
      ...offerData,
      active: true,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateOffer = async (offerId, offerData) => {
  try {
    await updateDoc(doc(db, 'offers', offerId), offerData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateWithdrawalStatus = async (requestId, status, userId, points) => {
  try {
    await updateDoc(doc(db, 'withdrawRequests', requestId), {
      status: status,
      processedAt: serverTimestamp(),
    });
    
    if (status === 'approved') {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await updateDoc(doc(db, 'users', userId), {
          totalWithdrawn: userData.totalWithdrawn + points,
        });
      }
    } else if (status === 'rejected') {
      // Refund points
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await updateDoc(doc(db, 'users', userId), {
          points: userData.points + points,
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const banUser = async (uid, banned) => {
  try {
    await updateDoc(doc(db, 'users', uid), { banned });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const adjustUserPoints = async (uid, points) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      await updateDoc(doc(db, 'users', uid), { points });
      return { success: true };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

