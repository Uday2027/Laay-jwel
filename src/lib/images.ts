/**
 * Append Cloudinary transforms to a Cloudinary URL.
 * For non-Cloudinary URLs, return as-is.
 */
export function cloudinaryUrl(url: string, opts: { width?: number; height?: number; quality?: number; format?: string } = {}): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  const { width, height, quality = 'auto', format = 'auto' } = opts
  const transforms = [`q_${quality}`, `f_${format}`]
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (height && width) transforms.push('c_fill')
  else if (width || height) transforms.push('c_limit')
  return url.replace(/\/upload\//, `/upload/${transforms.join(',')}/`)
}
