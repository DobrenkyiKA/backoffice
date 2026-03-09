import {useState} from 'react'

type Props = {
    initialKey?: string
    initialName?: string
    initialDescription?: string
    parentPath?: string | null
    onSave: (key: string, name: string, description?: string) => Promise<void>
    onCancel: () => void
    isEdit?: boolean
}

export function TopicForm({
                               initialKey = '',
                               initialName = '',
                               initialDescription = '',
                               parentPath = null,
                               onSave,
                               onCancel,
                               isEdit = false,
                           }: Props) {
    const [key, setKey] = useState(initialKey.toLowerCase().replace(/\s+/g, '-'))
    const [name, setName] = useState(initialName)
    const [description, setDescription] = useState(initialDescription)
    const [isKeyLocked, setIsKeyLocked] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const sanitizeKey = (val: string) => val.toLowerCase().replace(/\s+/g, '-')

    const handleNameChange = (newName: string) => {
        setName(newName)
        if (isKeyLocked) {
            setKey(sanitizeKey(newName))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await onSave(key, name, description)
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            
            {parentPath && (
                <div>
                    <label className="block text-sm font-medium text-gray-300">Parent Path</label>
                    <div className="mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-400 text-sm">
                        {parentPath}
                    </div>
                </div>
            )}

            <div className="relative">
                <label className="block text-sm font-medium text-gray-300">Key</label>
                <div className="mt-1 flex gap-2">
                    <input
                        type="text"
                        required
                        pattern="[a-z0-9-]+"
                        title="Key must contain only lowercase letters, numbers, and hyphens"
                        value={key}
                        onChange={e => setKey(sanitizeKey(e.target.value))}
                        readOnly={isKeyLocked}
                        className={`block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white ${isKeyLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                        placeholder="e.g. spring-boot"
                    />
                    <button
                        type="button"
                        onClick={() => setIsKeyLocked(!isKeyLocked)}
                        className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${isKeyLocked ? 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700' : 'bg-blue-600 text-white border-transparent hover:bg-blue-700'}`}
                        title={isKeyLocked ? "Unlock key field" : "Lock key field"}
                    >
                        🔑
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={e => handleNameChange(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                    placeholder="e.g. Spring Boot"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300">Description (optional)</label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white h-24"
                    placeholder="Describe the topic..."
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition-colors"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    disabled={loading}
                >
                    {loading ? 'Saving…' : 'Save'}
                </button>
            </div>
        </form>
    )
}
