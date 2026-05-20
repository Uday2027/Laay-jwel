import mongoose from 'mongoose'

const SettingsSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  bkashNumber: { type: String, default: '' },
  bankName: { type: String, default: '' },
  bankAccount: { type: String, default: '' },
  bankBranch: { type: String, default: '' },
  bankHolder: { type: String, default: '' },
  deliveryFee: { type: Number, default: 80 },
  bannerText: { type: String, default: '' },
  bannerActive: { type: Boolean, default: false },
  storeName: { type: String, default: 'Laay' },
  storeEmail: { type: String, default: '' },
  storePhone: { type: String, default: '' }
}, {
  _id: false
})

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema)
