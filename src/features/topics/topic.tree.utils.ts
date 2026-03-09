import {Topic, TopicNode} from "@/features/topics/topic.types";

export function buildTopicTree(topics: Topic[]): TopicNode[] {
    const nodeMap = new Map<string, TopicNode>()
    const roots: TopicNode[] = []

    // Create all nodes
    for (const topic of topics) {
        nodeMap.set(topic.path, {topic, children: []})
    }

    // Attach children
    for (const topic of topics) {
        const node = nodeMap.get(topic.path)!
        const lastSlash = topic.path.lastIndexOf('/')
        const parentPath = lastSlash > 0 ? topic.path.substring(0, lastSlash) : null

        if (parentPath && nodeMap.has(parentPath)) {
            const parent = nodeMap.get(parentPath)
            if (parent) {
                parent.children.push(node)
            }
        } else {
            roots.push(node)
        }
    }
    return roots
}