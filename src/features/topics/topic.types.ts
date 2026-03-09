export type Topic = {
    key: string
    name: string
    path: string
}

export type TopicNode = {
    topic: Topic
    children: TopicNode[]
}