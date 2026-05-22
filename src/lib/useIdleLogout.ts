'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// Auto-logout setelah tidak ada interaksi selama 6 jam.
const IDLE_LIMIT_MS = 6 * 60 * 60 * 1000

// Event yang dihitung sebagai "aktif".
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']

// Pasang di dashboard mana pun. Date.now() memakai jam dinding, jadi tetap akurat
// walau laptop sempat sleep — saat bangun, interval/visibilitychange langsung cek.
export function useIdleLogout() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let lastActivity = Date.now()
    let loggedOut = false

    const logout = async () => {
      if (loggedOut) return
      loggedOut = true
      await supabase.auth.signOut()
      toast('Kamu keluar otomatis karena tidak aktif selama 6 jam.', { icon: '⏏' })
      router.push('/login')
      router.refresh()
    }

    const onActivity = () => {
      lastActivity = Date.now()
    }

    const check = () => {
      if (!loggedOut && Date.now() - lastActivity >= IDLE_LIMIT_MS) logout()
    }

    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, onActivity, { passive: true }))

    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)

    const interval = window.setInterval(check, 60_000)

    return () => {
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, onActivity))
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(interval)
    }
  }, [router])
}
