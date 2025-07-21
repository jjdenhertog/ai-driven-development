'use client'

import { Suspense } from 'react'
import { FeaturesPageContent } from './FeaturesPageContent'

export default function FeaturesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FeaturesPageContent />
        </Suspense>
    )
}