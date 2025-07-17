import { NextResponse } from 'next/server'

export function createNoCacheResponse<T>(data: T): NextResponse<T> {
    const response = NextResponse.json(data)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

    return response
}