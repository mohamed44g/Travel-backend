import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;
import { promises as fs } from "fs";

dotenv.config();

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_jv7QaNKUVB0H@ep-odd-breeze-a8cimnbo-pooler.eastus2.azure.neon.tech/Tripcraft?sslmode=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

async function main() {
  try {
    const client = await pool.connect();
    console.log("Test connection successful");

    const connectionDetails = {
      host: client.host,
      port: client.port,
      database: client.database,
    };
    console.log("Connection Details:", connectionDetails);

    client.release();

    const data = await fs.readFile("./destinations.json", "utf-8");
    const destinations = JSON.parse(data);

    await insertDestinations(destinations);
  } catch (error) {
    console.error("Full Error Details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors,
    });
  } finally {
    await pool.end();
  }
}

async function insertDestinations(destinations) {
  for (const destination of destinations) {
    const query = `
      INSERT INTO trip (
        name, description, image, location, category, 
        price, old_price, rating, country, time, date, trip_amount
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id;
    `;

    try {
      const result = await pool.query(query, [
        destination.name,
        destination.description,
        destination.image,
        destination.location,
        destination.category,
        destination.price,
        destination.old_price,
        destination.rating,
        destination.country,
        destination.time,
        destination.date,
        destination.trip_amount,
      ]);
      console.log(`Inserted destination with ID: ${result.rows[0].id}`);
    } catch (error) {
      console.error("Insert Error:", error);
    }
  }
}

main();
