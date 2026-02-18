import { TopicNode } from './topic.types'

type Props = {
    node: TopicNode
    level: number
    expandedPaths: Set<string>
    selectedPath: string | null
    onToggle: (path: string) => void
    onSelect: (path: string) => void
}

/**
 * TopicNodeItem renders a single topic row.
 * It is stateless and purely presentational.
 */
export function TopicNodeItem({
                                  node,
                                  level,
                                  expandedPaths,
                                  selectedPath,
                                  onToggle,
                                  onSelect,
                              }: Props) {
    const { topic, children } = node
    const isExpanded = expandedPaths.has(topic.path)
    const isSelected = selectedPath === topic.path
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
                {/* Expand / collapse */}
                {hasChildren ? (
                    <span
                        onClick={e => {
                            e.stopPropagation() // prevent selecting when toggling
                            onToggle(topic.path)
                        }}
                        className="w-4 inline-flex justify-center"
                    >
            {isExpanded ? '▼' : '▶'}
          </span>
                ) : (
                    <span className="w-4" />
                )}

                {/* Select topic */}
                <span
                    className="text-sm truncate"
                    onClick={() => onSelect(topic.path)}
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
                        selectedPath={selectedPath}
                        onToggle={onToggle}
                        onSelect={onSelect}
                    />
                ))}
        </div>
    )
}