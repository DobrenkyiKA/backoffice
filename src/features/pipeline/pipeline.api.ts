import {ArtifactStatus, Pipeline} from "@/features/pipeline/pipeline.types";

const AI_API = process.env.NEXT_PUBLIC_AI_API_URL

export async function createPipeline(
    accessToken: string,
    name: string,
    topicKey: string
) : Promise<Pipeline> {

    const response =
        await fetch(`${AI_API}/pipeline`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ name, topicKey }),
        })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to create Pipeline.')
    }

    return response.json()
}

export async function updatePipelineMetadata(
    accessToken: string,
    pipelineName: string,
    topicKey: string
): Promise<Pipeline> {
    const response = await fetch(`${AI_API}/pipeline/${pipelineName}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        method: 'PATCH',
        body: JSON.stringify({ topicKey }),
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to update Pipeline metadata.')
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

export async function getArtifactByStep(
    accessToken: string,
    pipelineName: string,
    step: number
) : Promise<string> {
    const response =
        await fetch(`${AI_API}/pipeline/${pipelineName}/artifact/${step}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method: 'GET',
        })
    if (!response.ok) {
        throw new Error(`Failed to fetch Pipeline artifact for step ${step}.`)
    }

    return response.text()
}

export async function updateArtifactByStep(
    accessToken: string,
    pipelineName: string,
    step: number,
    content: string,
    status: ArtifactStatus
) : Promise<Pipeline> {
    const response =
        await fetch(`${AI_API}/pipeline/${pipelineName}/artifact/${step}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify({ content, status }),
        })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Failed to update Pipeline artifact for step ${step}.`)
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

export async function runStep(
    accessToken: string,
    pipelineName: string,
    step: number
): Promise<Pipeline> {
    const response = await fetch(`${AI_API}/pipeline/${pipelineName}/run/${step}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'POST',
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Failed to run step ${step}.`)
    }
    return response.json()
}

export async function runPipelineFrom(
    accessToken: string,
    pipelineName: string,
    step: number
): Promise<Pipeline> {
    const response = await fetch(`${AI_API}/pipeline/${pipelineName}/run-from/${step}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'POST',
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Failed to run pipeline from step ${step}.`)
    }
    return response.json()
}