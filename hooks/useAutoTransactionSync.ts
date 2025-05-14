import { useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useTransactionStore } from "@/stores/transaction-store";
import { syncTransactions } from "@/stores/transaction-sync";

interface UseAutoTransactionSyncProps {
  userId: string;
  jwt: string;
}

export function useAutoTransactionSync({
  userId,
  jwt,
}: UseAutoTransactionSyncProps) {
  const isSyncing = useTransactionStore((s) => s.isSyncing);
  const lastSync = useTransactionStore((s) => s.lastSync);
  const setSyncState = useTransactionStore((s) => s.setSyncState);
  const hasSyncedOnMount = useRef(false);

  const { fetchTransactions } = useTransactionStore();

  // Helper to trigger sync
  const triggerSync = async () => {
    if (!userId || !jwt || isSyncing) return;
    setSyncState({ isSyncing: true, syncError: null });
    const result = await syncTransactions({
      userId,
      jwt,
      lastSync: 0,
    });
    setSyncState({
      isSyncing: false,
      lastSync: result.success ? result.lastSync : lastSync,
      syncError: result.success ? null : result.error,
    });
    fetchTransactions();
  };

  // Sync on mount (app start)
  useEffect(() => {
    if (!hasSyncedOnMount.current && userId && jwt) {
      hasSyncedOnMount.current = true;
      triggerSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, jwt]);

  // Sync on network reconnect
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("state", state);
      if (state.isConnected && state.isInternetReachable && userId && jwt) {
        //todo: this is triggering alot
        // alert("triggering sync netinfo");
        setTimeout(() => {
          triggerSync();
        }, 1000);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, jwt]);
}
