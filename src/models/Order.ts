import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema({
  productId: { type: Number, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false })

const OrderSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: Number, ref: 'User', default: null },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  notes: { type: String, default: '' },
  status: { type: String, default: 'PENDING' },
  items: { type: [OrderItemSchema], default: [] },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'cod' },
  transactionId: { type: String, default: null },
  couponCode: { type: String, default: null },
  paidDelivery: { type: Boolean, default: false },
  discountBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: true,
  _id: false
})

OrderSchema.index({ userId: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)

