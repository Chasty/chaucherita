import { database } from "@/db/index";
import { synchronize } from "@nozbe/watermelondb/sync";

const API_URL_DEV = "http://localhost:5007/api/transactions"; // Change to your backend URL if needed
const API_URL_PROD = "https://chaucherita.onrender.com/api/transactions";

const API_URL = __DEV__ ? API_URL_DEV : API_URL_PROD;

export interface SyncResult {
  success: boolean;
  error?: string;
  pushed: number;
  pulled: number;
  lastSync: number;
}

/**
 * Syncs local changes to the backend and pulls remote changes using WatermelonDB's synchronize API.
 * @param userId - The current user's ID
 * @param jwt - The user's JWT for auth
 * @param lastSync - The last sync timestamp (number)
 * @returns SyncResult
 */
export async function syncTransactions({
  userId,
  jwt,
  lastSync,
}: {
  userId: string;
  jwt: string;
  lastSync: number;
}): Promise<SyncResult> {
  let pushed = 0;
  let pulled = 0;
  let newLastSync = Date.now();
  try {
    const result = await synchronize({
      database,
      pullChanges: async ({ lastPulledAt }) => {
        //alert("pullChanges");
        console.log(
          `${API_URL}/sync/pull?user_id=${userId}&last_pulled_at=${
            lastPulledAt || 0
          }`
        );
        console.log(jwt);
        // Fetch changes from backend in WatermelonDB sync protocol format
        const res = await fetch(
          `${API_URL}/sync/pull?user_id=${userId}&last_pulled_at=${
            lastPulledAt || 0
          }`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to pull remote changes");
        const { changes, timestamp } = await res.json();
        pulled = Object.values(changes.transactions?.updated || {}).length;
        newLastSync = timestamp;
        return { changes, timestamp };
      },
      pushChanges: async ({ changes, lastPulledAt }) => {
        //alert("pushChanges");
        console.log("push changes");
        console.log(
          "push changes",
          `${API_URL}/sync/push?user_id=${userId}&last_pulled_at=${
            lastPulledAt || 0
          }`
        );
        console.log("push changes", jwt);
        console.log("push changes", JSON.stringify({ changes }));
        // Push local changes to backend in WatermelonDB sync protocol format
        const res = await fetch(
          `${API_URL}/sync/push?user_id=${userId}&last_pulled_at=${
            lastPulledAt || 0
          }`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({ changes }),
          }
        );
        if (!res.ok) throw new Error("Failed to push local changes");
        const data = await res.json();
        pushed = data.pushed || 0;
      },
      migrationsEnabledAtVersion: 1,
    });
    return { success: true, pushed, pulled, lastSync: newLastSync };
  } catch (error: any) {
    //alert("error");
    console.error(error);
    return {
      success: false,
      error: error.message || "Sync failed",
      pushed,
      pulled,
      lastSync: newLastSync,
    };
  }
}
