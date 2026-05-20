import mongoose from 'mongoose'

const CouponSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  usageLimit: { type: Number, default: null },
  usageCount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
  active: { type: Boolean, default: true },
  totalRevenue: { type: Number, default: 0 },
  totalSaved: { type: Number, default: 0 }
}, {
  timestamps: true,
  _id: false
})

CouponSchema.index({ createdAt: -1 })

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema)

