'use client'

import { signOut } from '@/app/(admin)/admin/actions'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm font-bold text-white/50 hover:text-white transition-colors"
      >
        Cerrar sesión
      </button>
    </form>
  )
}
