import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'singlestore',
  schema: './server/db/schema.ts',
  dbCredentials: {
    host: process.env.SINGLESTORE_HOST || "",
    user: process.env.SINGLESTORE_USER || "",
    password: process.env.SINGLESTORE_PASSWORD || "",
    database: process.env.SINGLESTORE_DATABASE || "",
    port: parseInt(process.env.SINGLESTORE_PORT || "3333"),
    ssl: {},
  },
});

