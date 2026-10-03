import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
  const email = "lxravi100@gmail.com";
  
  console.log(`Looking up user: ${email}...`);

  // 1. Ensure the admin role exists
  let adminRole = await prisma.role.findUnique({ where: { role_slug: 'admin' } });
  if (!adminRole) {
    console.log("Admin role doesn't exist, creating it now...");
    adminRole = await prisma.role.create({
      data: {
        role_name: 'Administrator',
        role_slug: 'admin',
        is_system_role: true,
        priority_level: 100
      }
    });
  }

  // 2. Find the user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Error: User ${email} not found! Please log in to the website first to create your account.`);
    process.exit(1);
  }

  // 3. Assign the role
  await prisma.user.update({
    where: { email },
    data: { role_id: adminRole.role_id }
  });
  
  console.log(`✅ Successfully made ${email} an admin!`);
}

makeAdmin()
  .catch((e) => {
    console.error("Failed to make admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
