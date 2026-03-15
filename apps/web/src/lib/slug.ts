import slugify from "slugify";
import { db } from "./db";

/**
 * Generate a unique slug for a hazard name.
 * Appends a number suffix if the slug already exists.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  // Check if the base slug is available
  const existing = await db.hazard.findUnique({
    where: { slug: baseSlug },
    select: { id: true },
  });

  if (!existing) {
    return baseSlug;
  }

  // Find the next available number suffix
  const similar = await db.hazard.findMany({
    where: {
      slug: { startsWith: baseSlug },
    },
    select: { slug: true },
    orderBy: { slug: "desc" },
    take: 10,
  });

  let maxNum = 0;
  for (const h of similar) {
    if (!h.slug) continue;
    const match = h.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  return `${baseSlug}-${maxNum + 1}`;
}
