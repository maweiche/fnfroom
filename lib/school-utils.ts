import { prisma } from './prisma';

/**
 * Normalize a school name for matching:
 * Strip "High School", "HS", "Academy", "School", trailing whitespace
 */
function normalizeSchoolName(name: string): string {
  return name
    .replace(/\b(High School|H\.?S\.?|Academy|School|Preparatory|Prep)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate a URL-safe slug from a school name
 * "Bishop McGuinness" → "bishop-mcguinness"
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Find an existing school or create a new one.
 *
 * Lookup order:
 * 1. Exact name match (case-insensitive) on schools.name
 * 2. Alias match on school_aliases.alias
 * 3. Normalized match (strip "High School", "HS", "Academy", etc.)
 * 4. Create new school + alias
 */
export async function findOrCreateSchool(
  name: string,
  city?: string | null,
  meta?: { classification?: string; conference?: string }
): Promise<{ id: string; name: string; created: boolean }> {
  const trimmed = name.trim();

  // 1. Exact name match (case-insensitive)
  const exactMatch = await prisma.school.findFirst({
    where: { name: { equals: trimmed, mode: 'insensitive' } },
  });
  if (exactMatch) {
    return { id: exactMatch.id, name: exactMatch.name, created: false };
  }

  // 2. Alias match
  const aliasMatch = await prisma.schoolAlias.findFirst({
    where: { alias: { equals: trimmed, mode: 'insensitive' } },
    include: { school: true },
  });
  if (aliasMatch) {
    return { id: aliasMatch.school.id, name: aliasMatch.school.name, created: false };
  }

  // 3. Normalized match
  const normalized = normalizeSchoolName(trimmed);
  if (normalized !== trimmed) {
    const normalizedMatch = await prisma.school.findFirst({
      where: { name: { equals: normalized, mode: 'insensitive' } },
    });
    if (normalizedMatch) {
      // Create alias so future lookups are faster
      await prisma.schoolAlias.create({
        data: { schoolId: normalizedMatch.id, alias: trimmed },
      }).catch(() => {}); // ignore if alias already exists
      return { id: normalizedMatch.id, name: normalizedMatch.name, created: false };
    }
  }

  // 4. Create new school
  const key = slugify(trimmed);

  // Handle potential key collision
  const existingKey = await prisma.school.findUnique({ where: { key } });
  const finalKey = existingKey ? `${key}-${Date.now()}` : key;

  const school = await prisma.school.create({
    data: {
      key: finalKey,
      name: trimmed,
      city: city || null,
      classification: meta?.classification || null,
      conference: meta?.conference || null,
    },
  });

  // Create alias with the original extracted name
  await prisma.schoolAlias.create({
    data: { schoolId: school.id, alias: trimmed },
  }).catch(() => {}); // ignore if duplicate

  return { id: school.id, name: school.name, created: true };
}
