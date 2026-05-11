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

  // Clear old data (respecting FK order)
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.product.deleteMany({})
  console.log('🗑️  Old products cleared')


  // Jewelry products — BRACELETS, EARRINGS, RINGS
  const products = [
    // BRACELETS
    { name: 'Diamond Tennis Bracelet', slug: 'diamond-tennis-bracelet', description: 'A breathtaking tennis bracelet set with individually prong-set round brilliant diamonds in polished 18K gold. Each stone is hand-selected for its cut and clarity, creating an unbroken line of radiant sparkle around the wrist.', price: 4800, category: 'BRACELETS', images: JSON.stringify(['/products/bracelet-hero.jpg']), stock: 12, featured: true },
    { name: 'Pearl Chain Bracelet', slug: 'pearl-chain-bracelet', description: 'A delicate rose gold chain bracelet adorned with hand-picked freshwater pearls. Lightweight and effortlessly elegant — the perfect everyday luxury piece that transitions from day to night.', price: 1650, category: 'BRACELETS', images: JSON.stringify(['/products/bracelet-2.jpg']), stock: 28, featured: true },
    { name: 'Gold Twisted Bangle', slug: 'gold-twisted-bangle', description: 'A sculptural twisted bangle in 22K gold-plated brass, inspired by traditional South Asian craft. The smooth finish catches light beautifully, making it a statement piece for any occasion.', price: 2200, category: 'BRACELETS', images: JSON.stringify(['/products/bracelet-hero.jpg']), stock: 20, featured: false },
    { name: 'Crystal Charm Bracelet', slug: 'crystal-charm-bracelet', description: 'A soft link-chain bracelet featuring hand-set Swarovski crystal charms — a star, crescent moon, and teardrop. Each charm catches light differently for a dazzling, whimsical effect.', price: 1380, category: 'BRACELETS', images: JSON.stringify(['/products/bracelet-2.jpg']), stock: 35, featured: false },

    // EARRINGS
    { name: 'Grand Chandelier Earrings', slug: 'grand-chandelier-earrings', description: 'A showstopping pair of chandelier drop earrings featuring intricate gold filigree work, pear-cut crystals, and lustrous freshwater pearl drops. Designed for the woman who commands attention.', price: 3500, category: 'EARRINGS', images: JSON.stringify(['/products/earring-hero.jpg']), stock: 15, featured: true },
    { name: 'Diamond Pavé Hoop Earrings', slug: 'diamond-pave-hoop-earrings', description: 'Sleek 18K gold hoops with a full pavé setting of micro-diamonds on the inner face. A minimalist shape elevated by exceptional craftsmanship — the perfect everyday luxury.', price: 2900, category: 'EARRINGS', images: JSON.stringify(['/products/earring-2.jpg']), stock: 22, featured: true },
    { name: 'Pearl Drop Studs', slug: 'pearl-drop-studs', description: 'Classic freshwater pearl drop earrings suspended from a delicate diamond-set post. Timeless, refined, and endlessly wearable — these earrings are a wardrobe essential.', price: 1800, category: 'EARRINGS', images: JSON.stringify(['/products/jewelry-2.jpg']), stock: 40, featured: false },
    { name: 'Gold Leaf Ear Climbers', slug: 'gold-leaf-ear-climbers', description: 'Art nouveau-inspired ear climbers crafted in 18K gold, designed to wrap elegantly along the ear lobe. Set with tiny emerald-cut crystals for subtle sparkle.', price: 2100, category: 'EARRINGS', images: JSON.stringify(['/products/earring-hero.jpg']), stock: 18, featured: false },

    // RINGS
    { name: 'Morganite Cocktail Ring', slug: 'morganite-cocktail-ring', description: 'An opulent cocktail ring centred with a 5ct oval morganite — a rare peach-pink gemstone — surrounded by a pavé diamond halo in 18K gold. A singular jewel for singular moments.', price: 6500, category: 'RINGS', images: JSON.stringify(['/products/ring-hero.jpg']), stock: 8, featured: true },
    { name: 'Stackable Gold Ring Set', slug: 'stackable-gold-ring-set', description: 'A curated trio of stackable rings: a twisted rope band, a pavé diamond eternity band, and a polished plain band — all in 18K gold. Wear together or individually for effortless style.', price: 3200, category: 'RINGS', images: JSON.stringify(['/products/ring-2.jpg']), stock: 25, featured: true },
    { name: 'Solitaire Diamond Ring', slug: 'solitaire-diamond-ring', description: 'A timeless 4-prong solitaire ring featuring a round brilliant diamond on a slim 18K gold band. The perfect symbol of love, elegance, and enduring style.', price: 8900, category: 'RINGS', images: JSON.stringify(['/products/ring-hero.jpg']), stock: 10, featured: false },
    { name: 'Floral Signet Ring', slug: 'floral-signet-ring', description: 'A modern take on the classic signet ring, featuring a hand-engraved floral motif on a chunky 18K gold-plated band. Bold and feminine with a vintage soul.', price: 1900, category: 'RINGS', images: JSON.stringify(['/products/ring-2.jpg']), stock: 30, featured: false },
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }
  console.log(`✅ ${products.length} jewelry products seeded`)

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
