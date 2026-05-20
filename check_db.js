const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = (process.env.DATABASE_URL ?? '').replace('?sslmode=require', '').replace('&sslmode=require', '');
console.log("DB string present:", !!connectionString);

const pool = new Pool({ 
  connectionString, 
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, name, slug, price FROM "Product" LIMIT 20');
    console.log("Products in DB:");
    console.log(res.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
