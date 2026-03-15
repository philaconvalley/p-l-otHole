import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { errors, handleZodError } from "@/lib/api";
import { exportQuerySchema } from "@/lib/schemas";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

// GET /api/v1/exports/geojson - Export hazards as GeoJSON
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = exportQuerySchema.parse(searchParams);

    // Build where clause
    const where: Prisma.HazardWhereInput = {
      deletedAt: null,
    };

    if (query.city) {
      where.cityCode = query.city;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.repairStatus) {
      where.repairStatus = query.repairStatus;
    }
    if (query.updatedSince) {
      where.updatedAt = { gte: new Date(query.updatedSince) };
    }

    // Fetch hazards (limit to 10000 for performance)
    const hazards = await db.hazard.findMany({
      where,
      take: 10000,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        latitude: true,
        longitude: true,
        severityScore: true,
        upvotes: true,
        downvotes: true,
        reportsCount: true,
        repairStatus: true,
        cityTicketId: true,
        cityCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Build GeoJSON FeatureCollection
    const geojson = {
      type: "FeatureCollection",
      features: hazards.map((h) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [Number(h.longitude), Number(h.latitude)],
        },
        properties: {
          id: h.id,
          name: h.name,
          slug: h.slug,
          description: h.description,
          type: h.type,
          severityScore: h.severityScore,
          upvotes: h.upvotes,
          downvotes: h.downvotes,
          reportsCount: h.reportsCount,
          repairStatus: h.repairStatus,
          cityTicketId: h.cityTicketId,
          cityCode: h.cityCode,
          createdAt: h.createdAt.toISOString(),
          updatedAt: h.updatedAt.toISOString(),
        },
      })),
    };

    return new NextResponse(JSON.stringify(geojson, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/geo+json",
        "Content-Disposition": `attachment; filename="hazards-${Date.now()}.geojson"`,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error);
    }
    console.error("GET /exports/geojson error:", error);
    return errors.internal();
  }
}
