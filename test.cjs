const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Attempting to connect to database...");
    const userCount = await prisma.user.count();
    console.log("✅ SUCCESS! Connected to DB.");
    console.log("📊 Total users in database:", userCount);
    
    const plans = await prisma.subscriptionPlan.count();
    console.log("📊 Total subscription plans:", plans);
  } catch (error) {
    console.error("❌ FAILED TO CONNECT TO DB:");
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
