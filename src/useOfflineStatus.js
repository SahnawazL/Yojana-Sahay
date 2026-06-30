/**
 * useOfflineStatus.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns true when the device has no internet connection.
 * Uses the browser's `navigator.onLine` API + window online/offline events.
 *
 * Usage:
 *   import { useOfflineStatus } from "./useOfflineStatus";
 *   const isOffline = useOfflineStatus();
 */

import { useState, useEffect } from "react";

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline  = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online",  handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online",  handleOnline);
    };
  }, []);

  return isOffline;
}
