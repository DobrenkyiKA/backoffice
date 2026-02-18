'use client'

import {TopicNode} from "@/features/topics/topic.types";

type Props = {
    node: TopicNode
    level: number
    expandedPaths: Set<string>
    onToggle: (path: string) => void
}

export function TopicNodeItem({
                                  node,
                                  level,
                                  expandedPaths,
                                  onToggle,
                              }: Props) {
    const {topic, children} = node
    const isExpanded = expandedPaths.has(topic.path)
    const hasChildren = children.length > 0

    return (
        <div>
            <div
                className="flex items-center gap-1 py-1 hover:bg-gray-100 cursor-pointer"
                style={{paddingLeft: level * 16}}
            >
                {hasChildren ? (
                    <span
                        onClick={() => onToggle(topic.path)}
                        className="w-4 inline-flex justify-center"
                    >
            {isExpanded ? '▼' : '▶'}
          </span>
                ) : (
                    <span className="w-4"/>
                )}

                <span className="text-sm truncate">{topic.name}</span>
            </div>

            {isExpanded &&
                children.map(child => (
                    <TopicNodeItem
                        key={child.topic.id}
                        node={child}
                        level={level + 1}
                        expandedPaths={expandedPaths}
                        onToggle={onToggle}
                    />
                ))}
        </div>
    )
}