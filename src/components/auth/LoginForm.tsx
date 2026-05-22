'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type LoginMode = 'tim' | 'panitia'

export default function LoginForm() {
  const [mode, setMode] = useState<LoginMode>('tim')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    toast(
      (
        <div className="text-sm leading-relaxed">
          <p className="font-semibold text-amber-300 mb-1">Panduan Login Peserta</p>
          <p>
            <span className="text-gray-400">Username:</span> nama tim kamu
          </p>
          <p>
            <span className="text-gray-400">Password:</span> 5 digit terakhir NPM
            anggota 1 + 5 digit terakhir NPM anggota 2
          </p>
        </div>
      ),
      { id: 'login-help', duration: 12000, icon: 'ℹ️' }
    )
  }, [])

  const handleModeSwitch = (newMode: LoginMode) => {
    setMode(newMode)
    setIdentifier('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    const email = mode === 'tim'
      ? `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@link2026.team`
      : identifier

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(
        error.message === 'Invalid login credentials'
          ? mode === 'tim' ? 'Nama tim atau password salah' : 'Email atau password salah'
          : error.message
      )
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', data.user.id)
      .single()

    toast.dismiss('login-help')
    toast.success(`Selamat datang, ${profile?.display_name ?? 'User'}!`)
    router.push(profile?.role === 'panitia' ? '/panitia' : '/peserta')
    router.refresh()
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-6">Masuk ke Sistem</h2>

      {/* Mode Toggle */}
      <div className="flex rounded-lg bg-gray-800 p-1 mb-6">
        <button
          type="button"
          onClick={() => handleModeSwitch('tim')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            mode === 'tim' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Tim Peserta
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('panitia')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            mode === 'panitia' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Panitia
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            {mode === 'tim' ? 'Nama Tim' : 'Email'}
          </label>
          <input
            key={mode}
            type={mode === 'tim' ? 'text' : 'email'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            placeholder={mode === 'tim' ? 'Contoh: linkKSP' : 'email@example.com'}
            required
            disabled={loading}
            autoComplete={mode === 'tim' ? 'off' : 'email'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-900 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Masuk...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Masuk
            </>
          )}
        </button>
      </form>
    </div>
  )
}
