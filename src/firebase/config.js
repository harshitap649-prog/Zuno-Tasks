import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Add your Firebase configuration here from Firebase Console
  apiKey: "AIzaSyAQXe_qI29Ovsr0WR9i7glN8qh2jRt4Pkk",
  authDomain: "zuno-tasks.firebaseapp.com",
  projectId: "zuno-tasks",
  storageBucket: "zuno-tasks.firebasestorage.app",
  messagingSenderId: "835286026957",
  appId: "1:835286026957:web:793b66c6ec7b09cfa1f784"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

