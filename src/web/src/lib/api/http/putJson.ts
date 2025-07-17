export async function putJson<T>(url: string, data: unknown): Promise<T> {
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        throw new Error(`Failed to put: ${response.statusText}`)
    }

    return response.json()
}