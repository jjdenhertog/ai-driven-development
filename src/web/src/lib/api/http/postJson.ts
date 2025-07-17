export async function postJson<T>(url: string, data: unknown): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        throw new Error(`Failed to post: ${response.statusText}`)
    }

    return response.json()
}