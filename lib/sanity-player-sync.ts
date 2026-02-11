import { prisma } from './prisma';

/**
 * Sync player data from database to Sanity CMS
 * Creates or updates a Sanity player profile document
 */
export async function syncPlayerToSanity(playerId: string) {
  // Fetch player from database with all editable fields
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      school: true,
      stats: true,
      offers: {
        where: { verified: true },
        orderBy: { offerDate: 'desc' },
      },
    },
  });

  if (!player) {
    throw new Error(`Player not found: ${playerId}`);
  }

  // Import Sanity client
  const { client } = await import('../sanity/lib/client');

  // Prepare Sanity document data
  const sanityDoc = {
    _type: 'player',
    name: `${player.firstName} ${player.lastName}`,
    firstName: player.firstName,
    lastName: player.lastName,
    school: player.school?.name || player.maxprepsSchoolName,
    city: player.city,
    state: player.state,
    position: player.position,

    // Link to database
    dbPlayerId: player.id,

    // Player-editable fields
    bio: player.bio,
    height: player.heightFeet && player.heightInches
      ? `${player.heightFeet}'${player.heightInches}"`
      : null,
    weight: player.weight,
    jerseyNumber: player.jerseyNumber,

    // Social links
    socialLinks: {
      twitter: player.socialTwitter,
      instagram: player.socialInstagram,
      hudl: player.socialHudl,
    },

    // College info
    collegeName: player.collegeName,
    collegeDivision: player.collegeDivision,
    collegeClassYear: player.collegeClassYear,

    // Verified offers
    offers: player.offers.map(offer => ({
      college: offer.collegeName,
      division: offer.collegeDivision,
      type: offer.offerType,
      date: offer.offerDate?.toISOString(),
      sport: offer.sport,
    })),
  };

  // If player already has Sanity profile, update it
  if (player.sanityProfileId) {
    await client
      .patch(player.sanityProfileId)
      .set(sanityDoc)
      .commit();

    return { updated: true, sanityId: player.sanityProfileId };
  }

  // Otherwise, create new Sanity document
  const newDoc = await client.create(sanityDoc);

  // Save Sanity ID back to database
  await prisma.player.update({
    where: { id: playerId },
    data: { sanityProfileId: newDoc._id },
  });

  return { created: true, sanityId: newDoc._id };
}

/**
 * Link an existing Sanity player document to a database player
 */
export async function linkSanityProfile(playerId: string, sanityProfileId: string) {
  // Verify Sanity document exists
  const { client } = await import('../sanity/lib/client');
  const sanityDoc = await client.fetch(`*[_id == $id][0]`, { id: sanityProfileId });

  if (!sanityDoc) {
    throw new Error(`Sanity document not found: ${sanityProfileId}`);
  }

  // Update database player with Sanity ID
  const player = await prisma.player.update({
    where: { id: playerId },
    data: { sanityProfileId },
  });

  // Update Sanity document with database ID
  await client
    .patch(sanityProfileId)
    .set({ dbPlayerId: playerId })
    .commit();

  return player;
}
