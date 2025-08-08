// Firebase initialization and shared helpers
// Uses Firebase v10 modular SDK via ESM CDN imports

export { onAuthStateChanged, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js';
export { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, orderBy, limit, where, arrayUnion } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js';

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCe0mBaCP3DpFGZ7-GKTlEQ9L8wCNXZ9kI",
  authDomain: "internhub-c469b.firebaseapp.com",
  projectId: "internhub-c469b",
  storageBucket: "internhub-c469b.firebasestorage.app",
  messagingSenderId: "332430290715",
  appId: "1:332430290715:web:d4c7725ebe94785d156dbe",
  measurementId: "G-8KR4E419DP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics is optional; will no-op outside supported environments
try { getAnalytics(app); } catch (_) {}

// Initialize services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Ensures a user profile document exists on first login
export async function ensureUserDocument(user) {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || 'Anonymous',
      email: user.email || '',
      joined_at: new Date().toISOString(),
      badges: []
    });
  }
}

// Ensures a userProgress document exists for the user
export async function ensureUserProgressDocument(userId) {
  const progressRef = doc(db, 'userProgress', userId);
  const snap = await getDoc(progressRef);
  if (!snap.exists()) {
    await setDoc(progressRef, {
      solved_projects: [],
      solved_internships: []
    });
  }
  return progressRef;
}