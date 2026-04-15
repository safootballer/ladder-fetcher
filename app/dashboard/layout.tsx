import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={session.user as any} />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
