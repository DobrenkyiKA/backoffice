import {useState} from 'react'

type Props = {
    initialKey?: string
    initialName?: string
    parentPath?: string | null
    onSave: (key: string, name: string) => Promise<void>
    onCancel: () => void
    isEdit?: boolean
}

export function TopicForm({
                               initialKey = '',
                               initialName = '',
                               parentPath = null,
                               onSave,
                               onCancel,
                               isEdit = false,
                           }: Props) {
    const [key, setKey] = useState(initialKey)
    const [name, setName] = useState(initialName)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await onSave(key, name)
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

            <div>
                <label className="block text-sm font-medium text-gray-300">Key</label>
                <input
                    type="text"
                    required
                    pattern="[a-z0-9-]+"
                    title="Key must contain only lowercase letters, numbers, and hyphens"
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                    placeholder="e.g. spring-boot"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                    placeholder="e.g. Spring Boot"
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
