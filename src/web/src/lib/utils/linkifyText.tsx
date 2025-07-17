import React from 'react'

/**
 * Converts URLs in text to clickable links
 * @param text - The text containing URLs
 * @returns React nodes with clickable links
 */
export function linkifyText(text: string): React.ReactNode[] {
    // Regex to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g
    
    const parts = text.split(urlRegex)
    
    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: '#3b82f6',
                        textDecoration: 'underline'
                    }}
                >
                    {part}
                </a>
            )
        }
        return <span key={index}>{part}</span>
    })
}