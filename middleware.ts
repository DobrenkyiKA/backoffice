import {NextRequest, NextResponse} from "next/server";

export function middleware(request: NextRequest) {
    const refreshToken = request.cookies.get('refreshToken')

    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!refreshToken) {
            return NextResponse.redirect(
                new URL('/login', request.url)
            )
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}