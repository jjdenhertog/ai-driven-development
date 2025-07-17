import { NextResponse } from 'next/server'

export function createSuccessResponse<T>(data: T): NextResponse<T> {
    return NextResponse.json(data)
}