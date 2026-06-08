import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Wordmark } from '@/components/ui/Wordmark'
import { SignOutButton } from '@/components/admin/SignOutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-bg-main text-white">
      <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/8 bg-bg-main sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl"><Wordmark /></span>
          <span className="text-white/30 text-sm font-bold">Admin</span>
        </div>
        <SignOutButton />
      </header>
      {children}
    </div>
  )
}
