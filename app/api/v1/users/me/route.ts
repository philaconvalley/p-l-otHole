import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, errors } from "@/lib/api";
import { requireAuth, AuthError } from "@/lib/auth";

// GET /api/v1/users/me - Get the authenticated user's profile
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await requireAuth(request);

    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        username: true,
        email: true,
        reputationScore: true,
        reportsSubmitted: true,
        votesCast: true,
        badges: true,
        isModerator: true,
        createdAt: true,
        lastActiveAt: true,
      },
    });

    if (!user) {
      return errors.notFound("User");
    }

    // Update last active timestamp
    await db.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    return apiSuccess({
      id: user.id,
      username: user.username,
      email: user.email,
      reputationScore: user.reputationScore,
      reportsSubmitted: user.reportsSubmitted,
      votesCast: user.votesCast,
      badges: user.badges,
      isModerator: user.isModerator,
      createdAt: user.createdAt.toISOString(),
      lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errors.unauthorized(error.message);
    }
    console.error("GET /users/me error:", error);
    return errors.internal();
  }
}
