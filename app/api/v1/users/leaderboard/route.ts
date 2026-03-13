import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, errors, handleZodError } from "@/lib/api";
import { z } from "zod";
import { ZodError } from "zod";

const leaderboardQuerySchema = z.object({
  period: z.enum(["weekly", "monthly", "all_time"]).default("all_time"),
  city: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// GET /api/v1/users/leaderboard - Get ranked users
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = leaderboardQuerySchema.parse(searchParams);

    // For all_time, just use reputation score
    // For weekly/monthly, we'd need to track points over time (simplified here)
    const users = await db.user.findMany({
      where: {
        isBanned: false,
      },
      orderBy: { reputationScore: "desc" },
      take: query.limit,
      select: {
        id: true,
        username: true,
        reputationScore: true,
        reportsSubmitted: true,
        votesCast: true,
      },
    });

    const data = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      reputationScore: user.reputationScore,
      reportsSubmitted: user.reportsSubmitted,
      votesCast: user.votesCast,
    }));

    return apiSuccess(data);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error);
    }
    console.error("GET /users/leaderboard error:", error);
    return errors.internal();
  }
}
