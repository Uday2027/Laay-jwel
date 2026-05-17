import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user || user.role !== 'ADMIN') {
    redirect('/account')
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
