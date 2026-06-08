import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Settings from '@/models/Settings'
import { createPathaoOrder, getPathaoConfig } from '@/lib/pathao'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const {
      orderId, storeId, deliveryType = 48, itemType = 2, itemWeight = 0.5,
      itemQuantity, itemDescription, specialInstruction, amountToCollect,
      merchantOrderId,
      recipientName, recipientPhone, recipientAddress, recipientSecondaryPhone,
      recipientCity, recipientZone, recipientArea
    } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 })

    await connectDB()
    const order = await Order.findById(parseInt(orderId)).lean()
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const cfg = await getPathaoConfig()
    const effectiveStoreId = storeId || cfg?.storeId
    if (!effectiveStoreId) return NextResponse.json({ error: 'Store ID required. Configure default store in settings or pass storeId.' }, { status: 400 })

    // Build description from items if not provided
    let description = itemDescription
    if (!description && order.items?.length) {
      description = order.items.map((i: any) => `${i.quantity}x item`).join(', ')
    }

    const pathaoPayload: any = {
      store_id: effectiveStoreId,
      merchant_order_id: merchantOrderId || order.orderNumber,
      recipient_name: recipientName || order.name,
      recipient_phone: recipientPhone || order.phone,
      recipient_address: recipientAddress || `${order.address}${order.city ? `, ${order.city}` : ''}`,
      delivery_type: parseInt(deliveryType) as 48 | 12,
      item_type: parseInt(itemType) as 1 | 2,
      item_quantity: itemQuantity !== undefined ? parseInt(itemQuantity) : (order.items?.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) || 1),
      item_weight: String(itemWeight),
      item_description: description || 'Parcel',
      amount_to_collect: amountToCollect !== undefined ? parseInt(amountToCollect) : (order.total || 0),
      special_instruction: specialInstruction !== undefined ? specialInstruction : (order.notes || ''),
    }

    if (recipientSecondaryPhone) pathaoPayload.recipient_secondary_phone = recipientSecondaryPhone
    if (recipientCity) pathaoPayload.recipient_city = parseInt(recipientCity)
    if (recipientZone) pathaoPayload.recipient_zone = parseInt(recipientZone)
    if (recipientArea) pathaoPayload.recipient_area = parseInt(recipientArea)

    const result = await createPathaoOrder(pathaoPayload)

    // Save Pathao info to order
    await Order.findByIdAndUpdate(parseInt(orderId), {
      $set: {
        pathaoConsignmentId: result.consignment_id,
        pathaoOrderStatus: result.order_status,
        pathaoDeliveryFee: result.delivery_fee,
        pathaoSentAt: new Date(),
        pathaoStoreId: effectiveStoreId,
        pathaoPayload,
        status: 'SHIPPED',
      }
    })

    return NextResponse.json({ success: true, pathao: result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
