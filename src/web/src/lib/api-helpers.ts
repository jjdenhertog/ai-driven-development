import { NextResponse } from 'next/server'

export type ApiError = {
  readonly error: string
  readonly details?: unknown
}

export function handleApiError(error: unknown): NextResponse<ApiError> {
    console.error('API Error:', error)
  
    if (error instanceof Error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        )
    }
  
    return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
    )
}

export function createSuccessResponse<T>(data: T): NextResponse<T> {
    return NextResponse.json(data)
}

export function createCachedResponse<T>(data: T, maxAge: number = 300): NextResponse<T> {
    const response = NextResponse.json(data)
    response.headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`)

    return response
}

export function createNoCacheResponse<T>(data: T): NextResponse<T> {
    const response = NextResponse.json(data)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

    return response
}