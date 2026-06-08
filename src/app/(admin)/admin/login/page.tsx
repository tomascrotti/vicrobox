'use client'

import { useActionState } from 'react'
import { Wordmark } from '@/components/ui/Wordmark'
import { signIn } from './actions'

export default function LoginPage() {
  const [error, formAction, isPending] = useActionState(signIn, null)

  return (
    <main className="min-h-screen bg-bg-main flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-s2 rounded-[20px] p-8 border border-white/8">
        <div className="text-center mb-8">
          <span className="font-display text-3xl"><Wordmark /></span>
          <p className="text-white/40 text-sm mt-2">Panel de administración</p>
        </div>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-bold text-white/70">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange"
              placeholder="admin@vicrobox.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-bold text-white/70">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-xl bg-s1 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-orange"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="mt-2 rounded-full bg-orange px-6 py-3 text-sm font-extrabold text-white disabled:opacity-50 hover:bg-[#D06B00] transition-colors"
          >
            {isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  )
}
