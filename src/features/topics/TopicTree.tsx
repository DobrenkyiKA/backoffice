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
    const [searchTerm, setSearchTerm] = useState('')
    const [searchInDescription, setSearchInDescription] = useState(false)
    const [prevSearchTerm, setPrevSearchTerm] = useState('')
    const [prevSearchInDescription, setPrevSearchInDescription] = useState(false)
    const [prevTopics, setPrevTopics] = useState<Topic[]>([])

    if (searchTerm !== prevSearchTerm || searchInDescription !== prevSearchInDescription || topics !== prevTopics) {
        setPrevSearchTerm(searchTerm)
        setPrevSearchInDescription(searchInDescription)
        setPrevTopics(topics)

        const trimmedTerm = searchTerm.trim()
        if (trimmedTerm) {
            const term = trimmedTerm.toLowerCase()
            const matchingPaths = topics.filter(t => {
                const nameMatch = t.name.toLowerCase().includes(term)
                if (!searchInDescription) return nameMatch
                const descMatch =
                    (t.coverageArea || '').toLowerCase().includes(term) ||
                    (t.exclusions || '').toLowerCase().includes(term)
                return nameMatch || descMatch
            }).map(t => t.path)

            if (matchingPaths.length > 0) {
                const next = new Set(expandedPaths)
                let changed = false
                matchingPaths.forEach(path => {
                    const parts = path.split('/')
                    for (let i = 1; i < parts.length; i++) {
                        const p = parts.slice(0, i).join('/')
                        if (!next.has(p)) {
                            next.add(p)
                            changed = true
                        }
                    }
                })
                if (changed) {
                    setExpandedPaths(next)
                }
            }
        }
    }

    const filteredTopics = useMemo(() => {
        const trimmedTerm = searchTerm.trim()
        if (!trimmedTerm) return topics

        const term = trimmedTerm.toLowerCase()
        const matches = topics.filter(t => {
            const nameMatch = t.name.toLowerCase().includes(term)
            if (!searchInDescription) return nameMatch

            const descMatch =
                (t.coverageArea || '').toLowerCase().includes(term) ||
                (t.exclusions || '').toLowerCase().includes(term)
            return nameMatch || descMatch
        })

        if (matches.length === 0) return []

        const resultPaths = new Set<string>()
        matches.forEach(topic => {
            const parts = topic.path.split('/')
            for (let i = 1; i <= parts.length; i++) {
                resultPaths.add(parts.slice(0, i).join('/'))
            }
        })

        return topics.filter(t => resultPaths.has(t.path))
    }, [topics, searchTerm, searchInDescription])

    const tree = useMemo(() => buildTopicTree(filteredTopics), [filteredTopics])

    function toggleExpand(path: string) {
        setExpandedPaths(prev => {
            const next = new Set(prev)
            if (next.has(path)) {
                next.delete(path)
            } else {
                next.add(path)
            }
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
            } catch (err: unknown) {
                setDeleteError((err as Error).message)
            }
        }
    }

    const handleMove = async (key: string, newParentPath: string | null) => {
        try {
            await moveTopic(key, newParentPath)
        } catch (err: unknown) {
            alert((err as Error).message)
        }
    }

    if (loading) return <div>Loading topics…</div>
    if (error) return <div className="text-red-600">{error}</div>

    return (
        <div className="flex flex-col h-full">
            {/* Search Section */}
            <div className="mb-4 p-2 bg-gray-900/50 border border-gray-700 rounded-lg space-y-2">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search topics..."
                        className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-green-500 placeholder:text-gray-500"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-200"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Search Type</span>
                    <button
                        onClick={() => setSearchInDescription(!searchInDescription)}
                        className={`flex items-center gap-2 px-2 py-1 rounded text-[11px] transition-colors border ${
                            searchInDescription
                                ? 'bg-green-500/10 border-green-500/50 text-green-400'
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                    >
                        {searchInDescription ? 'Name + Desc' : 'Name Only'}
                        <div className={`w-3 h-3 rounded-full border border-current flex items-center justify-center`}>
                            {searchInDescription && <div className="w-1.5 h-1.5 rounded-full bg-current"/>}
                        </div>
                    </button>
                </div>
            </div>

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
                        <div className="text-sm text-gray-300 space-y-2">
                            <p>Are you sure you want to delete topic <strong>{action.topic.name}</strong>?</p>
                            {(action.topic.childCount > 0 || action.topic.questionCount > 0) && (
                                <p className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400">
                                    Warning: This topic contains
                                    {action.topic.childCount > 0 && ` ${action.topic.childCount} subtopics`}
                                    {action.topic.childCount > 0 && action.topic.questionCount > 0 && ' and'}
                                    {action.topic.questionCount > 0 && ` ${action.topic.questionCount} questions`}
                                    . By removing the topic, all subtopics and questions will be also removed.
                                </p>
                            )}
                        </div>
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