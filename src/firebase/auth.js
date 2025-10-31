import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './config';

// Email/Password Sign Up
export const signUpWithEmail = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
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
      createdAt: serverTimestamp(),
      lastWatchReset: new Date().toISOString(),
    });
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
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
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || 'User',
        email: user.email,
        uid: user.uid,
        points: 0,
        watchCount: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        banned: false,
        createdAt: serverTimestamp(),
        lastWatchReset: new Date().toISOString(),
      });
    } else {
      // Check if user is banned
      const userData = userDoc.data();
      if (userData.banned) {
        await signOut(auth);
        return { success: false, error: 'Your account has been banned.' };
      }
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
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
        createdAt: serverTimestamp(),
        lastWatchReset: new Date().toISOString(),
      });
    } else {
      // Check if user is banned
      const userData = userDoc.data();
      if (userData.banned) {
        await signOut(auth);
        return { success: false, error: 'Your account has been banned.' };
      }
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
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

