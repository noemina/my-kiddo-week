import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@my-kiddo-week.test";
const DEMO_PASSWORD = "demo-password-123";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log(`Demo account already exists: ${DEMO_EMAIL}`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const family = await prisma.family.create({
    data: {
      name: "The Demo Family",
      users: {
        create: {
          role: "PARENT",
          user: {
            create: { email: DEMO_EMAIL, name: "Demo Parent", passwordHash },
          },
        },
      },
      kids: {
        create: [
          { name: "Mia", color: "#ec4899" },
          { name: "Leo", color: "#3b82f6" },
        ],
      },
    },
    include: { kids: true },
  });

  const [mia, leo] = family.kids;
  const schoolYearStart = new Date(new Date().getFullYear(), 8, 1); // Sept 1
  const schoolYearEnd = new Date(new Date().getFullYear() + 1, 8, 1);

  await prisma.activity.createMany({
    data: [
      // Mia: recurring school run, all year
      { kidId: mia.id, title: "School", dayOfWeek: 0, startTime: "08:30", endTime: "15:30", category: "school" },
      { kidId: mia.id, title: "School", dayOfWeek: 1, startTime: "08:30", endTime: "15:30", category: "school" },
      { kidId: mia.id, title: "School", dayOfWeek: 2, startTime: "08:30", endTime: "15:30", category: "school" },
      { kidId: mia.id, title: "School", dayOfWeek: 3, startTime: "08:30", endTime: "15:30", category: "school" },
      { kidId: mia.id, title: "School", dayOfWeek: 4, startTime: "08:30", endTime: "15:30", category: "school" },
      // Mia: swimming, only during the school year (Sept-Sept)
      {
        kidId: mia.id,
        title: "Swimming",
        dayOfWeek: 1,
        startTime: "17:00",
        endTime: "18:00",
        location: "Community Pool",
        category: "swimming",
        color: "#0ea5e9",
        validFrom: schoolYearStart,
        validTo: schoolYearEnd,
      },
      // Leo: gym class every Wednesday
      {
        kidId: leo.id,
        title: "Gym class",
        dayOfWeek: 2,
        startTime: "16:00",
        endTime: "17:00",
        location: "Sports Center",
        category: "gym",
        color: "#22c55e",
      },
    ],
  });

  const nextSaturday = new Date();
  nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7 || 7));

  await prisma.activityException.create({
    data: {
      kidId: leo.id,
      title: "Birthday party",
      date: nextSaturday,
      startTime: "14:00",
      endTime: "16:30",
      location: "Fun Zone",
      notes: "Bring a small gift",
    },
  });

  console.log("Seeded demo family. Sign in with:");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
