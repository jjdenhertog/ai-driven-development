import { Button } from '@/components/common/Button'
import { faPlay, faStop, faTrowelBricks } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCallback } from 'react'

type ContainerActionsProps = {
    readonly status: string
    readonly onAction: (action: 'start' | 'stop' | 'rebuild', options?: { clean?: boolean }) => void
}

export const ContainerActions = (options: ContainerActionsProps) => {
    const { status, onAction } = options

    const handleStart = useCallback(() => {
        onAction('start')
    }, [onAction])

    const handleStop = useCallback(() => {
        onAction('stop')
    }, [onAction])

    const handleRebuild = useCallback(() => {
        onAction('rebuild')
    }, [onAction])

    if (status !== 'running') {
        return (
            <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="primary" size="medium" onClick={handleRebuild}>
                    <FontAwesomeIcon icon={faTrowelBricks} />
                    Rebuild & Start
                </Button>
                <Button variant="primary" size="medium" onClick={handleStart}>
                    <FontAwesomeIcon icon={faPlay} />
                    Start
                </Button>
            </div>
        )
    }

    return (
        <Button variant="secondary" size="medium" onClick={handleStop}>
            <FontAwesomeIcon icon={faStop} />
            Stop
        </Button>
    )
}