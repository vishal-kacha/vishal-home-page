import { useRegisterSW } from "virtual:pwa-register/react";

export function ProductivityHub() {
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

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
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
    </div>
  );
}
