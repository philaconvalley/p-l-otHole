export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, errors } from "@/lib/api";
import { requireAuth, isModerator, AuthError } from "@/lib/auth";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const actionSchema = z.object({
  action: z.enum(["verify", "reject"]),
});

// PATCH /api/v1/admin/reports/[id] — moderator approve/reject
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireAuth(request);
    if (!isModerator(user)) return errors.forbidden("Moderators only");

    const { action } = actionSchema.parse(await request.json());

    const report = await db.report.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!report) return errors.notFound("Report");

    const status = action === "verify" ? "verified" : "rejected";
    await db.report.update({
      where: { id },
      data: {
        status,
        verifiedAt: action === "verify" ? new Date() : null,
      },
    });

    return apiSuccess({ id, status });
  } catch (error) {
    if (error instanceof AuthError) return errors.unauthorized(error.message);
    console.error("PATCH /admin/reports/[id] error:", error);
    return errors.internal();
  }
}
