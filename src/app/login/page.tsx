import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Gem } from 'lucide-react'
import LoginForm from '@/components/auth/LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'panitia') redirect('/panitia')
    else redirect('/peserta')
  }

  return (
    <div className="relative z-[1] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600/20 border border-amber-500/30 mb-4">
            <Gem className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">LINK 2026</h1>
          <p className="text-gray-400 mt-1">Competitive Programming Competition</p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-gray-600">
          Hanya akun yang telah terdaftar dapat masuk.
        </p>
      </div>
    </div>
  )
}
