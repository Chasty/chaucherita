import { Model } from "@nozbe/watermelondb";
import { field, date, writer } from "@nozbe/watermelondb/decorators";

export default class Transaction extends Model {
  static table = "transactions";

  @field("user_id") userId;
  @field("amount") amount;
  @field("type") type;
  @field("category") category;
  @field("description") description;
  @field("date") date;
  @field("tags") tags; // JSON string
  @field("notes") notes;
  @field("created_at") createdAt; // now a number (timestamp)
  @field("updated_at") updatedAt; // now a number (timestamp)
  @field("sync_status") syncStatus;
  @field("version") version;

  // Helper to get tags as array
  get tagsArray() {
    try {
      return this.tags ? JSON.parse(this.tags) : [];
    } catch {
      return [];
    }
  }

  // Mark as synced
  @writer async markSynced() {
    await this.update((tx) => {
      tx.syncStatus = "synced";
    });
  }
}
