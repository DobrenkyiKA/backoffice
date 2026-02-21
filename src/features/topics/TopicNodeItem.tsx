import { TopicNode } from './topic.types'

type Props = {
    node: TopicNode
    level: number
    expandedPaths: Set<string>
    selectedTopicKeys: string[]
    onToggleExpand: (path: string) => void
    onToggleSelect: (key: string) => void
}

export function TopicNodeItem({
                                  node,
                                  level,
                                  expandedPaths,
                                  selectedTopicKeys,
                                  onToggleExpand,
                                  onToggleSelect,
                              }: Props) {
    const { topic, children } = node
    const isExpanded = expandedPaths.has(topic.path)
    const isSelected = selectedTopicKeys.includes(topic.key)
    const hasChildren = children.length > 0

    return (
        <div>
            <div
                className={`
          flex items-center gap-1 py-1 cursor-pointer
          ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-blue-500'}
        `}
                style={{ paddingLeft: level * 16 }}
            >
                {/* Expand / collapse arrow */}
                {hasChildren ? (
                    <span
                        onClick={e => {
                            e.stopPropagation()
                            onToggleExpand(topic.path)
                        }}
                        className="w-4 inline-flex justify-center"
                    >
            {isExpanded ? '▼' : '▶'}
          </span>
                ) : (
                    <span className="w-4" />
                )}

                {/* Topic label */}
                <span
                    className="text-sm truncate flex-1"
                    onClick={() => onToggleSelect(topic.key)}
                >
          {topic.name}
        </span>
            </div>

            {isExpanded &&
                children.map(child => (
                    <TopicNodeItem
                        key={child.topic.id}
                        node={child}
                        level={level + 1}
                        expandedPaths={expandedPaths}
                        selectedTopicKeys={selectedTopicKeys}
                        onToggleExpand={onToggleExpand}
                        onToggleSelect={onToggleSelect}
                    />
                ))}
        </div>
    )
}