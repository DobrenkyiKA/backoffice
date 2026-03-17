export type Topic = {
    key: string
    name: string
    path: string
    coverageArea: string
    exclusions: string
    questionCount: number
    childCount: number
}

export type TopicNode = {
    topic: Topic
    children: TopicNode[]
}