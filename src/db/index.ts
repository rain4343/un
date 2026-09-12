import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type AppDatabase = PostgresJsDatabase<typeof schema>;

let cached: AppDatabase | undefined;

export function getDb(): AppDatabase {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!cached) {
    cached = drizzle(postgres(connectionString, { max: 10 }), { schema });
  }
  return cached;
}

export { schema };
