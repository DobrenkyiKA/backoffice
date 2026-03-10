export type ArtifactStatus = 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'TO_BE_REGENERATED'

export type PipelineStep = {
    step: number
    type: string
    status: ArtifactStatus | null
    systemPrompt: string
    userPrompt: string
}

export type Pipeline = {
    pipelineName: string
    topicKey: string
    status: string
    createdAt: string
    updatedAt: string
    steps: PipelineStep[]
}