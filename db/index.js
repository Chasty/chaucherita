import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { mySchema } from "./schema";
import Transaction from "./Transaction";
import { schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";

const adapter = new SQLiteAdapter({
  schema: mySchema,
  dbName: "chaucherita",
  actionsEnabled: true,
  jsi: true, // Use JSI for better performance if available
  migrations: schemaMigrations({ migrations: [] }), // Use schemaMigrations helper
});

export const database = new Database({
  adapter,
  modelClasses: [Transaction],
  actionsEnabled: true,
});

//console.log("database:", database);

//console.log("database.action:", typeof database.action);
