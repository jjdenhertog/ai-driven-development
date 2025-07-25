export async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
    }

    return response.json()
}