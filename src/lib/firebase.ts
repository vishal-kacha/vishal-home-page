import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDwF5IkoNVJ5_IqzPcwkdgAQctSJOs9Z8A",
  authDomain: "vishal-home-page-55596.firebaseapp.com",
  projectId: "vishal-home-page-55596",
  storageBucket: "vishal-home-page-55596.firebasestorage.app",
  messagingSenderId: "903632524377",
  appId: "1:903632524377:web:335a6093231a9a9f2d8d48",
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    console.log("Requesting notification permission...");
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted");

      // Register service worker first
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
          scope: "/firebase-cloud-messaging-push-scope",
        }
      );

      console.log("Service Worker registered:", registration);

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey:
          "BD8YDNTzfnm-0MevfLoKbyCUz-bIuRkacNbxzoXh8WGzK1EyCVBuOD6y29_AkLoqB6mdYb7iUCjiN3ju3rMIG5A",
        serviceWorkerRegistration: registration,
      });

      if (token) {
        console.log("FCM Token:", token);
        return token;
      } else {
        console.log("No registration token available");
        return null;
      }
    } else {
      console.log("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      resolve(payload);
    });
  });
