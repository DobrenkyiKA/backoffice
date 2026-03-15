export type ArtifactStatus = 'PENDING_FOR_APPROVAL' | 'APPROVED'

export type PipelineStep = {
    step: number
    type: string
    status: ArtifactStatus | null
    systemPromptName: string | null
    systemPrompt: string
    userPromptName: string | null
    userPrompt: string
}

export type PromptType = 'SYSTEM' | 'USER'

export type Prompt = {
    id: number | null
    type: PromptType
    name: string
    content: string
}

export type Pipeline = {
    pipelineName: string
    topicKey: string
    status: string
    createdAt: string
    updatedAt: string
    steps: PipelineStep[]
}