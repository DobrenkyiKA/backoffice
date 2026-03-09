import {Topic} from "@/features/topics/topic.types";

const QUESTION_API = process.env.NEXT_PUBLIC_QUESTION_API_URL

export async function fetchTopics(
    accessToken: string
) : Promise<Topic[]> {
    const response =
        await fetch(`${QUESTION_API}/topics`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
    if (!response.ok) {
        throw new Error('Failed to fetch topics')
    }

    return response.json()
}

export async function createTopic(
    accessToken: string,
    key: string,
    name: string,
    parentPath: string | null
): Promise<Topic> {
    const response = await fetch(`${QUESTION_API}/admin/topics`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ key, name, parentPath }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create topic')
    }

    return response.json()
}

export async function updateTopic(
    accessToken: string,
    oldKey: string,
    newKey: string,
    name: string
): Promise<Topic> {
    const response = await fetch(`${QUESTION_API}/admin/topics/${encodeURIComponent(oldKey)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ key: newKey, name }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update topic')
    }

    return response.json()
}

export async function moveTopic(
    accessToken: string,
    key: string,
    newParentPath: string | null
): Promise<Topic> {
    const query = newParentPath ? `?parentPath=${encodeURIComponent(newParentPath)}` : ''
    const response = await fetch(`${QUESTION_API}/admin/topics/${encodeURIComponent(key)}/move${query}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to move topic')
    }

    return response.json()
}

export async function deleteTopic(
    accessToken: string,
    key: string
): Promise<void> {
    const response = await fetch(`${QUESTION_API}/admin/topics/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete topic')
    }
}