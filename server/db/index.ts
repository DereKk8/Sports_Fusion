import { drizzle } from "drizzle-orm/singlestore";
import mysql from "mysql2/promise";

// Create a connection factory
export async function createConnection() {
  return await mysql.createConnection({
    host: process.env.SINGLESTORE_HOST,
    user: process.env.SINGLESTORE_USER,
    database: process.env.SINGLESTORE_DATABASE,
    port: parseInt(process.env.SINGLESTORE_PORT || "3306"),
    password: process.env.SINGLESTORE_PASSWORD,
    ssl: {},
    maxIdle: 0
  });
}

// Singleton to prevent multiple connections
let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!db) {
    const connection = await createConnection();
    db = drizzle({ client: connection });
  }
  return db;
}

// For compatibility with existing code
// eslint-disable-next-line import/no-anonymous-default-export
export default { getDb };