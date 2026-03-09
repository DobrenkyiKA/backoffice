export type ArtifactStatus = 'PENDING_FOR_APPROVAL' | 'APPROVED' | 'TO_BE_REGENERATED'

export type PipelineStep = {
    step: number
    status: ArtifactStatus | null
}

export type Pipeline = {
    pipelineName: string
    topicKey: string
    status: string
    createdAt: string
    updatedAt: string
    steps: PipelineStep[]
}