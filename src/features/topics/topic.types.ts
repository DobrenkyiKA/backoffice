export type Topic = {
    key: string
    name: string
    path: string
    coverageArea: string
    exclusions: string
}

export type TopicNode = {
    topic: Topic
    children: TopicNode[]
}