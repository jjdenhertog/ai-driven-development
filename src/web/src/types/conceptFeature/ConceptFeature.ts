import { ConceptFeatureState } from './ConceptFeatureState';

export type ConceptFeature = {
    id: string
    title: string
    description: string
    state: ConceptFeatureState
    createdAt: string
    updatedAt: string
}