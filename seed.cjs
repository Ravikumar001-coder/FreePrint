const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Roles
  const roles = [
    { role_name: 'student', role_slug: 'student', description: 'Standard student user', is_system_role: true, priority_level: 1 },
    { role_name: 'educator', role_slug: 'educator', description: 'Teacher/Educator', is_system_role: true, priority_level: 2 },
    { role_name: 'admin', role_slug: 'admin', description: 'System Administrator', is_system_role: true, priority_level: 100 },
    { role_name: 'superadmin', role_slug: 'superadmin', description: 'Super Administrator with unrestricted access', is_system_role: true, priority_level: 999 }
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { role_slug: r.role_slug },
      update: {},
      create: r,
    });
  }
  console.log("Roles seeded.");

  // Seed Subscription Plans (Exact PRD Implementation)
  const plans = [
    {
      plan_slug: 'free',
      plan_name: 'Free Student',
      plan_tier: 'free',
      price_monthly: 0,
      weekly_credits: 50,
      credit_rollover_limit: 0,
      max_pages_per_file: 40,
      max_file_size_mb: 15,
      cost_multiplier: 1.0,
      storage_limit_gb: 0,
      description: 'Standard offline printing. Core 2-Up & 4-Up imposition.',
      allows_batch_processing: false,
      allows_watermark_removal: false,
      allows_priority_processing: false,
      allows_custom_presets: false,
      is_active: true
    },
    {
      plan_slug: 'educator-pro',
      plan_name: 'Educator Pro',
      plan_tier: 'pro',
      price_monthly: 99,
      weekly_credits: 400,
      credit_rollover_limit: 0,
      max_pages_per_file: 200,
      max_file_size_mb: 45,
      cost_multiplier: 0.85,
      storage_limit_gb: 5,
      description: 'Unlocks Educator features. Moderate priority rendering queue.',
      allows_batch_processing: true,
      allows_watermark_removal: false,
      allows_priority_processing: true,
      allows_custom_presets: false,
      is_active: true
    },
    {
      plan_slug: 'pro',
      plan_name: 'Academic Pro',
      plan_tier: 'pro',
      price_monthly: 199,
      weekly_credits: 1000,
      credit_rollover_limit: 500,
      max_pages_per_file: 500,
      max_file_size_mb: 100,
      cost_multiplier: 0.85,
      storage_limit_gb: 15,
      description: 'Unlocks 9-Up and 16-Up dense grids. Priority rendering queue.',
      allows_batch_processing: true,
      allows_watermark_removal: true,
      allows_priority_processing: true,
      allows_custom_presets: true,
      is_active: true
    },
    {
      plan_slug: 'elite',
      plan_name: 'Revision Elite',
      plan_tier: 'enterprise',
      price_monthly: 499,
      weekly_credits: 3000,
      credit_rollover_limit: 99999,
      max_pages_per_file: 0,
      max_file_size_mb: 250,
      cost_multiplier: 0.70,
      storage_limit_gb: 50,
      description: 'Massive savings on estimated print cost. Unlocks "No Margin" support. 24/7 SLA.',
      allows_batch_processing: true,
      allows_watermark_removal: true,
      allows_priority_processing: true,
      allows_custom_presets: true,
      is_active: true
    }
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { plan_slug: p.plan_slug },
      update: p,
      create: p,
    });
  }
  console.log("Subscription plans seeded.");

  // Seed Coupons (Exact PRD Implementation)
  const coupons = [
    {
      code: 'FREEPRINT',
      discount_type: 'free',
      discount_value: 100,
      usage_limit: 3,
      description: 'Promotional system voucher. Grants 100% free physical print outs.',
      is_active: true
    },
    {
      code: 'STUDYBUDDY',
      discount_type: 'percent',
      discount_value: 25,
      usage_limit: 5,
      description: 'Academic peer code. Deducts 25% of final printing bills.',
      is_active: true
    },
    {
      code: 'HALFOFF',
      discount_type: 'percent',
      discount_value: 50,
      usage_limit: null,
      description: 'Midterm revision voucher. Shaves coupon discount height in half.',
      is_active: true
    },
    {
      code: 'TEACHERCARE',
      discount_type: 'fixed',
      discount_value: 20,
      usage_limit: 10,
      description: 'Lecture notes promotion. Deducts flat ₹20 rupees from totals.',
      is_active: true
    }
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log("Coupons seeded.");
  // Seed Site Settings (Footer Links)
  const settings = [
    { key: 'link_ios', value: '#ios' },
    { key: 'link_android', value: '#android' },
    { key: 'link_privacy', value: '/privacy' },
    { key: 'link_terms', value: '/terms' },
    { key: 'link_support', value: '/support' }
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("Site settings seeded.");
  
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
