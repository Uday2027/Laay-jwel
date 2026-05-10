import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } })
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
