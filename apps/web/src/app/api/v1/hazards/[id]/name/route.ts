export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, errors } from "@/lib/api";
import { requireAuth, AuthError } from "@/lib/auth";
import { generateUniqueSlug } from "@/lib/slug";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const nameSchema = z.object({
  name: z.string().min(2).max(120).trim(),
});

// POST /api/v1/hazards/[id]/name — community name proposal (any auth'd user)
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireAuth(request);

    const hazard = await db.hazard.findUnique({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!hazard) return errors.notFound("Hazard");

    const { name } = nameSchema.parse(await request.json());
    const slug = await generateUniqueSlug(name);

    const updated = await db.hazard.update({
      where: { id },
      data: { name, slug },
      select: { id: true, name: true, slug: true },
    });

    // Award +5 reputation for contributing a community name
    await db.user.update({
      where: { id: user.id },
      data: { reputationScore: { increment: 5 } },
    });

    return apiSuccess(updated);
  } catch (error) {
    if (error instanceof AuthError) return errors.unauthorized(error.message);
    console.error("POST /hazards/[id]/name error:", error);
    return errors.internal();
  }
}
