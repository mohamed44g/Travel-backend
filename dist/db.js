import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;
dotenv.config();
// const pool = new Pool({
//   host: "ep-odd-breeze-a8cimnbo.eastus2.azure.neon.tech",
//   database: "Tripcraft",
//   username: "neondb_owner",
//   password: "npg_jv7QaNKUVB0H",
//   port: 5432,
//   ssl: {
//     require: true,
//   },
// });
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
export default pool;
