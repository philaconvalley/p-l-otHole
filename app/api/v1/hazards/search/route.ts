import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiPaginated, errors, handleZodError, decodeCursor, encodeCursor } from "@/lib/api";
import { searchHazardsQuerySchema } from "@/lib/schemas";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

interface HazardWithDistance {
  id: string;
  name: string | null;
  slug: string | null;
  type: string;
  latitude: Prisma.Decimal;
  longitude: Prisma.Decimal;
  severity_score: number;
  upvotes: number;
  downvotes: number;
  reports_count: number;
  repair_status: string;
  distance_meters: number;
}

// GET /api/v1/hazards/search - Search hazards by radius
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = searchHazardsQuerySchema.parse(searchParams);

    // Build type/status filters for raw query
    const typeFilter = query.type ? Prisma.sql`AND type = ${query.type}::hazard_type` : Prisma.empty;
    const statusFilter = query.repairStatus
      ? Prisma.sql`AND repair_status = ${query.repairStatus}::repair_status`
      : Prisma.empty;

    // Handle cursor pagination
    const cursor = decodeCursor(query.cursor ?? null);
    const cursorFilter = cursor?.distance && cursor?.id
      ? Prisma.sql`AND (
          ST_Distance(location, ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography) > ${cursor.distance}
          OR (
            ST_Distance(location, ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography) = ${cursor.distance}
            AND id > ${cursor.id}
          )
        )`
      : Prisma.empty;

    // Use raw SQL for PostGIS radius search
    const hazards = await db.$queryRaw<HazardWithDistance[]>`
      SELECT
        id,
        name,
        slug,
        type::text,
        latitude,
        longitude,
        severity_score,
        upvotes,
        downvotes,
        reports_count,
        repair_status::text,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography
        ) AS distance_meters
      FROM hazards
      WHERE deleted_at IS NULL
        AND location IS NOT NULL
        AND ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint(${query.lng}, ${query.lat}), 4326)::geography,
          ${query.radiusMeters}
        )
        ${typeFilter}
        ${statusFilter}
        ${cursorFilter}
      ORDER BY distance_meters ASC, id ASC
      LIMIT ${query.limit + 1}
    `;

    const hasMore = hazards.length > query.limit;
    const results = hasMore ? hazards.slice(0, -1) : hazards;
    const lastItem = results[results.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? encodeCursor({ distance: lastItem.distance_meters, id: lastItem.id })
        : null;

    // Transform response
    const data = results.map((h) => ({
      id: h.id,
      name: h.name,
      slug: h.slug,
      type: h.type,
      location: {
        latitude: Number(h.latitude),
        longitude: Number(h.longitude),
      },
      distanceMeters: Math.round(h.distance_meters * 10) / 10,
      severityScore: h.severity_score,
      votes: {
        up: h.upvotes,
        down: h.downvotes,
      },
      reportsCount: h.reports_count,
      repairStatus: h.repair_status,
    }));

    return apiPaginated(data, nextCursor, hasMore);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error);
    }
    console.error("GET /hazards/search error:", error);
    return errors.internal();
  }
}
