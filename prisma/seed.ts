import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const dbUrl = (process.env.DATABASE_URL ?? '').replace('?sslmode=require', '').replace('&sslmode=require', '')
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@laay.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Laay@Admin2024'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: 'Laay Admin', email: adminEmail, password: hashedPassword, role: 'ADMIN' },
  })
  console.log('✅ Admin user created:', admin.email)

  // Settings
  await prisma.settings.upsert({
    where: { id: 1 }, update: {},
    create: {
      id: 1,
      bkashNumber: '01XXXXXXXXX', bankName: 'Dutch-Bangla Bank',
      bankAccount: 'XXXXXXXXXXXX', bankBranch: 'Dhaka Main', bankHolder: 'Laay Brand',
      deliveryFee: 80,
      bannerText: '✨ Free delivery on orders above ৳2000 | Use code LAAY10 for 10% off your first order',
      bannerActive: true, storeName: 'Laay', storeEmail: 'hello@laay.com', storePhone: '01XXXXXXXXX',
    },
  })
  console.log('✅ Settings initialized')

  // Coupons
  await prisma.coupon.upsert({ where: { code: 'LAAY10' }, update: {}, create: { code: 'LAAY10', discount: 10, usageLimit: 100, active: true } })
  await prisma.coupon.upsert({ where: { code: 'WELCOME5' }, update: {}, create: { code: 'WELCOME5', discount: 5, usageLimit: 200, active: true } })
  console.log('✅ Sample coupons created')

  console.log('\n🎉 Seed complete!')
  console.log(`Admin email: ${adminEmail}`)
  console.log(`Admin password: ${adminPassword}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
