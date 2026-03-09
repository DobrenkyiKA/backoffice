import {useState} from 'react'
import {Topic, TopicNode} from './topic.types'
import {ContextMenu} from '@/components/ContextMenu'

type Props = {
    node: TopicNode
    level: number
    expandedPaths: Set<string>
    selectedTopicKeys: string[]
    onToggleExpand: (path: string) => void
    onToggleSelect: (key: string) => void
    onAction: (action: { type: 'create'; parentPath: string | null } | { type: 'edit'; topic: Topic } | { type: 'delete'; topic: Topic }) => void
}

export function TopicNodeItem({
                                  node,
                                  level,
                                  expandedPaths,
                                  selectedTopicKeys,
                                  onToggleExpand,
                                  onToggleSelect,
                                  onAction,
                              }: Props) {
    const { topic, children } = node
    const isExpanded = expandedPaths.has(topic.path)
    const isSelected = selectedTopicKeys.includes(topic.key)
    const hasChildren = children.length > 0

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        setContextMenu({ x: e.clientX, y: e.clientY })
    }

    return (
        <div>
            <div
                onContextMenu={handleContextMenu}
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

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    options={[
                        { label: 'Edit', onClick: () => onAction({ type: 'edit', topic }) },
                        { label: 'Add child', onClick: () => onAction({ type: 'create', parentPath: topic.path }) },
                        { label: 'Delete', onClick: () => onAction({ type: 'delete', topic }) },
                    ]}
                />
            )}

            {isExpanded &&
                children.map(child => (
                    <TopicNodeItem
                        key={child.topic.key}
                        node={child}
                        level={level + 1}
                        expandedPaths={expandedPaths}
                        selectedTopicKeys={selectedTopicKeys}
                        onToggleExpand={onToggleExpand}
                        onToggleSelect={onToggleSelect}
                        onAction={onAction}
                    />
                ))}
        </div>
    )
}