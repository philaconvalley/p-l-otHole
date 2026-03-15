import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, errors } from "@/lib/api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/v1/users/[id]/badges - Get badge progress and earned badges
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: userId } = await context.params;

    // Check user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        reputationScore: true,
        reportsSubmitted: true,
        votesCast: true,
      },
    });

    if (!user) {
      return errors.notFound("User");
    }

    // Get earned badges
    const earnedBadges = await db.userBadge.findMany({
      where: { userId },
      include: {
        badge: {
          select: {
            code: true,
            name: true,
            tier: true,
            description: true,
          },
        },
      },
      orderBy: { earnedAt: "desc" },
    });

    // Get all active badges for progress tracking
    const allBadges = await db.badge.findMany({
      where: { isActive: true },
      orderBy: { tier: "asc" },
    });

    const earnedCodes = new Set(earnedBadges.map((eb) => eb.badge.code));

    // Calculate progress for unearned badges
    const progress = allBadges
      .filter((badge) => !earnedCodes.has(badge.code))
      .map((badge) => {
        const criteria = badge.criteria as Record<string, number>;
        let current = 0;
        let target = 0;

        if (criteria.reports_submitted) {
          current = user.reportsSubmitted;
          target = criteria.reports_submitted;
        } else if (criteria.votes_cast) {
          current = user.votesCast;
          target = criteria.votes_cast;
        } else if (criteria.reputation_score) {
          current = user.reputationScore;
          target = criteria.reputation_score;
        }

        return {
          id: badge.code,
          name: badge.name,
          tier: badge.tier,
          description: badge.description,
          current,
          target,
          progress: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0,
        };
      })
      .filter((p) => p.target > 0);

    return apiSuccess({
      userId,
      earned: earnedBadges.map((eb) => ({
        id: eb.badge.code,
        name: eb.badge.name,
        tier: eb.badge.tier,
        description: eb.badge.description,
        earnedAt: eb.earnedAt.toISOString(),
      })),
      progress,
    });
  } catch (error) {
    console.error("GET /users/[id]/badges error:", error);
    return errors.internal();
  }
}
