import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, errors } from "@/lib/api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/v1/users/[id] - Get a public user profile
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        reputationScore: true,
        reportsSubmitted: true,
        votesCast: true,
        badges: true,
        isModerator: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errors.notFound("User");
    }

    return apiSuccess({
      id: user.id,
      username: user.username,
      reputationScore: user.reputationScore,
      reportsSubmitted: user.reportsSubmitted,
      votesCast: user.votesCast,
      badges: user.badges,
      isModerator: user.isModerator,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("GET /users/[id] error:", error);
    return errors.internal();
  }
}
