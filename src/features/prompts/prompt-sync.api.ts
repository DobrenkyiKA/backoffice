const AI_API = process.env.NEXT_PUBLIC_AI_API_URL

export async function getPromptVersions(accessToken: string): Promise<string[]> {
    const response = await fetch(`${AI_API}/prompts/sync/versions`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'GET',
    })
    if (!response.ok) {
        throw new Error('Failed to fetch prompt versions.')
    }
    return response.json()
}

export async function exportPromptsToVersion(accessToken: string, version: string, message: string): Promise<void> {
    const response = await fetch(`${AI_API}/prompts/sync/export?version=${version}&message=${encodeURIComponent(message)}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'POST',
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to export prompts to version.')
    }
}

export async function importPromptsFromVersion(accessToken: string, version: string): Promise<void> {
    const response = await fetch(`${AI_API}/prompts/sync/import?version=${version}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'POST',
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to import prompts from version.')
    }
}

export async function deletePromptVersion(accessToken: string, version: string): Promise<void> {
    const response = await fetch(`${AI_API}/prompts/sync/versions/${version}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'DELETE',
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to delete prompt version.')
    }
}

export async function getLastPromptCommitMessage(accessToken: string, version: string): Promise<string> {
    const response = await fetch(`${AI_API}/prompts/sync/versions/${version}/last-commit-message`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'GET',
    })
    if (!response.ok) {
        throw new Error('Failed to fetch last prompt commit message.')
    }
    return response.text()
}
