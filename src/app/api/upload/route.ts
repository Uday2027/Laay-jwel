import { NextResponse } from 'next/server'
import { cloudinary } from '@/lib/cloudinary'
import { getAuthUserFromRequest, isAdmin } from '@/lib/auth'

function uploadToCloudinary(buffer: Buffer, filename: string): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'laay-products',
        public_id: filename.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_' + Date.now(),
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'))
        } else {
          resolve({ secure_url: result.secure_url, public_id: result.public_id })
        }
      }
    ).end(buffer)
  })
}

export async function POST(req: Request) {
  const user = await getAuthUserFromRequest(req)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploads = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const result = await uploadToCloudinary(buffer, file.name)
        return result.secure_url
      })
    )

    return NextResponse.json({ urls: uploads })
  } catch (err) {
    console.error('Cloudinary upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
