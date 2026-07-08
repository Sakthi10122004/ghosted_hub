// ─────────────────────────────────────────────────────────────────
// Ghosted Hub — Database Seed
// ─────────────────────────────────────────────────────────────────
// Creates initial platform data for development:
//   - Super Admin user
//   - Sample Cohort
//   - Sample Nonprofit
//   - Demo users for each role
// ─────────────────────────────────────────────────────────────────

import { PrismaClient, UserRole, CohortStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Ghosted Hub database...\n");

  // ── Super Admin ──────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@ghostedhub.dev" },
    update: {},
    create: {
      email: "admin@ghostedhub.dev",
      name: "Platform Admin",
      emailVerified: true,
      isActive: true,
      roles: {
        create: { role: UserRole.SUPER_ADMIN },
      },
    },
  });
  console.log(`  ✓ Super Admin: ${admin.email}`);

  // ── Organizer ────────────────────────────────────────────────
  const organizer = await prisma.user.upsert({
    where: { email: "organizer@ghostedhub.dev" },
    update: {},
    create: {
      email: "organizer@ghostedhub.dev",
      name: "Sarah Organizer",
      emailVerified: true,
      isActive: true,
      roles: {
        create: { role: UserRole.ORGANIZER },
      },
    },
  });
  console.log(`  ✓ Organizer:   ${organizer.email}`);

  // ── Mentor ───────────────────────────────────────────────────
  const mentor = await prisma.user.upsert({
    where: { email: "mentor@ghostedhub.dev" },
    update: {},
    create: {
      email: "mentor@ghostedhub.dev",
      name: "Mike Mentor",
      emailVerified: true,
      isActive: true,
      roles: {
        create: { role: UserRole.MENTOR },
      },
    },
  });
  console.log(`  ✓ Mentor:      ${mentor.email}`);

  // ── Team Lead ────────────────────────────────────────────────
  const teamLead = await prisma.user.upsert({
    where: { email: "lead@ghostedhub.dev" },
    update: {},
    create: {
      email: "lead@ghostedhub.dev",
      name: "Lisa TeamLead",
      emailVerified: true,
      isActive: true,
      roles: {
        create: { role: UserRole.TEAM_LEAD },
      },
    },
  });
  console.log(`  ✓ Team Lead:   ${teamLead.email}`);

  // ── Students ─────────────────────────────────────────────────
  const student1 = await prisma.user.upsert({
    where: { email: "student1@ghostedhub.dev" },
    update: {},
    create: {
      email: "student1@ghostedhub.dev",
      name: "Alex Student",
      emailVerified: true,
      isActive: true,
      roles: {
        create: { role: UserRole.STUDENT },
      },
      studentProfile: {
        create: {
          university: "State University",
          major: "Computer Science",
          graduationYear: 2026,
          skills: ["HTML", "CSS", "JavaScript", "Ghost CMS", "React"],
          githubUrl: "https://github.com/alexstudent",
          availability: "20 hours/week",
        },
      },
    },
  });
  console.log(`  ✓ Student:     ${student1.email}`);

  const student2 = await prisma.user.upsert({
    where: { email: "student2@ghostedhub.dev" },
    update: {},
    create: {
      email: "student2@ghostedhub.dev",
      name: "Jordan Designer",
      emailVerified: true,
      isActive: true,
      roles: {
        create: { role: UserRole.STUDENT },
      },
      studentProfile: {
        create: {
          university: "Design College",
          major: "UX Design",
          graduationYear: 2027,
          skills: ["Figma", "UI Design", "CSS", "Accessibility", "Handlebars"],
          portfolioUrl: "https://jordandesigner.dev",
          availability: "15 hours/week",
        },
      },
    },
  });
  console.log(`  ✓ Student:     ${student2.email}`);

  // ── Nonprofit ────────────────────────────────────────────────
  const nonprofit = await prisma.nonprofit.upsert({
    where: { id: "seed-nonprofit-001" },
    update: {},
    create: {
      id: "seed-nonprofit-001",
      name: "Green Future Foundation",
      description: "Environmental education and community sustainability programs.",
      mission: "To empower communities through environmental education and sustainable practices.",
      vision: "A world where every community thrives in harmony with nature.",
      websiteUrl: "https://greenfuture.example.org",
      city: "Portland",
      state: "OR",
      country: "US",
      foundedYear: 2015,
    },
  });
  console.log(`  ✓ Nonprofit:   ${nonprofit.name}`);

  // ── Nonprofit Rep ────────────────────────────────────────────
  const nonprofitRep = await prisma.user.upsert({
    where: { email: "rep@greenfuture.org" },
    update: {},
    create: {
      email: "rep@greenfuture.org",
      name: "Nina Nonprofit",
      emailVerified: true,
      isActive: true,
      roles: {
        create: { role: UserRole.NONPROFIT_REP },
      },
    },
  });

  await prisma.nonprofitContact.upsert({
    where: {
      nonprofitId_userId: {
        nonprofitId: nonprofit.id,
        userId: nonprofitRep.id,
      },
    },
    update: {},
    create: {
      nonprofitId: nonprofit.id,
      userId: nonprofitRep.id,
      isPrimary: true,
      title: "Executive Director",
    },
  });
  console.log(`  ✓ Nonprofit Rep: ${nonprofitRep.email}`);

  // ── Sample Cohort ────────────────────────────────────────────
  const cohort = await prisma.cohort.upsert({
    where: { id: "seed-cohort-001" },
    update: {},
    create: {
      id: "seed-cohort-001",
      name: "Ghosted 2026 Spring",
      description: "Spring 2026 cohort of the Ghosted program.",
      status: CohortStatus.DRAFT,
      registrationOpensAt: new Date("2026-01-15"),
      registrationClosesAt: new Date("2026-02-15"),
      sprintStartDate: new Date("2026-03-01"),
      sprintEndDate: new Date("2026-05-31"),
      maxTeams: 10,
      maxStudentsPerTeam: 5,
    },
  });
  console.log(`  ✓ Cohort:      ${cohort.name}`);

  // Link nonprofit to cohort
  await prisma.cohortNonprofit.upsert({
    where: {
      cohortId_nonprofitId: {
        cohortId: cohort.id,
        nonprofitId: nonprofit.id,
      },
    },
    update: {},
    create: {
      cohortId: cohort.id,
      nonprofitId: nonprofit.id,
    },
  });

  // ── Sample Team ──────────────────────────────────────────────
  const team = await prisma.team.upsert({
    where: { id: "seed-team-001" },
    update: {},
    create: {
      id: "seed-team-001",
      name: "Team Alpha",
      cohortId: cohort.id,
      capacity: 5,
      members: {
        create: [
          { userId: teamLead.id, role: UserRole.TEAM_LEAD },
          { userId: student1.id, role: UserRole.STUDENT },
          { userId: student2.id, role: UserRole.STUDENT },
          { userId: mentor.id, role: UserRole.MENTOR },
        ],
      },
    },
  });
  console.log(`  ✓ Team:        ${team.name}`);

  console.log("\n✅ Ghosted Hub database seeded successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
