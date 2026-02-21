import {useMemo, useState} from 'react'
import {buildTopicTree} from './topic.tree.utils'
import {TopicNodeItem} from './TopicNodeItem'
import {useTopics} from './useTopics'

type Props = {
    selectedTopicKeys: string[]
    onToggleTopic: (key: string) => void
}

export function TopicTree({
                              selectedTopicKeys,
                              onToggleTopic,
                          }: Props) {
    const {topics, loading, error} = useTopics()
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

    const tree = useMemo(() => buildTopicTree(topics), [topics])

    function toggleExpand(path: string) {
        setExpandedPaths(prev => {
            const next = new Set(prev)
            next.has(path) ? next.delete(path) : next.add(path)
            return next
        })
    }

    if (loading) return <div>Loading topics…</div>
    if (error) return <div className="text-red-600">{error}</div>

    return (
        <div className="overflow-auto max-h-full">
            {tree.map(node => (
                <TopicNodeItem
                    key={node.topic.id}
                    node={node}
                    level={0}
                    expandedPaths={expandedPaths}
                    selectedTopicKeys={selectedTopicKeys}
                    onToggleExpand={toggleExpand}
                    onToggleSelect={onToggleTopic}
                />
            ))}
        </div>
    )
}