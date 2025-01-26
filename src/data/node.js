import fs from "fs";
import axios from "axios";
import pkg from "pg";
const { Pool } = pkg;

// Create a connection pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "tripcraft",
  password: "01017893980",
  port: 3306,
});

// Function to check if image exists
async function checkImageExists(imageUrl) {
  try {
    const response = await axios.head(imageUrl);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Function to insert trip into database
async function insertTrip(trip) {
  const query = `
    INSERT INTO trip (
      name, description, image, location, category, 
      price, old_price,rating, country, time, date, trip_amount
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id;
  `;

  const values = [
    trip.name,
    trip.description,
    trip.image,
    trip.location,
    trip.category,
    trip.price,
    trip.old_price,
    trip.rating,
    trip.country,
    trip.time,
    trip.date, // Convert DD-MM-YYYY to YYYY-MM-DD
    trip.trip_amount,
  ];

  try {
    const result = await pool.query(query, values);
    console.log(`Inserted trip: ${trip.name} with ID: ${result.rows[0].id}`);
    return true;
  } catch (error) {
    console.error(`Error inserting trip ${trip.name}:`, error);
    return false;
  }
}

async function main() {
  try {
    // Read destinations file
    const rawData = fs.readFileSync("destinations.json");
    const destinations = JSON.parse(rawData);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each destination
    for (const trip of destinations) {
      console.log(`Processing trip: ${trip.name}`);

      // Check if image exists
      const imageExists = await checkImageExists(trip.image);

      if (imageExists) {
        const inserted = await insertTrip(trip);
        if (inserted) {
          successCount++;
        } else {
          errorCount++;
        }
      } else {
        console.log(`Skipping trip ${trip.name} - Image not accessible`);
        skipCount++;
      }
    }

    // Log summary
    console.log("\nProcessing completed:");
    console.log(`Successfully inserted: ${successCount} trips`);
    console.log(`Skipped (invalid images): ${skipCount} trips`);
    console.log(`Errors: ${errorCount} trips`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close pool
    await pool.end();
  }
}

// Run the script
main().catch(console.error);
