// @ts-nocheck
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const url = (process.env.DATABASE_URL ?? "")
  .replace("?sslmode=require", "")
  .replace("&sslmode=require", "");

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
    adapter: new PrismaPg(pool),
  },
});
