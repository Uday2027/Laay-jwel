import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Settings from '@/models/Settings'

export async function GET() {
  await connectDB()
  const settings = await Settings.findById(1).lean()
  if (!settings) return NextResponse.json({ deliveryFee: 80, bannerText: '', bannerActive: false })
  return NextResponse.json({
    deliveryFee: settings.deliveryFee,
    bannerText: settings.bannerText,
    bannerActive: settings.bannerActive,
    bkashNumber: settings.bkashNumber,
    bankName: settings.bankName,
    bankAccount: settings.bankAccount,
    bankBranch: settings.bankBranch,
    bankHolder: settings.bankHolder,
    storeName: settings.storeName,
    storePhone: settings.storePhone,
  })
}

