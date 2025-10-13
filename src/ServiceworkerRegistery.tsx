import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useState } from "react";
import {
  requestNotificationPermission,
  onMessageListener,
} from "./lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./lib/firebase";
import { Bell, BellOff } from "lucide-react";

export function ProductivityHub() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Record<
    string,
    string
  > | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered:", r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  // Initialize FCM
  useEffect(() => {
    const initFCM = async () => {
      const token = await requestNotificationPermission();
      if (token) {
        setFcmToken(token);
        setNotificationsEnabled(true);

        // Save token to Firestore
        await addDoc(collection(db, "fcmTokens"), {
          token,
          timestamp: new Date(),
          userAgent: navigator.userAgent,
        });
      }
    };

    initFCM();

    // Listen for foreground messages
    onMessageListener()
      .then((payload) => {
        console.log("Received foreground message:", payload);
        setNotification({
          title: payload.notification?.title,
          body: payload.notification?.body,
        });

        // Auto-dismiss after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      })
      .catch((err) => console.log("Failed to receive message:", err));
  }, []);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const token = await requestNotificationPermission();
      if (token) {
        setFcmToken(token);
        setNotificationsEnabled(true);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <>
      {/* Update Available Banner */}
      {needRefresh && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 flex justify-between items-center">
          <span>New version available!</span>
          <div className="flex gap-2">
            <button
              onClick={() => updateServiceWorker(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium"
            >
              Update
            </button>
            <button
              onClick={close}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Offline Ready Banner */}
      {offlineReady && (
        <div className="fixed top-0 left-0 right-0 bg-green-600 text-white p-4 z-50 flex justify-between items-center">
          <span>App is ready to work offline!</span>
          <button
            onClick={close}
            className="bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            OK
          </button>
        </div>
      )}

      {/* Foreground Notification */}
      {notification && (
        <div className="fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 z-50 max-w-sm border-l-4 border-purple-600">
          <h3 className="font-bold text-lg">{notification.title}</h3>
          <p className="text-gray-600">{notification.body}</p>
        </div>
      )}

      {/* Notification Toggle Button */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={toggleNotifications}
          className={`p-3 rounded-full shadow-lg transition-colors ${
            notificationsEnabled
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-600"
          }`}
          title={
            notificationsEnabled
              ? "Notifications Enabled"
              : "Enable Notifications"
          }
        >
          {notificationsEnabled ? (
            <Bell className="w-6 h-6" />
          ) : (
            <BellOff className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* FCM Token Display (for testing) */}
      {fcmToken && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white text-xs p-2 rounded max-w-xs truncate z-40">
          Token: {fcmToken.slice(0, 30)}...
        </div>
      )}
    </>
  );
}
