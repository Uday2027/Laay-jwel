import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: { type: [String], default: [] },
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true,
  _id: false
})

ProductSchema.index({ category: 1 })
ProductSchema.index({ featured: 1 })
ProductSchema.index({ createdAt: -1 })

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)

