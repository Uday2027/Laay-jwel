import mongoose from 'mongoose'

const AnalyticsEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pageview', 'product_click', 'add_to_cart'],
    required: true,
    index: true,
  },
  // For pageview
  url: { type: String, default: null },
  // For product_click and add_to_cart
  productId: { type: Number, default: null, index: true },
  productName: { type: String, default: null },
  productSlug: { type: String, default: null },
  quantity: { type: Number, default: null },
  // Session tracking (works for logged-out users too)
  sessionId: { type: String, required: true, index: true },
  ip: { type: String, default: null },
  userAgent: { type: String, default: null },
}, {
  timestamps: true,
})

// Indexes for common queries
AnalyticsEventSchema.index({ createdAt: -1 })
AnalyticsEventSchema.index({ type: 1, createdAt: -1 })
AnalyticsEventSchema.index({ type: 1, productId: 1, createdAt: -1 })

export default mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema)
