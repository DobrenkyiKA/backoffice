import {Pipeline} from "@/features/pipeline/pipeline.types";

const AI_API = process.env.NEXT_PUBLIC_AI_API_URL

export async function submitTopicsDeclaration(
    accessToken: string,
    yaml: string
) : Promise<Pipeline> {

    const response =
        await fetch(`${AI_API}/pipeline`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'text/plain'
            },
            method: 'POST',
            body: yaml,
        })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to create Pipeline.')
    }

    return response.json()
}

export async function getPipelines(
    accessToken: string
) : Promise<Pipeline[]> {
    const response =
        await fetch(`${AI_API}/pipeline`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method: 'GET',
        })
    if (!response.ok) {
        throw new Error('Failed to fetch Pipelines.')
    }

    return response.json()
}

export async function getPipeline(
    accessToken: string,
    pipelineName: string
) : Promise<Pipeline> {
    const response =
        await fetch(`${AI_API}/pipeline/${pipelineName}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method: 'GET',
        })
    if (!response.ok) {
        throw new Error('Failed to fetch Pipeline.')
    }

    return response.json()
}

export async function getPipelineArtifact(
    accessToken: string,
    pipelineName: string
) : Promise<string> {
    const response =
        await fetch(`${AI_API}/pipeline/${pipelineName}/artifact`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method: 'GET',
        })
    if (!response.ok) {
        throw new Error('Failed to fetch Pipeline artifact.')
    }

    return response.text()
}

export async function updatePipeline(
    accessToken: string,
    pipelineName: string,
    yaml: string
) : Promise<Pipeline> {
    const response =
        await fetch(`${AI_API}/pipeline/${pipelineName}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'text/plain'
            },
            method: 'PUT',
            body: yaml,
        })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to update Pipeline.')
    }

    return response.json()
}

export async function deletePipeline(
    accessToken: string,
    pipelineName: string
) : Promise<void> {
    const response =
        await fetch(`${AI_API}/pipeline/${pipelineName}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method: 'DELETE',
        })
    if (!response.ok) {
        throw new Error('Failed to delete Pipeline.')
    }
}