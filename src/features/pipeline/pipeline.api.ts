import {ArtifactStatus, Pipeline} from "@/features/pipeline/pipeline.types";

const AI_API = process.env.NEXT_PUBLIC_AI_API_URL

export async function createPipeline(
    accessToken: string,
    name: string,
    topicKey: string,
    steps: { 
        type: string, 
        systemPromptName: string, 
        userPromptName: string 
    }[] = []
) : Promise<Pipeline> {

    const response =
        await fetch(`${AI_API}/pipelines`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ name, topicKey, steps }),
        })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to create Pipeline.')
    }

    return response.json()
}

export async function updatePipeline(
    accessToken: string,
    name: string,
    steps?: { 
        type: string, 
        systemPromptName?: string | null, 
        userPromptName?: string | null 
    }[]
): Promise<Pipeline> {
    const response = await fetch(`${AI_API}/pipelines`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        method: 'PATCH',
        body: JSON.stringify({ name, steps }),
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to update Pipeline.')
    }
    return response.json()
}

export async function getPipelines(
    accessToken: string
) : Promise<Pipeline[]> {
    const response =
        await fetch(`${AI_API}/pipelines`, {
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

export async function getStepTypes(
    accessToken: string
) : Promise<{type: string, label: string}[]> {
    const response =
        await fetch(`${AI_API}/pipelines/step-types`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            method: 'GET',
        })
    if (!response.ok) {
        throw new Error('Failed to fetch Step Types.')
    }

    return response.json()
}

export async function getPipeline(
    accessToken: string,
    pipelineName: string
) : Promise<Pipeline> {
    const response =
        await fetch(`${AI_API}/pipelines/${pipelineName}`, {
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

export async function getArtifactByStep(
    accessToken: string,
    pipelineName: string,
    step: number
) : Promise<string> {
    const response =
        await fetch(`${AI_API}/pipelines/${pipelineName}/artifacts/${step}`, {
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
        await fetch(`${AI_API}/pipelines/${pipelineName}/artifacts/${step}`, {
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

export async function removeArtifactByStep(
    accessToken: string,
    pipelineName: string,
    step: number
): Promise<Pipeline> {
    const response = await fetch(`${AI_API}/pipelines/${pipelineName}/artifacts/${step}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'DELETE',
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Failed to remove artifact for step ${step}.`)
    }
    return response.json()
}

export async function deletePipeline(
    accessToken: string,
    pipelineName: string
) : Promise<void> {
    const response =
        await fetch(`${AI_API}/pipelines/${pipelineName}`, {
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
    const response = await fetch(`${AI_API}/pipelines/${pipelineName}/run/${step}`, {
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
    const response = await fetch(`${AI_API}/pipelines/${pipelineName}/run-from/${step}`, {
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

export async function pausePipeline(
    accessToken: string,
    pipelineName: string
): Promise<Pipeline> {
    const response = await fetch(`${AI_API}/pipelines/${pipelineName}/pause`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'POST',
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Failed to pause pipeline.`)
    }
    return response.json()
}

export async function abortPipeline(
    accessToken: string,
    pipelineName: string
): Promise<Pipeline> {
    const response = await fetch(`${AI_API}/pipelines/${pipelineName}/abort`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'POST',
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Failed to abort pipeline.`)
    }
    return response.json()
}
