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
  storePhone: { type: String, default: '' },
  // Pathao Courier settings
  pathaoBaseUrl: { type: String, default: 'https://courier-api-sandbox.pathao.com' },
  pathaoClientId: { type: String, default: '' },
  pathaoClientSecret: { type: String, default: '' },
  pathaoUsername: { type: String, default: '' },
  pathaoPassword: { type: String, default: '' },
  pathaoStoreId: { type: Number, default: null },
  pathaoEnabled: { type: Boolean, default: false }
}, {
  _id: false
})

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema)
