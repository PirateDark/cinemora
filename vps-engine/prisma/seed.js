import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL || "saadshaban1995@gmail.com";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        role: "admin",
      },
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  console.log("Seeding complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
