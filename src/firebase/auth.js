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
    console.log('🔐 signInWithEmail called with email:', email);
    
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.', errorCode: 'auth/missing-credentials' };
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase auth successful, user:', user.uid);
    
    // Check if user document exists, create if not
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        console.log('📝 User document not found, creating new one...');
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
        console.log('✅ User document created');
      } else {
        // Check if user is banned or disabled
        const userData = userDoc.data();
        if (userData.banned) {
          console.warn('⚠️ User is banned, signing out...');
          await signOut(auth);
          return { success: false, error: 'Your account has been banned.', errorCode: 'auth/user-banned' };
        }
        if (userData.disabled) {
          console.warn('⚠️ User is disabled, signing out...');
          await signOut(auth);
          return { success: false, error: 'Your account has been disabled. Please contact support.', errorCode: 'auth/user-disabled' };
        }
        
        // Ensure referral code exists for existing users
        if (!userData.referralCode) {
          console.log('📝 Adding referral code to existing user...');
          const referralCodeForUser = generateReferralCode(user.uid);
          await updateDoc(doc(db, 'users', user.uid), {
            referralCode: referralCodeForUser,
          });
        }
        console.log('✅ User document check complete');
      }
    } catch (dbError) {
      console.error('⚠️ Firestore error (non-critical):', dbError);
      // Don't fail login if Firestore check fails - user is still authenticated
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return { success: false, error: error.message, errorCode: error.code };
  }
};

// Google Sign In
export const signInWithGoogle = async (referralCode = null) => {
  try {
    console.log('🔐 Starting Google sign-in with popup...');
    
    // Check if popups are blocked
    try {
      const testWindow = window.open('', '_blank', 'width=1,height=1');
      if (!testWindow || testWindow.closed || typeof testWindow.closed === 'undefined') {
        console.warn('⚠️ Popups may be blocked');
      } else {
        testWindow.close();
      }
    } catch (e) {
      console.warn('⚠️ Could not test popup support');
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('✅ Google popup sign-in successful, user:', user.uid);
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      console.log('📝 Creating new user document for Google sign-in...');
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
      console.log('✅ User document created');
    } else {
      console.log('✅ User document exists, checking status...');
      // Check if user is banned or disabled
      const userData = userDoc.data();
      if (userData.banned) {
        console.warn('⚠️ User is banned, signing out...');
        await signOut(auth);
        return { success: false, error: 'Your account has been banned.', errorCode: 'auth/user-banned' };
      }
      if (userData.disabled) {
        console.warn('⚠️ User is disabled, signing out...');
        await signOut(auth);
        return { success: false, error: 'Your account has been disabled. Please contact support.', errorCode: 'auth/user-disabled' };
      }
      
      // Ensure referral code exists for existing users
      if (!userData.referralCode) {
        console.log('📝 Adding referral code to existing user...');
        const referralCodeForUser = generateReferralCode(user.uid);
        await updateDoc(doc(db, 'users', user.uid), {
          referralCode: referralCodeForUser,
        });
      }
      console.log('✅ User document check complete');
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
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

