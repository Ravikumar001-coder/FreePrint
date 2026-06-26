const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst({ where: { role: { role_name: 'user' } } }) || await prisma.user.findFirst();
  console.log('Before:', user.subscription_id, user.credit_balance);
  
  const plan = await prisma.subscriptionPlan.findFirst({where: {plan_slug: 'elite'}});
  if (!plan) throw new Error("Plan not found");
  const plan_id = plan.plan_id;
  console.log('Plan credits:', plan.weekly_credits);
  
  const admin = await prisma.user.findFirst({ where: { role: { role_name: 'admin' } } }) || user;
  const token = jwt.sign({id: admin.user_id, role: 'admin'}, process.env.JWT_SECRET);
  
  const res = await fetch('http://localhost:3000/api/admin/users/' + user.user_id + '/subscription', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({subscription_id: plan_id})
  });
  
  const data = await res.json();
  console.log('API response:', data);
  
  const after = await prisma.user.findUnique({where: {user_id: user.user_id}});
  console.log('After DB:', after.subscription_id, after.credit_balance);
  
  await prisma.$disconnect();
}

test();
