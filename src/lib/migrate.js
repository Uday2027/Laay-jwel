const { Client } = require('pg');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const postgresUrl = (process.env.DATABASE_URL ?? '').replace('?sslmode=require', '').replace('&sslmode=require', '');
const mongoUrl = process.env.MONGODB_URI;

if (!postgresUrl || !mongoUrl) {
  console.error("❌ Both DATABASE_URL and MONGODB_URI must be defined in the .env file.");
  process.exit(1);
}

// Minimal schemas for migration script inside Node.js execution context
const UserSchema = new mongoose.Schema({
  _id: Number, name: String, email: String, phone: String, password: String, role: String, createdAt: Date, updatedAt: Date
}, { collection: 'users', timestamps: true, _id: false });

const ProductSchema = new mongoose.Schema({
  _id: Number, name: String, slug: String, description: String, price: Number, category: String, images: [String], stock: Number, featured: Boolean, createdAt: Date, updatedAt: Date
}, { collection: 'products', timestamps: true, _id: false });

const OrderItemSchema = new mongoose.Schema({
  productId: Number, quantity: Number, price: Number
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  _id: Number, orderNumber: String, userId: Number, name: String, phone: String, address: String, city: String, notes: String, status: String, items: [OrderItemSchema], subtotal: Number, deliveryFee: Number, discount: Number, total: Number, paymentMethod: String, transactionId: String, couponCode: String, paidDelivery: Boolean, discountBreakdown: mongoose.Schema.Types.Mixed, createdAt: Date, updatedAt: Date
}, { collection: 'orders', timestamps: true, _id: false });

const ReviewSchema = new mongoose.Schema({
  _id: Number, productId: Number, name: String, email: String, rating: Number, comment: String, createdAt: Date
}, { collection: 'reviews', _id: false });

const CouponSchema = new mongoose.Schema({
  _id: Number, code: String, discount: Number, usageLimit: Number, usageCount: Number, expiresAt: Date, active: Boolean, totalRevenue: Number, totalSaved: Number, createdAt: Date, updatedAt: Date
}, { collection: 'coupons', timestamps: true, _id: false });

const SettingsSchema = new mongoose.Schema({
  _id: Number, bkashNumber: String, bankName: String, bankAccount: String, bankBranch: String, bankHolder: String, deliveryFee: Number, bannerText: String, bannerActive: Boolean, storeName: String, storeEmail: String, storePhone: String
}, { collection: 'settings', _id: false });

const CounterSchema = new mongoose.Schema({
  model: String, seq: Number
}, { collection: 'counters' });

