import {useMemo, useState} from 'react'
import {buildTopicTree} from './topic.tree.utils'
import {TopicNodeItem} from './TopicNodeItem'
import {useTopics} from './useTopics'
import {Modal} from '@/components/Modal'
import {TopicForm} from './TopicForm'
import {Topic} from './topic.types'

type Props = {
    selectedTopicKeys: string[]
    onToggleTopic: (key: string) => void
}

type Action =
    | { type: 'create'; parentPath: string | null }
    | { type: 'edit'; topic: Topic }
    | { type: 'delete'; topic: Topic }

export function TopicTree({
                              selectedTopicKeys,
                              onToggleTopic,
                          }: Props) {
    const {topics, loading, error, createTopic, updateTopic, deleteTopic, moveTopic} = useTopics()
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
    const [action, setAction] = useState<Action | null>(null)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    const tree = useMemo(() => buildTopicTree(topics), [topics])

    function toggleExpand(path: string) {
        setExpandedPaths(prev => {
            const next = new Set(prev)
            next.has(path) ? next.delete(path) : next.add(path)
            return next
        })
    }

    const handleSave = async (key: string, name: string, coverageArea: string, exclusions: string) => {
        if (!action) return
        if (action.type === 'create') {
            await createTopic(key, name, action.parentPath, coverageArea, exclusions)
        } else if (action.type === 'edit') {
            await updateTopic(action.topic.key, key, name, coverageArea, exclusions)
        }
        setAction(null)
    }

    const handleDelete = async () => {
        if (action?.type === 'delete') {
            setDeleteError(null)
            try {
                await deleteTopic(action.topic.key)
                setAction(null)
            } catch (err: any) {
                setDeleteError(err.message)
            }
        }
    }

    const handleMove = async (key: string, newParentPath: string | null) => {
        try {
            await moveTopic(key, newParentPath)
        } catch (err: any) {
            alert(err.message)
        }
    }

    if (loading) return <div>Loading topics…</div>
    if (error) return <div className="text-red-600">{error}</div>

    return (
        <div className="flex flex-col h-full">
            <div
                className="flex-1 overflow-auto"
                onDragOver={e => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                }}
                onDrop={e => {
                    e.preventDefault()
                    const draggedKey = e.dataTransfer.getData('topicKey')
                    if (draggedKey) {
                        handleMove(draggedKey, null)
                    }
                }}
            >
                {tree.map(node => (
                    <TopicNodeItem
                        key={node.topic.key}
                        node={node}
                        level={0}
                        expandedPaths={expandedPaths}
                        selectedTopicKeys={selectedTopicKeys}
                        onToggleExpand={toggleExpand}
                        onToggleSelect={onToggleTopic}
                        onAction={setAction}
                        onMove={handleMove}
                    />
                ))}
            </div>

            <button
                onClick={() => setAction({ type: 'create', parentPath: null })}
                className="mt-4 w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors"
            >
                + Add Topic
            </button>

            {action && (action.type === 'create' || action.type === 'edit') && (
                <Modal
                    title={action.type === 'create' ? 'Create Topic' : 'Edit Topic'}
                    onClose={() => setAction(null)}
                >
                    <TopicForm
                        initialKey={action.type === 'edit' ? action.topic.key : ''}
                        initialName={action.type === 'edit' ? action.topic.name : ''}
                        initialCoverageArea={action.type === 'edit' ? action.topic.coverageArea : ''}
                        initialExclusions={action.type === 'edit' ? action.topic.exclusions : ''}
                        parentPath={action.type === 'create' ? action.parentPath : null}
                        onSave={handleSave}
                        onCancel={() => setAction(null)}
                        isEdit={action.type === 'edit'}
                    />
                </Modal>
            )}

            {action && action.type === 'delete' && (
                <Modal title="Delete Topic" onClose={() => { setAction(null); setDeleteError(null); }}>
                    <div className="space-y-4">
                        {deleteError && <div className="text-red-500 text-sm mb-4">{deleteError}</div>}
                        <p className="text-sm text-gray-300">
                            Are you sure you want to delete topic <strong>{action.topic.name}</strong>?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setAction(null); setDeleteError(null); }}
                                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}