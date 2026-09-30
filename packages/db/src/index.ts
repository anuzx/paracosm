import { config as loadEnv } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { resolve } from "node:path";
import { Pool } from "pg";

loadEnv({ path: resolve(import.meta.dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Expected it in packages/db/.env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({
  client: pool,
});

export { pool };
export * from "./db/schema";
