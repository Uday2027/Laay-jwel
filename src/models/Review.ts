import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  productId: { type: Number, ref: 'Product', required: true },
  name: { type: String, required: true },
  email: { type: String, default: null },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  _id: false
})

ReviewSchema.index({ productId: 1 })
ReviewSchema.index({ createdAt: -1 })

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema)

