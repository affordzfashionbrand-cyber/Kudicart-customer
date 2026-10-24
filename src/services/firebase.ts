import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase Client Configuration for Affordz / KudiKart (Project: kudikart-3ec2e)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoAffordzClientKey2026',
  authDomain: 'kudikart-3ec2e.firebaseapp.com',
  projectId: 'kudikart-3ec2e',
  storageBucket: 'kudikart-3ec2e.appspot.com',
  messagingSenderId: '891240192841',
  appId: '1:891240192841:web:affordzcustomerapp2026',
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
