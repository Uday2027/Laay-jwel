import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isSlug = isNaN(parseInt(id))
  await connectDB()
  const product = isSlug
    ? await Product.findOne({ slug: id }).lean()
    : await Product.findById(parseInt(id)).lean()
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const mappedProduct = {
    ...product,
    id: product._id,
    images: JSON.stringify(product.images || [])
  }
  return NextResponse.json({ product: mappedProduct })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params
  const data = await req.json()

  await connectDB()

  let images = undefined
  if (data.images) {
    if (typeof data.images === 'string') {
      try {
        images = JSON.parse(data.images)
      } catch {
        images = [data.images]
      }
    } else if (Array.isArray(data.images)) {
      images = data.images
    }
  }

  const updateFields: any = { ...data }
  if (images !== undefined) {
    updateFields.images = images
  }

  const product = await Product.findOneAndUpdate(
    { _id: parseInt(id) },
    { $set: updateFields },
    { new: true, lean: true }
  )
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  revalidatePath('/')
  revalidatePath('/shop')
  revalidatePath('/shop/[slug]')

  const mappedProduct = {
    ...product,
    id: product._id,
    images: JSON.stringify(product.images || [])
  }
  return NextResponse.json({ product: mappedProduct })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { id } = await params
  await connectDB()
  await Product.deleteOne({ _id: parseInt(id) })

  revalidatePath('/')
  revalidatePath('/shop')
  revalidatePath('/shop/[slug]')

  return NextResponse.json({ message: 'Deleted' })
}

