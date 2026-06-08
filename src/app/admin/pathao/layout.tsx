import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import PathaoLayoutClient from './PathaoLayoutClient'

export default async function PathaoLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user || user.role !== 'ADMIN') {
    redirect('/account')
  }
  return <PathaoLayoutClient>{children}</PathaoLayoutClient>
}
