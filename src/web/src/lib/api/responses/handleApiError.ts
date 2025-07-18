import { NextResponse } from 'next/server'
import { ApiError } from '../types/ApiError'

export function handleApiError(error: unknown): NextResponse<ApiError> {
  
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