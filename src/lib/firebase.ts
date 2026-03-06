import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCvX8znbelmAvQvfrZUyuhMRzDqIilHr5I",
  authDomain: "baza-znan-viyar.firebaseapp.com",
  projectId: "baza-znan-viyar",
  storageBucket: "baza-znan-viyar.firebasestorage.app",
  messagingSenderId: "173051062546",
  appId: "1:173051062546:web:ff93b6a706c38a135eebcb",
  measurementId: "G-MWQS6GMHYN"
};

const app = initializeApp(firebaseConfig);

// Enable debug logging
import { setLogLevel } from "firebase/app";
setLogLevel('debug'); // Keep debug for now to see issues

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Enable Long Polling again to fix "super slow" loading caused by proxy/firewall blocking WebSockets
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const storage = getStorage(app);

// Analytics safe initialization
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(console.error);
}
