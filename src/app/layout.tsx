import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import EarthBlobs from '@/components/ui/EarthBlobs'
import './globals.css'

export const metadata: Metadata = {
  title: 'LINK 2026 — Competitive Programming',
  description: 'Platform kompetisi pemrograman LINK 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="font-sans antialiased" suppressHydrationWarning>
        <EarthBlobs />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f1c18',
              color: '#f4f1eb',
              border: '1px solid #2e2a25',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#f4f1eb' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f4f1eb' },
            },
          }}
        />
      </body>
    </html>
  )
}
