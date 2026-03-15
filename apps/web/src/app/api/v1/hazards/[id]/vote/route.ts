import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, errors, handleZodError } from "@/lib/api";
import { requireAuth, AuthError } from "@/lib/auth";
import { createVoteSchema } from "@/lib/schemas";
import { ZodError } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/v1/hazards/[id]/vote - Cast or update a severity vote
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: hazardId } = await context.params;
    const user = await requireAuth(request);

    // Verify hazard exists
    const hazard = await db.hazard.findUnique({
      where: { id: hazardId, deletedAt: null },
      select: { id: true, severityScore: true, upvotes: true },
    });

    if (!hazard) {
      return errors.notFound("Hazard");
    }

    // Parse and validate body
    const body = await request.json();
    const input = createVoteSchema.parse(body);

    // Check for existing vote
    const existingVote = await db.vote.findFirst({
      where: {
        userId: user.id,
        hazardId,
      },
    });

    let vote;
    let isNewVote = false;

    if (existingVote) {
      // Update existing vote
      vote = await db.vote.update({
        where: { id: existingVote.id },
        data: {
          value: input.value,
          note: input.note,
        },
      });
    } else {
      // Create new vote
      vote = await db.vote.create({
        data: {
          userId: user.id,
          hazardId,
          targetType: "hazard",
          value: input.value,
          note: input.note,
        },
      });
      isNewVote = true;

      // Increment user's vote count
      await db.user.update({
        where: { id: user.id },
        data: { votesCast: { increment: 1 } },
      });
    }

    // Recalculate severity score and upvotes for the hazard
    const voteStats = await db.vote.aggregate({
      where: { hazardId },
      _count: true,
      _avg: { value: true },
    });

    const avgValue = voteStats._avg.value ?? 0;
    const voteCount = voteStats._count;

    // Severity score: weighted average * vote count factor
    // More votes = higher confidence in severity
    const severityScore = Math.round(avgValue * Math.log2(voteCount + 1) * 10);

    // Count high votes (4-5) as upvotes, low votes (1-2) as downvotes
    const upvotes = await db.vote.count({
      where: { hazardId, value: { gte: 4 } },
    });
    const downvotes = await db.vote.count({
      where: { hazardId, value: { lte: 2 } },
    });

    // Update hazard stats
    await db.hazard.update({
      where: { id: hazardId },
      data: {
        severityScore,
        upvotes,
        downvotes,
      },
    });

    return apiSuccess({
      hazardId,
      oderId: user.id,
      value: vote.value,
      note: vote.note,
      isNewVote,
      severityScore,
      votedAt: vote.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errors.unauthorized(error.message);
    }
    if (error instanceof ZodError) {
      return handleZodError(error);
    }
    console.error("POST /hazards/[id]/vote error:", error);
    return errors.internal();
  }
}

// GET /api/v1/hazards/[id]/vote - Get current user's vote on a hazard
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: hazardId } = await context.params;
    const user = await requireAuth(request);

    const vote = await db.vote.findFirst({
      where: {
        userId: user.id,
        hazardId,
      },
    });

    if (!vote) {
      return errors.notFound("Vote");
    }

    return apiSuccess({
      hazardId,
      userId: user.id,
      value: vote.value,
      note: vote.note,
      votedAt: vote.createdAt.toISOString(),
      updatedAt: vote.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errors.unauthorized(error.message);
    }
    console.error("GET /hazards/[id]/vote error:", error);
    return errors.internal();
  }
}
