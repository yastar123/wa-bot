import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// For development without a database, we'll use a mock connection
// In production, you should set up a proper PostgreSQL database
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/whatsapp_dashboard";

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema });
