const QUESTION_API = process.env.NEXT_PUBLIC_QUESTION_API_URL

export async function getVersions(accessToken: string): Promise<string[]> {
    const response = await fetch(`${QUESTION_API}/admin/sync/versions`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'GET',
    })
    if (!response.ok) {
        throw new Error('Failed to fetch versions.')
    }
    return response.json()
}

export async function exportToVersion(accessToken: string, version: String, message: string): Promise<void> {
    const response = await fetch(`${QUESTION_API}/admin/sync/export?version=${version}&message=${encodeURIComponent(message)}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'POST',
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to export to version.')
    }
}

export async function importFromVersion(accessToken: string, version: String): Promise<void> {
    const response = await fetch(`${QUESTION_API}/admin/sync/import?version=${version}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'POST',
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to import from version.')
    }
}

export async function deleteVersion(accessToken: string, version: string): Promise<void> {
    const response = await fetch(`${QUESTION_API}/admin/sync/versions/${version}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'DELETE',
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to delete version.')
    }
}

export async function getLastCommitMessage(accessToken: string, version: string): Promise<string> {
    const response = await fetch(`${QUESTION_API}/admin/sync/versions/${version}/last-commit-message`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'GET',
    })
    if (!response.ok) {
        throw new Error('Failed to fetch last commit message.')
    }
    return response.text()
}
