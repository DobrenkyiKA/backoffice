import {Topic, TopicNode} from "@/features/topics/topic.types";

export function buildTopicTree(topics: Topic[]): TopicNode[] {
    const nodeMap = new Map<string, TopicNode>()
    const roots: TopicNode[] = []

    // Create all nodes
    for (const topic of topics) {
        nodeMap.set(topic.id, {topic, children: []})
    }

    // Attach children
    for (const topic of topics) {
        const node = nodeMap.get(topic.id)!
        if (topic.parentId) {
            const parent = nodeMap.get(topic.parentId)
            if (parent) {
                parent.children.push(node)
            }
        } else {
            roots.push(node)
        }
    }
    return roots
}