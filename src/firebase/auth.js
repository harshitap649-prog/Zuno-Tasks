import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './config';

// Generate unique referral code
const generateReferralCode = (uid) => {
  const uidPart = uid.substring(0, 8).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${uidPart}${randomPart}`;
};

// Email/Password Sign Up
export const signUpWithEmail = async (email, password, name, referralCode = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Generate referral code for new user
    const referralCodeForUser = generateReferralCode(user.uid);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: name || user.displayName || 'User',
      email: user.email,
      uid: user.uid,
      points: 0,
      watchCount: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      banned: false,
      disabled: false,
      referralCode: referralCodeForUser,
      referralBonusAwarded: false,
      createdAt: serverTimestamp(),
      lastWatchReset: new Date().toISOString(),
    });
    
    // Register referral if code provided
    if (referralCode) {
      const { registerReferral } = await import('./firestore');
      await registerReferral(user.uid, referralCode);
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message, errorCode: error.code };
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      const referralCodeForUser = generateReferralCode(user.uid);
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || 'User',
        email: user.email,
        uid: user.uid,
        points: 0,
        watchCount: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        banned: false,
        referralCode: referralCodeForUser,
        referralBonusAwarded: false,
        createdAt: serverTimestamp(),
        lastWatchReset: new Date().toISOString(),
      });
    } else {
      // Check if user is banned or disabled
      const userData = userDoc.data();
      if (userData.banned) {
        await signOut(auth);
        return { success: false, error: 'Your account has been banned.' };
      }
      if (userData.disabled) {
        await signOut(auth);
        return { success: false, error: 'Your account has been disabled. Please contact support.' };
      }
      
      // Ensure referral code exists for existing users
      if (!userData.referralCode) {
        const referralCodeForUser = generateReferralCode(user.uid);
        await updateDoc(doc(db, 'users', user.uid), {
          referralCode: referralCodeForUser,
        });
      }
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message, errorCode: error.code };
  }
};

// Google Sign In
export const signInWithGoogle = async (referralCode = null) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // Generate referral code for new user
      const referralCodeForUser = generateReferralCode(user.uid);
      
      // Create new user document
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || 'User',
        email: user.email,
        uid: user.uid,
        points: 0,
        watchCount: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        banned: false,
        referralCode: referralCodeForUser,
        referralBonusAwarded: false,
        createdAt: serverTimestamp(),
        lastWatchReset: new Date().toISOString(),
      });
      
      // Register referral if code provided
      if (referralCode) {
        const { registerReferral } = await import('./firestore');
        await registerReferral(user.uid, referralCode);
      }
    } else {
      // Check if user is banned or disabled
      const userData = userDoc.data();
      if (userData.banned) {
        await signOut(auth);
        return { success: false, error: 'Your account has been banned.' };
      }
      if (userData.disabled) {
        await signOut(auth);
        return { success: false, error: 'Your account has been disabled. Please contact support.' };
      }
      
      // Ensure referral code exists for existing users
      if (!userData.referralCode) {
        const referralCodeForUser = generateReferralCode(user.uid);
        await updateDoc(doc(db, 'users', user.uid), {
          referralCode: referralCodeForUser,
        });
      }
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message, errorCode: error.code };
  }
};

// Sign Out
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth State Observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

