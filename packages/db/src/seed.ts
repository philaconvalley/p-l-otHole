/**
 * Seed script — inserts sample Philadelphia hazards for local dev and demo.
 * Safe to run multiple times (upserts on slug).
 */
import { sql } from "./client.js";

const hazards = [
  {
    name: "The Fairmount Fissure",
    slug: "the-fairmount-fissure",
    description: "Long crack spanning both lanes near the park entrance.",
    type: "crack",
    lat: 39.9712,
    lng: -75.1832,
    repairStatus: "reported",
    cityCode: "PHL",
    severityScore: 45,
  },
  {
    name: "Lake Broad Street",
    slug: "lake-broad-street",
    description: "Water collects here after any rain. Axle-deep on a bad day.",
    type: "pothole",
    lat: 39.952,
    lng: -75.1638,
    repairStatus: "acknowledged",
    cityCode: "PHL",
    severityScore: 78,
  },
  {
    name: "The Manayunk Maw",
    slug: "the-manayunk-maw",
    description: "Sinkhole opening up near the canal path.",
    type: "sinkhole",
    lat: 40.0279,
    lng: -75.2246,
    repairStatus: "in_progress",
    cityCode: "PHL",
    severityScore: 91,
  },
  {
    name: "South Street Swallower",
    slug: "south-street-swallower",
    description: "Debris-filled trench from last winter's water main break.",
    type: "debris",
    lat: 39.9429,
    lng: -75.1628,
    repairStatus: "reported",
    cityCode: "PHL",
    severityScore: 62,
  },
  {
    name: "Passyunk Puddle Trap",
    slug: "passyunk-puddle-trap",
    description: "Drainage failure — permanent standing water hazard.",
    type: "drainage",
    lat: 39.9291,
    lng: -75.1719,
    repairStatus: "scheduled",
    cityCode: "PHL",
    severityScore: 55,
  },
];

async function seed() {
  for (const h of hazards) {
    await sql`
      INSERT INTO hazards (
        name, slug, description, type, location,
        repair_status, city_code, severity_score
      ) VALUES (
        ${h.name},
        ${h.slug},
        ${h.description},
        ${h.type}::hazard_type,
        ST_SetSRID(ST_MakePoint(${h.lng}, ${h.lat}), 4326)::geography,
        ${h.repairStatus}::repair_status,
        ${h.cityCode},
        ${h.severityScore}
      )
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log(`  seeded  ${h.name}`);
  }

  console.log("Seed complete.");
  await sql.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
