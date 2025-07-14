const EXIT_KEYWORDS = ['task completed', 'ai development command was successful', 'completed successfully', 'captured successfully', 'finished'];

export function containsExitKeyword(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    return EXIT_KEYWORDS.some(keyword => lowerText.includes(keyword));
}