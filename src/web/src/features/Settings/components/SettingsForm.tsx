import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/common/Button'
import { Settings } from '@/types'
import styles from './SettingsForm.module.css'

type SettingsFormProps = {
    readonly settings: Settings
    readonly onSave: (settings: Settings) => Promise<void>
    readonly saving: boolean
}

export function SettingsForm({ settings, onSave, saving }: SettingsFormProps) {
    const [formData, setFormData] = useState<Settings>(settings)
    const [hasChanges, setHasChanges] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setFormData(settings)
        setHasChanges(false)
    }, [settings])

    const handleChange = useCallback((field: keyof Settings, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setHasChanges(true)
        setError(null)
    }, [])

    const handleMainBranchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange('mainBranch', e.target.value)
    }, [handleChange])

    const handleBranchStartingPointChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange('branchStartingPoint', e.target.value)
    }, [handleChange])

    const handleSlackWebhookChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange('slack_webhook_url', e.target.value)
    }, [handleChange])

    const handleEnforceOpusChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange('enforce_opus', e.target.checked)
    }, [handleChange])

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validate webhook URL if provided
        if (formData.slack_webhook_url && formData.slack_webhook_url.trim() !== '') {
            try {
                // eslint-disable-next-line no-new
                new URL(formData.slack_webhook_url)
            } catch {
                setError('Please enter a valid URL for the Slack webhook')
                
                return
            }
        }

        onSave(formData).then(() => {
            setHasChanges(false)
        })
            .catch(() => {
                setError('Failed to save settings')
            })
    }, [formData, onSave])

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
                <label htmlFor="mainBranch">Main Branch</label>
                <input
                    id="mainBranch"
                    type="text"
                    value={formData.mainBranch}
                    onChange={handleMainBranchChange}
                    placeholder="main"
                />
                <span className={styles.description}>
                    Used by the learning AI to track which features have been merged and what users have changed in AI-generated code
                </span>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="branchStartingPoint">Branch Starting Point</label>
                <input
                    id="branchStartingPoint"
                    type="text"
                    value={formData.branchStartingPoint}
                    onChange={handleBranchStartingPointChange}
                    placeholder="main"
                />
                <span className={styles.description}>
                    When an AI works on a task it will create a feature branch. The starting point of any new feature is from this branch
                </span>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="slackWebhook">Slack Webhook</label>
                <input
                    id="slackWebhook"
                    type="text"
                    value={formData.slack_webhook_url}
                    onChange={handleSlackWebhookChange}
                    placeholder="https://hooks.slack.com/services/..."
                />
                <span className={styles.description}>
                    Add your Slack Webhook URL here to get notifications when tasks are picked up or completed
                </span>
            </div>

            <div className={styles.formGroup}>
                <div className={styles.switchGroup}>
                    <div className={styles.switchHeader}>
                        <label htmlFor="enforceOpus">Enforce Opus Model</label>
                        <label className={styles.switch}>
                            <input
                                id="enforceOpus"
                                type="checkbox"
                                checked={formData.enforce_opus || false}
                                onChange={handleEnforceOpusChange}
                            />
                            <span className={styles.slider} />
                        </label>
                    </div>
                    <span className={styles.description}>
                        When enabled, it will always only use the Opus model when running the AI commands
                    </span>
                </div>
            </div>

            {!!error && <div className={styles.error}>{error}</div>}

            <div className={styles.footer}>
                <div className={styles.status}>
                    {!!hasChanges && <span className={styles.unsaved}>• Unsaved changes</span>}
                </div>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={saving || !hasChanges}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
        </form>
    )
}