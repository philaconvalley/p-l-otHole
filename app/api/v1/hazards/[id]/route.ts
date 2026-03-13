import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, errors, handleZodError } from "@/lib/api";
import { requireAuth, canModify, isModerator, AuthError } from "@/lib/auth";
import { updateHazardSchema } from "@/lib/schemas";
import { generateUniqueSlug } from "@/lib/slug";
import { ZodError } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/v1/hazards/[id] - Get a single hazard by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const hazard = await db.hazard.findUnique({
      where: { id, deletedAt: null },
      include: {
        createdBy: {
          select: { id: true, username: true },
        },
      },
    });

    if (!hazard) {
      return errors.notFound("Hazard");
    }

    // Calculate days open
    const daysOpen = Math.floor(
      (Date.now() - hazard.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate vote velocity (votes per day over last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentVotes = await db.vote.count({
      where: {
        hazardId: id,
        createdAt: { gte: weekAgo },
      },
    });
    const voteVelocity = Math.round((recentVotes / 7) * 10) / 10;

    return apiSuccess({
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
      cityCode: hazard.cityCode,
      daysOpen,
      voteVelocity,
      createdBy: hazard.createdBy
        ? { id: hazard.createdBy.id, username: hazard.createdBy.username }
        : null,
      createdAt: hazard.createdAt.toISOString(),
      updatedAt: hazard.updatedAt.toISOString(),
      resolvedAt: hazard.resolvedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("GET /hazards/[id] error:", error);
    return errors.internal();
  }
}

// PATCH /api/v1/hazards/[id] - Update a hazard (owner or moderator)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireAuth(request);

    // Find the hazard
    const hazard = await db.hazard.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, name: true, createdByUserId: true },
    });

    if (!hazard) {
      return errors.notFound("Hazard");
    }

    // Check permission
    if (!canModify(user, hazard.createdByUserId)) {
      return errors.forbidden("You can only edit hazards you created");
    }

    // Parse and validate body
    const body = await request.json();
    const input = updateHazardSchema.parse(body);

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
      // Regenerate slug if name changed
      updateData.slug = await generateUniqueSlug(input.name);
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    if (input.repairStatus !== undefined) {
      // Only moderators can change repair status
      if (!isModerator(user)) {
        return errors.forbidden("Only moderators can change repair status");
      }
      updateData.repairStatus = input.repairStatus;
      // Set resolvedAt if status is resolved
      if (input.repairStatus === "resolved") {
        updateData.resolvedAt = new Date();
      }
    }
    if (input.cityTicketId !== undefined) {
      // Only moderators can set city ticket ID
      if (!isModerator(user)) {
        return errors.forbidden("Only moderators can set city ticket ID");
      }
      updateData.cityTicketId = input.cityTicketId;
    }

    // Update the hazard
    const updated = await db.hazard.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess({
      id: updated.id,
      slug: updated.slug,
      name: updated.name,
      description: updated.description,
      type: updated.type,
      repairStatus: updated.repairStatus,
      cityTicketId: updated.cityTicketId,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errors.unauthorized(error.message);
    }
    if (error instanceof ZodError) {
      return handleZodError(error);
    }
    console.error("PATCH /hazards/[id] error:", error);
    return errors.internal();
  }
}

// DELETE /api/v1/hazards/[id] - Soft-delete a hazard (moderator only)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireAuth(request);

    // Only moderators can delete
    if (!isModerator(user)) {
      return errors.forbidden("Only moderators can delete hazards");
    }

    // Find the hazard
    const hazard = await db.hazard.findUnique({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!hazard) {
      return errors.notFound("Hazard");
    }

    // Soft delete
    await db.hazard.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) {
      return errors.unauthorized(error.message);
    }
    console.error("DELETE /hazards/[id] error:", error);
    return errors.internal();
  }
}
