const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function testVoucherSending() {
  try {
    console.log("Setting up test...");
    
    // Find an admin user
    const adminUser = await prisma.user.findFirst({ where: { role: { role_name: 'admin' } } }) || await prisma.user.findFirst();
    
    // Find a regular user
    const regularUser = await prisma.user.findFirst({ where: { user_id: { not: adminUser.user_id } } }) || adminUser;
    
    if (!regularUser) {
      console.error("No regular user found to send voucher to.");
      process.exit(1);
    }
    
    console.log(`Admin User: ${adminUser.email}`);
    console.log(`Target User: ${regularUser.email}`);
    
    // Generate admin JWT
    const token = jwt.sign({ id: adminUser.user_id, email: adminUser.email }, JWT_SECRET, { expiresIn: '1h' });
    
    // Call the API
    console.log("Calling PATCH /api/admin/users/:id/send-coupon...");
    const res = await fetch(`http://localhost:3000/api/admin/users/${regularUser.user_id}/send-coupon`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        is_custom: true,
        discount_type: 'none',
        free_credits: 100,
        description: 'Automated Test Voucher'
      })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      console.log("✅ API Success:", data);
      
      // Verify in DB
      const dbCoupon = await prisma.coupon.findFirst({
        where: { assigned_user_id: regularUser.user_id },
        orderBy: { created_at: 'desc' }
      });
      console.log("✅ Verified in DB. Coupon created:", dbCoupon.code, "- Credits:", dbCoupon.free_credits);
      
      const notification = await prisma.notification.findFirst({
        where: { user_id: regularUser.user_id },
        orderBy: { created_at: 'desc' }
      });
      console.log("✅ Verified in DB. Notification created:", notification.title);
      
    } else {
      console.error("❌ API Failed:", res.status, data);
    }
    
  } catch (err) {
    console.error("❌ Error during test:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testVoucherSending();
