import { 
    faCheck, 
    faArchive, 
    faTimes, 
    faCircle,
    faCircleDot,
    faSpinner
} from '@fortawesome/free-solid-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { TaskStatus } from '@/types'

type ExtendedStatus = TaskStatus | 'draft'

/**
 * Get the FontAwesome icon definition for a given status
 */
export function getStatusIcon(status: ExtendedStatus): IconDefinition {
    switch (status) {
        case 'completed':
            return faCheck
        case 'archived':
            return faArchive
        case 'in_progress':
            return faSpinner
        case 'failed':
            return faTimes
        case 'draft':
            return faCircleDot
        case 'pending':
            return faCircle
        default:
            return faCircle
    }
}

/**
 * Get the color class for a given status
 */
export function getStatusColorClass(status: ExtendedStatus): string {
    switch (status) {
        case 'completed':
            return 'text-green-600'
        case 'archived':
            return 'text-gray-500'
        case 'in_progress':
            return 'text-blue-600'
        case 'failed':
            return 'text-red-600'
        case 'draft':
            return 'text-gray-400'
        case 'pending':
            return 'text-yellow-600'
        default:
            return 'text-gray-600'
    }
}