import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiPaginated,
  errors,
  handleZodError,
  decodeCursor,
  encodeCursor,
} from "@/lib/api";
import { requireAuth, AuthError } from "@/lib/auth";
import { createHazardSchema, listHazardsQuerySchema } from "@/lib/schemas";
import { generateUniqueSlug } from "@/lib/slug";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

// GET /api/v1/hazards - List hazards with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = listHazardsQuerySchema.parse(searchParams);

    // Build where clause
    const where: Prisma.HazardWhereInput = {
      deletedAt: null,
    };

    if (query.type) {
      where.type = query.type;
    }
    if (query.repairStatus) {
      where.repairStatus = query.repairStatus;
    }
    if (query.city) {
      where.cityCode = query.city;
    }

    // Build order by
    let orderBy: Prisma.HazardOrderByWithRelationInput;
    switch (query.sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "severity":
        orderBy = { severityScore: "desc" };
        break;
      case "most_voted":
        orderBy = { upvotes: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    // Handle cursor pagination
    const cursor = decodeCursor(query.cursor ?? null);
    const cursorCondition = cursor?.id
      ? { id: { lt: cursor.id as string } }
      : {};

    // Fetch one extra to check if there are more
    const hazards = await db.hazard.findMany({
      where: { ...where, ...cursorCondition },
      orderBy,
      take: query.limit + 1,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        latitude: true,
        longitude: true,
        severityScore: true,
        upvotes: true,
        downvotes: true,
        reportsCount: true,
        repairStatus: true,
        cityCode: true,
        createdAt: true,
      },
    });

    const hasMore = hazards.length > query.limit;
    const results = hasMore ? hazards.slice(0, -1) : hazards;
    const lastItem = results[results.length - 1];
    const nextCursor = hasMore && lastItem ? encodeCursor({ id: lastItem.id }) : null;

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
      severityScore: h.severityScore,
      votes: {
        up: h.upvotes,
        down: h.downvotes,
      },
      reportsCount: h.reportsCount,
      repairStatus: h.repairStatus,
      cityCode: h.cityCode,
      createdAt: h.createdAt.toISOString(),
    }));

    return apiPaginated(data, nextCursor, hasMore);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error);
    }
    console.error("GET /hazards error:", error);
    return errors.internal();
  }
}

// POST /api/v1/hazards - Create a new hazard
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);

    // Parse and validate body
    const body = await request.json();
    const input = createHazardSchema.parse(body);

    // Generate unique slug from name
    const slug = await generateUniqueSlug(input.name);

    // Create the hazard
    const hazard = await db.hazard.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        type: input.type,
        latitude: input.latitude,
        longitude: input.longitude,
        images: input.images,
        cityCode: input.cityCode,
        createdByUserId: user.id,
        reportsCount: 1,
      },
    });

    // Also create the initial report
    await db.report.create({
      data: {
        hazardId: hazard.id,
        reporterUserId: user.id,
        description: input.description,
        imageUrls: input.images,
        sourceLatitude: input.latitude,
        sourceLongitude: input.longitude,
        status: "pending",
      },
    });

    // Increment user's report count
    await db.user.update({
      where: { id: user.id },
      data: { reportsSubmitted: { increment: 1 } },
    });

    return apiSuccess(
      {
        id: hazard.id,
        slug: hazard.slug,
        name: hazard.name,
        description: hazard.description,
        type: hazard.type,
        location: {
          latitude: Number(hazard.latitude),
          longitude: Number(hazard.longitude),
        },
        images: hazard.images,
        severityScore: hazard.severityScore,
        votes: {
          up: hazard.upvotes,
          down: hazard.downvotes,
        },
        reportsCount: hazard.reportsCount,
        repairStatus: hazard.repairStatus,
        cityTicketId: hazard.cityTicketId,
        createdAt: hazard.createdAt.toISOString(),
        updatedAt: hazard.updatedAt.toISOString(),
      },
      201
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return errors.unauthorized(error.message);
    }
    if (error instanceof ZodError) {
      return handleZodError(error);
    }
    console.error("POST /hazards error:", error);
    return errors.internal();
  }
}
