import { NextResponse } from 'next/server'

export function createCachedResponse<T>(data: T, maxAge: number = 300): NextResponse<T> {
    const response = NextResponse.json(data)
    response.headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`)

    return response
}