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
    onMove: (key: string, newParentPath: string | null) => void
}

export function TopicNodeItem({
                                  node,
                                  level,
                                  expandedPaths,
                                  selectedTopicKeys,
                                  onToggleExpand,
                                  onToggleSelect,
                                  onAction,
                                  onMove,
                              }: Props) {
    const { topic, children } = node
    const isExpanded = expandedPaths.has(topic.path)
    const isSelected = selectedTopicKeys.includes(topic.key)
    const hasChildren = children.length > 0

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        setContextMenu({ x: e.clientX, y: e.clientY })
    }

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('topicKey', topic.key)
        e.dataTransfer.effectAllowed = 'move'
        // Stop propagation so parent nodes don't also start dragging
        e.stopPropagation()
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setIsDragOver(true)
        e.stopPropagation()
    }

    const handleDragLeave = () => {
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const draggedKey = e.dataTransfer.getData('topicKey')
        if (draggedKey && draggedKey !== topic.key) {
            onMove(draggedKey, topic.path)
        }
        e.stopPropagation()
    }

    return (
        <div>
            <div
                onContextMenu={handleContextMenu}
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          flex items-center gap-1 py-1 cursor-pointer
          ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-blue-500'}
          ${isDragOver ? 'bg-blue-700 ring-2 ring-blue-400 ring-inset' : ''}
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
                        onMove={onMove}
                    />
                ))}
        </div>
    )
}