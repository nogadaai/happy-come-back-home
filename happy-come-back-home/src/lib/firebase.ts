import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Next.js 환경(SSR)에서 중복 초기화 방지
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * 사용자 검색 이력을 Firestore에 저장
 */
export async function addSearchHistory(from: string, to: string, timeMinutes: number) {
  try {
    await addDoc(collection(db, "search_history"), {
      from,
      to,
      timeMinutes,
      timestamp: serverTimestamp(),
    });
    console.log("[Firebase] Search history saved successfully");
  } catch (e) {
    console.error("[Firebase] Failed to save search history:", e);
  }
}

