import { useState, useMemo } from 'react'
import { buildTopicTree } from './topic.tree.utils'
import { TopicNodeItem } from './TopicNodeItem'
import { useTopics } from './useTopics'

type Props = {
    onSelectTopic: (path: string) => void
}

/**
 * TopicTree is the stateful root of the topics UI.
 * It owns:
 * - expansion state
 * - selection state (reports selected topic upward.)
 */
export function TopicTree({onSelectTopic}: Props) {
    const { topics, loading, error } = useTopics()

    // Which nodes are expanded
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

    // Which topic is selected
    const [selectedPath, setSelectedPath] = useState<string | null>(null)

    const tree = useMemo(() => buildTopicTree(topics), [topics])

    function toggle(path: string) {
        setExpandedPaths(prev => {
            const next = new Set(prev)
            next.has(path) ? next.delete(path) : next.add(path)
            return next
        })
    }

    function select(path: string) {
        setSelectedPath(path)
        onSelectTopic(path) //report upward
    }

    if (loading) return <div className="p-2 text-sm">Loading topics…</div>
    if (error) return <div className="p-2 text-sm text-red-600">{error}</div>

    return (
        <div className="overflow-auto max-h-full">
            {tree.map(node => (
                <TopicNodeItem
                    key={node.topic.id}
                    node={node}
                    level={0}
                    expandedPaths={expandedPaths}
                    selectedPath={selectedPath}
                    onToggle={toggle}
                    onSelect={select}
                />
            ))}
        </div>
    )
}