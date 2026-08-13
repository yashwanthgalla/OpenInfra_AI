import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAu4OYIh4p3K74Tnk9CLlN4tqawW7JX0VE",
  authDomain: "openinfra45.firebaseapp.com",
  projectId: "openinfra45",
  storageBucket: "openinfra45.firebasestorage.app",
  messagingSenderId: "33403592662",
  appId: "1:33403592662:web:521a428e3b9e887b500e77",
  measurementId: "G-8RC57ZS9FG"
};

// Safe Firebase App Initialization (prevents app/duplicate-app errors on Vite HMR & soft reloads)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Safe Analytics Initialization
export const analyticsPromise = isSupported().then((supported) => {
  return supported ? getAnalytics(app) : null;
}).catch((err) => {
  console.warn("Firebase Analytics initialization warning:", err);
  return null;
});

export { getAnalytics };
export { getAuth };
export { initializeApp };
export { firebaseConfig };
export interface MockUser {
  email: string;
  uid: string;
}
export type User = MockUser;
