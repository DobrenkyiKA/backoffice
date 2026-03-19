import {Prompt, PromptType} from "@/features/pipeline/pipeline.types";

const AI_API = process.env.NEXT_PUBLIC_AI_API_URL

export async function getPrompts(
    accessToken: string,
    type?: PromptType
): Promise<Prompt[]> {
    const url = new URL(`${AI_API}/prompts`)
    if (type) {
        url.searchParams.append('type', type)
    }
    const response = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'GET',
    })
    if (!response.ok) {
        throw new Error('Failed to fetch Prompts.')
    }
    return response.json()
}

export async function createPrompt(
    accessToken: string,
    prompt: { name: string, type: PromptType, content: string }
): Promise<Prompt> {
    const response = await fetch(`${AI_API}/prompts`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(prompt),
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to create Prompt.')
    }
    return response.json()
}

export async function updatePrompt(
    accessToken: string,
    prompt: { name: string, content: string }
): Promise<Prompt> {
    const response = await fetch(`${AI_API}/prompts`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        method: 'PUT',
        body: JSON.stringify(prompt),
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to update Prompt.')
    }
    return response.json()
}

export async function deletePrompt(
    accessToken: string,
    name: string
): Promise<void> {
    const response = await fetch(`${AI_API}/prompts/${name}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'DELETE',
    })
    if (!response.ok) {
        throw new Error('Failed to delete Prompt.')
    }
}
