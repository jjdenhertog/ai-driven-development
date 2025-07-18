import { ConceptFeatureState } from './ConceptFeatureState';
import { ImageWithDescription } from '../common/ImageWithDescription';

export type ConceptFeature = {
    id: string
    title: string
    description: string
    state: ConceptFeatureState
    images?: ImageWithDescription[]
    createdAt: string
    updatedAt: string
}