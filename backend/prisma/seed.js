import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@shop.com";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", email);
    return;
  }

  const hashed = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.email);
  console.log("Password: admin123  ← เปลี่ยนหลัง login ด้วยนะ!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
