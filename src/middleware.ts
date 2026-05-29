import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  if (!user && pathname !== '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.role === 'panitia' ? '/panitia' : '/peserta'
    return NextResponse.redirect(url)
  }

  if (user && (pathname.startsWith('/peserta') || pathname.startsWith('/panitia'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (pathname.startsWith('/panitia') && profile?.role !== 'panitia') {
      const url = request.nextUrl.clone()
      url.pathname = '/peserta'
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/peserta') && profile?.role !== 'peserta') {
      const url = request.nextUrl.clone()
      url.pathname = '/panitia'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // `guidebook` dikecualikan agar buku panduan (guidebook.html + folder
    // guidebook-img/) bisa diakses publik tanpa login.
    '/((?!_next/static|_next/image|favicon.ico|guidebook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
