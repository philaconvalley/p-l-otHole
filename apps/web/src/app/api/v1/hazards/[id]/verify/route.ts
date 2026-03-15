export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, errors } from "@/lib/api";
import { requireAuth, AuthError } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/v1/hazards/[id]/verify — in-person verification (+15 rep)
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: hazardId } = await context.params;
    const user = await requireAuth(request);

    const hazard = await db.hazard.findUnique({
      where: { id: hazardId, deletedAt: null },
      select: { id: true, createdByUserId: true },
    });
    if (!hazard) return errors.notFound("Hazard");

    // Prevent self-verification
    if (hazard.createdByUserId === user.id) {
      return errors.forbidden("You cannot verify your own report");
    }

    // One verification per user per hazard — use a vote with value 0 as sentinel
    const existing = await db.vote.findFirst({
      where: { userId: user.id, hazardId, value: 0 },
    });
    if (existing) {
      return errors.conflict("CONFLICTING_VOTE", "You have already verified this hazard");
    }

    // Record verification as a vote(value=0) so we can deduplicate
    await db.vote.create({
      data: { userId: user.id, hazardId, targetType: "hazard", value: 0 },
    });

    // Bump verificationScore on the earliest open report
    const report = await db.report.findFirst({
      where: { hazardId, status: { not: "rejected" } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (report) {
      await db.report.update({
        where: { id: report.id },
        data: { verificationScore: { increment: 1 } },
      });
    }

    // Award +15 reputation to verifier
    await db.user.update({
      where: { id: user.id },
      data: { reputationScore: { increment: 15 } },
    });

    return apiSuccess({ verified: true, reputationAwarded: 15 });
  } catch (error) {
    if (error instanceof AuthError) return errors.unauthorized(error.message);
    console.error("POST /hazards/[id]/verify error:", error);
    return errors.internal();
  }
}
