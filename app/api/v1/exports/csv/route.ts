import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { errors, handleZodError } from "@/lib/api";
import { exportQuerySchema } from "@/lib/schemas";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

// CSV escape helper
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// GET /api/v1/exports/csv - Export hazards as CSV
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
        slug: true,
        name: true,
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

    // Build CSV
    const headers = [
      "id",
      "slug",
      "name",
      "description",
      "type",
      "latitude",
      "longitude",
      "severity_score",
      "upvotes",
      "downvotes",
      "reports_count",
      "repair_status",
      "city_ticket_id",
      "city_code",
      "created_at",
      "updated_at",
    ];

    const rows = hazards.map((h) =>
      [
        h.id,
        h.slug,
        h.name,
        h.description,
        h.type,
        h.latitude,
        h.longitude,
        h.severityScore,
        h.upvotes,
        h.downvotes,
        h.reportsCount,
        h.repairStatus,
        h.cityTicketId,
        h.cityCode,
        h.createdAt.toISOString(),
        h.updatedAt.toISOString(),
      ]
        .map(escapeCSV)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="hazards-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error);
    }
    console.error("GET /exports/csv error:", error);
    return errors.internal();
  }
}
