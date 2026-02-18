export type Topic = {
    id: string
    key: string
    name: string
    parentId: string | null
    path: string
}

export type TopicNode = {
    topic: Topic
    children: TopicNode[]
}