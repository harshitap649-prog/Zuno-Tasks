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
      
      // Check referral bonus eligibility (10 rupees = 100 points)
      if (newTotalEarned >= 100 && currentData.totalEarned < 100) {
        // User just crossed 10 rupees threshold
        await checkAndAwardReferralBonus(uid);
      }
      
      return { success: true, newPoints };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateWatchCount = async (uid, rewardPoints = 10) => {
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
      
      // Check referral bonus eligibility (10 rupees = 100 points)
      if (newTotalEarned >= 100 && currentData.totalEarned < 100) {
        // User just crossed 10 rupees threshold
        await checkAndAwardReferralBonus(uid);
      }
      
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
    const pointsRequired = amount * 10; // ₹100 = 1,000 points
    
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

// Support Messages
export const submitSupportMessage = async (uid, messageData) => {
  try {
    const supportRef = collection(db, 'supportMessages');
    await addDoc(supportRef, {
      userId: uid,
      userName: messageData.userName,
      userEmail: messageData.userEmail,
      subject: messageData.subject,
      message: messageData.message,
      status: 'pending', // pending, read, replied, resolved
      createdAt: serverTimestamp(),
      read: false,
      readAt: null,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllSupportMessages = async () => {
  try {
    const supportRef = collection(db, 'supportMessages');
    const q = query(supportRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return { success: true, messages };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateSupportMessageStatus = async (messageId, status, read = true) => {
  try {
    const messageRef = doc(db, 'supportMessages', messageId);
    await updateDoc(messageRef, {
      status,
      read,
      readAt: read ? serverTimestamp() : null,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Ongoing Tasks Operations
export const startTask = async (userId, offerId, offerData) => {
  try {
    // Check if task already started
    const q = query(
      collection(db, 'ongoingTasks'),
      where('userId', '==', userId),
      where('offerId', '==', offerId)
    );
    const existing = await getDocs(q);
    
    // Filter in JavaScript to check for active statuses
    const activeTasks = [];
    existing.forEach((doc) => {
      const data = doc.data();
      const validStatuses = ['started', 'in_progress', 'pending_verification'];
      if (validStatuses.includes(data.status)) {
        activeTasks.push(doc);
      }
    });
    
    if (activeTasks.length > 0) {
      return { success: false, error: 'Task already started' };
    }

    // Create ongoing task
    await addDoc(collection(db, 'ongoingTasks'), {
      userId,
      offerId,
      taskTitle: offerData.title,
      taskDescription: offerData.description,
      taskLink: offerData.link,
      rewardPoints: offerData.rewardPoints,
      status: 'started',
      startedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserOngoingTasks = async (userId) => {
  try {
    const q = query(
      collection(db, 'ongoingTasks'),
      where('userId', '==', userId),
      orderBy('startedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const tasks = [];
    const validStatuses = ['started', 'in_progress', 'pending_verification'];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Filter in JavaScript since Firestore 'in' requires composite index
      if (validStatuses.includes(data.status)) {
        tasks.push({ id: doc.id, ...data });
      }
    });
    
    return { success: true, tasks };
  } catch (error) {
    // If orderBy fails (no index), try without it
    try {
      const q = query(
        collection(db, 'ongoingTasks'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const tasks = [];
      const validStatuses = ['started', 'in_progress', 'pending_verification'];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (validStatuses.includes(data.status)) {
          tasks.push({ id: doc.id, ...data });
        }
      });
      
      // Sort by startedAt manually
      tasks.sort((a, b) => {
        const aTime = a.startedAt?.toDate?.() || new Date(0);
        const bTime = b.startedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      return { success: true, tasks };
    } catch (retryError) {
      return { success: false, error: retryError.message, tasks: [] };
    }
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    await updateDoc(doc(db, 'ongoingTasks', taskId), {
      status,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const completeTask = async (taskId, userId, rewardPoints) => {
  try {
    // Update task status to completed
    await updateDoc(doc(db, 'ongoingTasks', taskId), {
      status: 'completed',
      completedAt: serverTimestamp(),
    });

    // Award points to user (updateUserPoints will check referral bonus)
    const result = await updateUserPoints(userId, rewardPoints);
    
    if (result.success) {
      return { success: true };
    }
    return { success: false, error: 'Failed to award points' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Generate unique referral code
const generateReferralCode = (uid) => {
  // Use first 8 characters of UID + random 4 characters
  const uidPart = uid.substring(0, 8).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${uidPart}${randomPart}`;
};

// Check and award referral bonus when referred user earns 10 rupees (100 points)
const checkAndAwardReferralBonus = async (referredUserId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', referredUserId));
    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    
    // Check if user was referred and bonus not yet awarded
    if (userData.referredBy && !userData.referralBonusAwarded) {
      const referrerId = userData.referredBy;
      
      // Award 50 points to referrer
      const referrerDoc = await getDoc(doc(db, 'users', referrerId));
      if (referrerDoc.exists()) {
        const referrerData = referrerDoc.data();
        const newReferrerPoints = referrerData.points + 50;
        const newReferrerTotalEarned = referrerData.totalEarned + 50;
        
        await updateDoc(doc(db, 'users', referrerId), {
          points: newReferrerPoints,
          totalEarned: newReferrerTotalEarned,
        });
        
        // Add transaction for referrer
        await addDoc(collection(db, 'transactions'), {
          userId: referrerId,
          type: 'referral_bonus',
          points: 50,
          description: `Referral bonus: ${userData.name || userData.email} earned ₹10`,
          timestamp: serverTimestamp(),
        });
        
        // Mark bonus as awarded for referred user
        await updateDoc(doc(db, 'users', referredUserId), {
          referralBonusAwarded: true,
          referralBonusAwardedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.error('Error awarding referral bonus:', error);
  }
};

// Initialize user with referral code (call this when creating new user)
export const initializeUserReferral = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Generate referral code if not exists
      if (!userData.referralCode) {
        const referralCode = generateReferralCode(uid);
        await updateDoc(userRef, {
          referralCode: referralCode,
        });
        return { success: true, referralCode };
      }
      
      return { success: true, referralCode: userData.referralCode };
    }
    
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Register referral when new user signs up with referral code
export const registerReferral = async (newUserId, referralCode) => {
  try {
    // Check if user already exists and has referral info (prevent duplicate referrals)
    const userDoc = await getDoc(doc(db, 'users', newUserId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // If user already has been referred or has account history, don't process referral
      if (userData.referredBy || (userData.totalEarned && userData.totalEarned > 0)) {
        return { success: false, error: 'Referral code can only be used on first-time signup' };
      }
    }
    
    // Find referrer by code
    const usersQuery = query(
      collection(db, 'users'),
      where('referralCode', '==', referralCode.toUpperCase())
    );
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'Invalid referral code' };
    }
    
    const referrerDoc = querySnapshot.docs[0];
    const referrerId = referrerDoc.id;
    
    // Don't allow self-referral
    if (referrerId === newUserId) {
      return { success: false, error: 'Cannot refer yourself' };
    }
    
    // Update new user with referral info
    await updateDoc(doc(db, 'users', newUserId), {
      referredBy: referrerId,
      referralBonusAwarded: false,
    });
    
    // Create referral record
    await addDoc(collection(db, 'referrals'), {
      referrerId: referrerId,
      referredUserId: newUserId,
      referralCode: referralCode.toUpperCase(),
      status: 'pending', // pending, bonus_awarded
      createdAt: serverTimestamp(),
    });
    
    return { success: true, referrerId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user's referral code
export const getUserReferralCode = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.referralCode) {
        return { success: true, referralCode: userData.referralCode };
      }
      
      // Generate if doesn't exist
      const result = await initializeUserReferral(uid);
      return result;
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Admin Settings Operations - Store offerwall configs globally
export const getAdminSettings = async () => {
  try {
    const settingsDoc = await getDoc(doc(db, 'adminSettings', 'offerwallConfig'));
    if (settingsDoc.exists()) {
      return { success: true, settings: settingsDoc.data() };
    }
    // Return default empty settings if document doesn't exist
    return { success: true, settings: {} };
  } catch (error) {
    return { success: false, error: error.message, settings: {} };
  }
};

export const updateAdminSettings = async (settings) => {
  try {
    await setDoc(doc(db, 'adminSettings', 'offerwallConfig'), {
      ...settings,
      updatedAt: serverTimestamp(),
    }, { merge: true }); // Use merge to update without overwriting other fields
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Subscribe to admin settings changes
export const subscribeToAdminSettings = (callback) => {
  const settingsDoc = doc(db, 'adminSettings', 'offerwallConfig');
  return onSnapshot(settingsDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback({});
    }
  });
};

