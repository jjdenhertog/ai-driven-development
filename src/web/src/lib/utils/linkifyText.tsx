import React from 'react'

/**
 * Converts URLs in text to clickable links
 * @param text - The text containing URLs
 * @returns React nodes with clickable links
 */
export function linkifyText(text: string): React.ReactNode[] {
    // Regex to match URLs
    const urlRegex = /(https?:\/\/\S+)/g
    
    const parts = text.split(urlRegex)
    
    return parts.map((part, index) => {
        if (urlRegex.test(part)) {
            // Reset regex lastIndex after test
            urlRegex.lastIndex = 0
            
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