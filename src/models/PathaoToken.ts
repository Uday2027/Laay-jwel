import mongoose from 'mongoose'

const PathaoTokenSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  tokenType: { type: String, default: 'Bearer' },
  expiresIn: { type: Number, default: 432000 },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  baseUrl: { type: String, default: '' }
}, {
  timestamps: true,
  _id: false
})

export default mongoose.models.PathaoToken || mongoose.model('PathaoToken', PathaoTokenSchema)
