import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email address. Example: npx tsx make-admin.ts you@gmail.com");
    process.exit(1);
  }

  // Find the admin role
  const adminRole = await prisma.role.findFirst({
    where: { role_slug: 'admin' }
  });

  if (!adminRole) {
    console.error("Error: Admin role not found in database. Please run your seed script first.");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role_id: adminRole.role_id }
    });
    console.log(`\n✅ SUCCESS! ${user.email} is now an Administrator.\n`);
  } catch (error) {
    console.error("\n❌ ERROR: Could not update user. Make sure they have logged in at least once.");
    console.error((error as Error).message);
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
