'use client'

import {useTopics} from "@/features/topics/useTopics";
import {useMemo, useState} from "react";
import {buildTopicTree} from "@/features/topics/topic.tree.utils";
import {TopicNodeItem} from "@/features/topics/TopicNodeItem";

export function TopicTree() {
    const {topics, loading, error} = useTopics()
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

    const tree = useMemo(() => buildTopicTree(topics), [topics])

    function toggle(path: string) {
        setExpandedPaths(prev => {
            const next = new Set(prev)
            next.has(path) ? next.delete(path) : next.add(path)
            return next
        })
    }

    if (loading) {
        return <div className="p-2 text-sm text-black">Loading topics...</div>
    }

    if (error) {
        return <div className="p-2 text-sm text-red-600">{error}</div>
    }

    return (
        <div className="overflow-auto max-h-full">
            {tree.map(node => (
                <TopicNodeItem
                    key={node.topic.id}
                    node={node}
                    level={0}
                    expandedPaths={expandedPaths}
                    onToggle={toggle}
                />
            ))}
        </div>
    )
}