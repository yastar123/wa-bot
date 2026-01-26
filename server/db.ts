import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Use Supabase PostgreSQL database from environment variable
const DATABASE_URL = process.env.DATABASE_URL;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

// Try to connect to database, fallback to null if fails
if (DATABASE_URL) {
  try {
    pool = new Pool({ 
      connectionString: DATABASE_URL,
      connectionTimeoutMillis: 5000,
    });
    db = drizzle(pool, { schema });
    console.log("Database connection configured");
  } catch (error) {
    console.warn("Failed to connect to database, using fallback storage:", error);
    pool = null;
    db = null;
  }
} else {
  console.warn("DATABASE_URL not set, using fallback storage");
}

export { pool, db };
