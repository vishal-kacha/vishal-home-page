// Import Firebase scripts for service worker
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyDwF5IkoNVJ5_IqzPcwkdgAQctSJOs9Z8A",
  authDomain: "vishal-home-page-55596.firebaseapp.com",
  projectId: "vishal-home-page-55596",
  storageBucket: "vishal-home-page-55596.firebasestorage.app",
  messagingSenderId: "903632524377",
  appId: "1:903632524377:web:335a6093231a9a9f2d8d48",
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload
  );

  const notificationTitle =
    payload.notification?.title || payload.data?.title || "New Notification";
  const notificationOptions = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "You have a new notification",
    icon: payload.notification?.icon || "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag: payload.data?.tag || "notification-" + Date.now(),
    data: payload.data,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: "open",
        title: "Open",
        icon: "/pwa-192x192.png",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification click received:", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Open app when notification is clicked
  event.waitUntil(clients.openWindow("/"));
});

// Handle push events (alternative method)
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received:", event);

  if (event.data) {
    const data = event.data.json();
    console.log("[Service Worker] Push data:", data);
  }
});
