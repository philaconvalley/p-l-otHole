import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, HazardType, RepairStatus, ReportStatus } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pool = new Pool({ connectionString }) as any;
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // =========================================================================
  // BADGES
  // =========================================================================
  const badges = await prisma.badge.createMany({
    data: [
      {
        code: "first_report",
        name: "First Spotter",
        tier: 1,
        description: "Submitted your first hazard report",
        criteria: { reports_submitted: 1 },
      },
      {
        code: "five_reports",
        name: "Road Ranger",
        tier: 2,
        description: "Submitted 5 hazard reports",
        criteria: { reports_submitted: 5 },
      },
      {
        code: "twenty_reports",
        name: "Pothole Hunter",
        tier: 3,
        description: "Submitted 20 hazard reports",
        criteria: { reports_submitted: 20 },
      },
      {
        code: "first_vote",
        name: "Civic Voice",
        tier: 1,
        description: "Cast your first vote on a hazard",
        criteria: { votes_cast: 1 },
      },
      {
        code: "fifty_votes",
        name: "Community Pillar",
        tier: 2,
        description: "Cast 50 votes on hazards",
        criteria: { votes_cast: 50 },
      },
      {
        code: "verified_reporter",
        name: "Verified Reporter",
        tier: 2,
        description: "Had 5 reports verified by moderators",
        criteria: { verified_reports: 5 },
      },
      {
        code: "moderator",
        name: "Guardian",
        tier: 4,
        description: "Trusted community moderator",
        criteria: { is_moderator: true },
      },
    ],
    skipDuplicates: true,
  });

  console.log(`Created ${badges.count} badges`);

  // =========================================================================
  // USERS
  // =========================================================================
  const user1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      username: "alice_spotter",
      email: "alice@example.com",
      reputationScore: 150,
      reportsSubmitted: 12,
      votesCast: 45,
      isModerator: false,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      username: "bob_fixer",
      email: "bob@example.com",
      reputationScore: 320,
      reportsSubmitted: 28,
      votesCast: 89,
      isModerator: false,
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: "mod@example.com" },
    update: {},
    create: {
      username: "city_mod",
      email: "mod@example.com",
      reputationScore: 500,
      reportsSubmitted: 5,
      votesCast: 200,
      isModerator: true,
    },
  });

  console.log(`Created users: ${user1.username}, ${user2.username}, ${moderator.username}`);

  // =========================================================================
  // HAZARDS (Sample locations in San Francisco area)
  // =========================================================================
  const hazard1 = await prisma.hazard.create({
    data: {
      name: "Market Street Crater",
      slug: "market-street-crater",
      description: "Large pothole near the Civic Center BART station",
      type: HazardType.pothole,
      latitude: 37.7749,
      longitude: -122.4194,
      severityScore: 45,
      upvotes: 23,
      downvotes: 2,
      reportsCount: 8,
      repairStatus: RepairStatus.acknowledged,
      cityCode: "SF",
      createdByUserId: user1.id,
    },
  });

  const hazard2 = await prisma.hazard.create({
    data: {
      name: "Mission District Crack",
      slug: "mission-district-crack",
      description: "Long crack running along 24th Street",
      type: HazardType.crack,
      latitude: 37.7522,
      longitude: -122.4183,
      severityScore: 28,
      upvotes: 14,
      downvotes: 1,
      reportsCount: 4,
      repairStatus: RepairStatus.reported,
      cityCode: "SF",
      createdByUserId: user2.id,
    },
  });

  const hazard3 = await prisma.hazard.create({
    data: {
      description: "Drainage issue causing flooding during rain",
      type: HazardType.drainage,
      latitude: 37.7849,
      longitude: -122.4094,
      severityScore: 52,
      upvotes: 31,
      downvotes: 0,
      reportsCount: 12,
      repairStatus: RepairStatus.scheduled,
      cityTicketId: "SF-2024-00123",
      cityCode: "SF",
      createdByUserId: user1.id,
    },
  });

  const hazard4 = await prisma.hazard.create({
    data: {
      name: "Downtown Sinkhole",
      slug: "downtown-sinkhole",
      description: "Developing sinkhole near construction site",
      type: HazardType.sinkhole,
      latitude: 37.7879,
      longitude: -122.4074,
      severityScore: 89,
      upvotes: 67,
      downvotes: 3,
      reportsCount: 25,
      repairStatus: RepairStatus.in_progress,
      cityTicketId: "SF-2024-00089",
      cityCode: "SF",
      createdByUserId: moderator.id,
    },
  });

  await prisma.hazard.create({
    data: {
      name: "Embarcadero Debris",
      slug: "embarcadero-debris",
      description: "Construction debris left on roadway",
      type: HazardType.debris,
      latitude: 37.7935,
      longitude: -122.3930,
      severityScore: 15,
      upvotes: 8,
      downvotes: 2,
      reportsCount: 3,
      repairStatus: RepairStatus.resolved,
      cityCode: "SF",
      createdByUserId: user2.id,
      resolvedAt: new Date("2024-01-15"),
    },
  });

  console.log(`Created 5 hazards`);

  // =========================================================================
  // REPORTS
  // =========================================================================
  await prisma.report.createMany({
    data: [
      {
        hazardId: hazard1.id,
        reporterUserId: user1.id,
        description: "Spotted this pothole on my morning commute. Nearly blew a tire!",
        sourceLatitude: 37.7749,
        sourceLongitude: -122.4194,
        status: ReportStatus.verified,
        verificationScore: 10,
        verifiedAt: new Date("2024-01-10"),
      },
      {
        hazardId: hazard1.id,
        reporterUserId: user2.id,
        description: "Can confirm, this is getting worse every day",
        sourceLatitude: 37.7750,
        sourceLongitude: -122.4195,
        status: ReportStatus.verified,
        verificationScore: 8,
        verifiedAt: new Date("2024-01-12"),
      },
      {
        hazardId: hazard2.id,
        reporterUserId: user2.id,
        description: "Crack extends about 50 feet along the curb lane",
        sourceLatitude: 37.7522,
        sourceLongitude: -122.4183,
        status: ReportStatus.pending,
        verificationScore: 5,
      },
      {
        hazardId: hazard3.id,
        reporterUserId: user1.id,
        description: "Flooded completely during last week's rain",
        sourceLatitude: 37.7849,
        sourceLongitude: -122.4094,
        status: ReportStatus.verified,
        verificationScore: 12,
        verifiedAt: new Date("2024-01-08"),
      },
      {
        hazardId: hazard4.id,
        reporterUserId: moderator.id,
        description: "Urgent: ground subsidence observed, area needs to be cordoned off",
        sourceLatitude: 37.7879,
        sourceLongitude: -122.4074,
        status: ReportStatus.verified,
        verificationScore: 15,
        verifiedAt: new Date("2024-01-05"),
      },
    ],
  });

  console.log(`Created 5 reports`);

  // =========================================================================
  // VOTES
  // =========================================================================
  await prisma.vote.createMany({
    data: [
      { userId: user1.id, hazardId: hazard2.id, value: 4, note: "Definitely needs attention" },
      { userId: user1.id, hazardId: hazard4.id, value: 5, note: "Dangerous!" },
      { userId: user2.id, hazardId: hazard1.id, value: 4 },
      { userId: user2.id, hazardId: hazard3.id, value: 5, note: "Floods every time it rains" },
      { userId: moderator.id, hazardId: hazard1.id, value: 4 },
      { userId: moderator.id, hazardId: hazard2.id, value: 3 },
      { userId: moderator.id, hazardId: hazard3.id, value: 5 },
    ],
  });

  console.log(`Created 7 votes`);

  // =========================================================================
  // COMMENTS
  // =========================================================================
  const comment1 = await prisma.comment.create({
    data: {
      hazardId: hazard1.id,
      userId: user1.id,
      body: "I've reported this to 311 as well. Hopefully they'll fix it soon.",
    },
  });

  await prisma.comment.create({
    data: {
      hazardId: hazard1.id,
      userId: user2.id,
      parentCommentId: comment1.id,
      body: "Good call! The more reports the better.",
    },
  });

  await prisma.comment.create({
    data: {
      hazardId: hazard4.id,
      userId: moderator.id,
      body: "City crews are on site. Please avoid this area until repairs are complete.",
    },
  });

  console.log(`Created 3 comments`);

  // =========================================================================
  // USER BADGES
  // =========================================================================
  const firstReportBadge = await prisma.badge.findUnique({ where: { code: "first_report" } });
  const fiveReportsBadge = await prisma.badge.findUnique({ where: { code: "five_reports" } });
  const firstVoteBadge = await prisma.badge.findUnique({ where: { code: "first_vote" } });
  const moderatorBadge = await prisma.badge.findUnique({ where: { code: "moderator" } });

  if (firstReportBadge && fiveReportsBadge && firstVoteBadge && moderatorBadge) {
    await prisma.userBadge.createMany({
      data: [
        { userId: user1.id, badgeId: firstReportBadge.id },
        { userId: user1.id, badgeId: fiveReportsBadge.id },
        { userId: user1.id, badgeId: firstVoteBadge.id },
        { userId: user2.id, badgeId: firstReportBadge.id },
        { userId: user2.id, badgeId: fiveReportsBadge.id },
        { userId: user2.id, badgeId: firstVoteBadge.id },
        { userId: moderator.id, badgeId: moderatorBadge.id },
      ],
      skipDuplicates: true,
    });

    console.log(`Assigned badges to users`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