async function runMigration() {
  console.log("🚀 Starting database migration...");

  // Connect to PostgreSQL
  const pgClient = new Client({ connectionString: postgresUrl, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();
  console.log("✅ Connected to PostgreSQL database.");

  // Connect to MongoDB
  await mongoose.connect(mongoUrl, { bufferCommands: false });
  console.log("✅ Connected to MongoDB.");

  // Clear existing collections in MongoDB (to start fresh and avoid duplicates)
  console.log("🧹 Clearing target collections in MongoDB...");
  const db = mongoose.connection.db;
  const collections = ['users', 'products', 'orders', 'reviews', 'coupons', 'settings', 'counters'];
  for (const collName of collections) {
    try {
      await db.collection(collName).drop();
      console.log(`   Dropped collection: ${collName}`);
    } catch (e) {
      // Collection may not exist yet, ignore
    }
  }

  // Compile mongoose models
  const MUser = mongoose.model('User', UserSchema);
  const MProduct = mongoose.model('Product', ProductSchema);
  const MOrder = mongoose.model('Order', OrderSchema);
  const MReview = mongoose.model('Review', ReviewSchema);
  const MCoupon = mongoose.model('Coupon', CouponSchema);
  const MSettings = mongoose.model('Settings', SettingsSchema);
  const MCounter = mongoose.model('Counter', CounterSchema);

  // 1. Migrate Settings
  console.log("📦 Migrating Settings...");
  const pgSettings = await pgClient.query('SELECT * FROM "Settings"');
  for (const row of pgSettings.rows) {
    await MSettings.create({
      _id: row.id,
      bkashNumber: row.bkashNumber,
      bankName: row.bankName,
      bankAccount: row.bankAccount,
      bankBranch: row.bankBranch,
      bankHolder: row.bankHolder,
      deliveryFee: row.deliveryFee,
      bannerText: row.bannerText,
      bannerActive: row.bannerActive,
      storeName: row.storeName,
      storeEmail: row.storeEmail,
      storePhone: row.storePhone
    });
  }
  console.log(`✅ Settings migrated: ${pgSettings.rowCount} rows.`);

  // 2. Migrate Coupons
  console.log("📦 Migrating Coupons...");
  const pgCoupons = await pgClient.query('SELECT * FROM "Coupon"');
  let maxCouponId = 0;
  for (const row of pgCoupons.rows) {
    maxCouponId = Math.max(maxCouponId, row.id);
    await MCoupon.create({
      _id: row.id,
      code: row.code,
      discount: row.discount,
      usageLimit: row.usageLimit,
      usageCount: row.usageCount,
      expiresAt: row.expiresAt,
      active: row.active,
      totalRevenue: row.totalRevenue,
      totalSaved: row.totalSaved,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
  console.log(`✅ Coupons migrated: ${pgCoupons.rowCount} rows.`);

  // 3. Migrate Users
  console.log("📦 Migrating Users...");
  const pgUsers = await pgClient.query('SELECT * FROM "User"');
  let maxUserId = 0;
  for (const row of pgUsers.rows) {
    maxUserId = Math.max(maxUserId, row.id);
    await MUser.create({
      _id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      password: row.password,
      role: row.role,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
  console.log(`✅ Users migrated: ${pgUsers.rowCount} rows.`);

  // 4. Migrate Products
  console.log("📦 Migrating Products...");
  const pgProducts = await pgClient.query('SELECT * FROM "Product"');
  let maxProductId = 0;
  for (const row of pgProducts.rows) {
    maxProductId = Math.max(maxProductId, row.id);
    let imagePaths = [];
    try {
      imagePaths = JSON.parse(row.images || '[]');
    } catch (e) {
      imagePaths = [row.images];
    }

    await MProduct.create({
      _id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: row.price,
      category: row.category,
      images: imagePaths,
      stock: row.stock,
      featured: row.featured,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
  console.log(`✅ Products migrated: ${pgProducts.rowCount} rows.`);

  // 5. Migrate Reviews
  console.log("📦 Migrating Reviews...");
  const pgReviews = await pgClient.query('SELECT * FROM "Review"');
  let maxReviewId = 0;
  for (const row of pgReviews.rows) {
    maxReviewId = Math.max(maxReviewId, row.id);
    await MReview.create({
      _id: row.id,
      productId: row.productId,
      name: row.name,
      email: row.email,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.createdAt
    });
  }
  console.log(`✅ Reviews migrated: ${pgReviews.rowCount} rows.`);

  // 6. Migrate Orders & OrderItems (Embedded)
  console.log("📦 Migrating Orders and embedding items...");
  const pgOrders = await pgClient.query('SELECT * FROM "Order"');
  const pgOrderItems = await pgClient.query('SELECT * FROM "OrderItem"');

  // Group items by orderId
  const itemsByOrderId = {};
  for (const item of pgOrderItems.rows) {
    if (!itemsByOrderId[item.orderId]) {
      itemsByOrderId[item.orderId] = [];
    }
    itemsByOrderId[item.orderId].push({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    });
  }

  let maxOrderId = 0;
  for (const row of pgOrders.rows) {
    maxOrderId = Math.max(maxOrderId, row.id);
    let breakdown = {};
    try {
      breakdown = JSON.parse(row.discountBreakdown || '{}');
    } catch (e) {
      breakdown = {};
    }

    await MOrder.create({
      _id: row.id,
      orderNumber: row.orderNumber,
      userId: row.userId,
      name: row.name,
      phone: row.phone,
      address: row.address,
      city: row.city,
      notes: row.notes,
      status: row.status,
      items: itemsByOrderId[row.id] || [],
      subtotal: row.subtotal,
      deliveryFee: row.deliveryFee,
      discount: row.discount,
      total: row.total,
      paymentMethod: row.paymentMethod,
      transactionId: row.transactionId,
      couponCode: row.couponCode,
      paidDelivery: row.paidDelivery,
      discountBreakdown: breakdown,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
  console.log(`✅ Orders migrated: ${pgOrders.rowCount} rows.`);

  // 7. Seed Counters
  console.log("🪙 Seeding auto-increment counters...");
  await MCounter.create({ model: 'User', seq: maxUserId });
  await MCounter.create({ model: 'Product', seq: maxProductId });
  await MCounter.create({ model: 'Order', seq: maxOrderId });
  await MCounter.create({ model: 'Review', seq: maxReviewId });
  await MCounter.create({ model: 'Coupon', seq: maxCouponId });
  console.log("✅ Counters seeded successfully.");

  // Disconnect
  await pgClient.end();
  await mongoose.disconnect();
  console.log("\n🎉 Database migration finished successfully!");
}

runMigration().catch(err => {
  console.error("❌ Migration failed with error:", err);
  process.exit(1);
});
