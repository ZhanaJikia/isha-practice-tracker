// prisma/seed.ts
import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/db";

async function main() {
  const users = [
    { username: "demo1", password: "demo1234" },
    { username: "demo2", password: "demo1234" },
    { username: "demo3", password: "demo1234" },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);

    await prisma.user.upsert({
      where: { username: u.username },
      update: { passwordHash },
      create: { username: u.username, passwordHash },
    });
  }

  console.log("✅ Seeded demo users");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
