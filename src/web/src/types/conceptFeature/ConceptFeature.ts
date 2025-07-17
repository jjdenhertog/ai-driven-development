export type ConceptFeature = {
    id: string
    title: string
    description: string
    state: ConceptFeatureState
    createdAt: string
    updatedAt: string
}

export type ConceptFeatureState = 'draft' | 'ready' | 'questions' | 'reviewed' | 'approved'