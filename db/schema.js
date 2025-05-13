import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "transactions",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "amount", type: "number" },
        { name: "type", type: "string" },
        { name: "category", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "date", type: "string" },
        { name: "tags", type: "string", isOptional: true }, // store as JSON string
        { name: "notes", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "sync_status", type: "string" }, // created, updated, deleted, synced
        { name: "version", type: "number", isOptional: true },
      ],
    }),
  ],
});
