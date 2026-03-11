'use client'

import {useEffect, useState} from 'react'
import {useAuth} from "@/auth/useAuth"
import {getVersions, exportToVersion, importFromVersion, deleteVersion, getLastCommitMessage} from "@/features/sync/sync.api"
import {getPromptVersions, exportPromptsToVersion, importPromptsFromVersion, deletePromptVersion, getLastPromptCommitMessage} from "@/features/prompts/prompt-sync.api"

export default function SyncPage() {
    const {accessToken} = useAuth()
    const [syncType, setSyncType] = useState<'questions' | 'prompts'>('questions')
    const [versions, setVersions] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [exportVersion, setExportVersion] = useState('')
    const [exportMessage, setExportMessage] = useState('')
    const [isExistingVersion, setIsExistingVersion] = useState(false)
    const [selectedImportVersion, setSelectedImportVersion] = useState('')

    const fetchVersions = () => {
        if (!accessToken) return
        const fetchFn = syncType === 'questions' ? getVersions : getPromptVersions
        fetchFn(accessToken)
            .then(setVersions)
            .catch(err => setError(err.message))
    }

    useEffect(() => {
        fetchVersions()
    }, [accessToken, syncType])

    useEffect(() => {
        if (isExistingVersion && exportVersion && accessToken) {
            const getMessageFn = syncType === 'questions' ? getLastCommitMessage : getLastPromptCommitMessage
            getMessageFn(accessToken, exportVersion)
                .then(setExportMessage)
                .catch(err => {
                    console.error("Failed to fetch commit message:", err);
                    setExportMessage('');
                })
        }
    }, [isExistingVersion, exportVersion, accessToken, syncType])

    const handleExport = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!accessToken || !exportVersion || !exportMessage) return
        setLoading(true)
        setError(null)
        setSuccess(null)
        try {
            if (syncType === 'questions') {
                await exportToVersion(accessToken, exportVersion, exportMessage)
            } else {
                await exportPromptsToVersion(accessToken, exportVersion, exportMessage)
            }
            setSuccess(`Successfully exported ${syncType} to version ${exportVersion}`)
            setExportVersion('')
            setExportMessage('')
            setIsExistingVersion(false)
            fetchVersions()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleImport = async () => {
        if (!accessToken || !selectedImportVersion) return
        if (!confirm(`Are you sure you want to import version "${selectedImportVersion}"? This will overwrite existing data.`)) return
        
        setLoading(true)
        setError(null)
        setSuccess(null)
        try {
            if (syncType === 'questions') {
                await importFromVersion(accessToken, selectedImportVersion)
            } else {
                await importPromptsFromVersion(accessToken, selectedImportVersion)
            }
            setSuccess(`Successfully imported ${syncType} from version ${selectedImportVersion}`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!accessToken || !selectedImportVersion) return
        if (!confirm(`Are you sure you want to delete version "${selectedImportVersion}" from BOTH local and remote repositories? This cannot be undone.`)) return

        setLoading(true)
        setError(null)
        setSuccess(null)
        try {
            if (syncType === 'questions') {
                await deleteVersion(accessToken, selectedImportVersion)
            } else {
                await deletePromptVersion(accessToken, selectedImportVersion)
            }
            setSuccess(`Successfully deleted version ${selectedImportVersion}`)
            setSelectedImportVersion('')
            fetchVersions()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-8">Data Synchronization</h1>

            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setSyncType('questions')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        syncType === 'questions'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    Questions Sync
                </button>
                <button
                    onClick={() => setSyncType('prompts')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        syncType === 'prompts'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                    Prompts Sync
                </button>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Export Section */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4">Export to Git</h2>
                    <p className="text-gray-400 text-sm mb-6">Backup the current database state to a new version in the Git repository.</p>
                    <form onSubmit={handleExport} className="space-y-4">
                        <div className="flex items-center space-x-4 mb-2">
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    checked={!isExistingVersion}
                                    onChange={() => {
                                        setIsExistingVersion(false)
                                        setExportVersion('')
                                        setExportMessage('')
                                    }}
                                    className="form-radio"
                                />
                                <span>New Version</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    checked={isExistingVersion}
                                    onChange={() => {
                                        setIsExistingVersion(true)
                                        setExportVersion('')
                                        setExportMessage('')
                                    }}
                                    className="form-radio"
                                />
                                <span>Existing Version</span>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Version Name</label>
                            {isExistingVersion ? (
                                <select
                                    value={exportVersion}
                                    onChange={e => setExportVersion(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                                    required
                                >
                                    <option value="">-- Select version to overwrite --</option>
                                    {versions.map(v => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={exportVersion}
                                    onChange={e => setExportVersion(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                                    placeholder="e.g. v1.1"
                                    required
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Commit Message</label>
                            <textarea
                                value={exportMessage}
                                onChange={e => setExportMessage(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 h-24"
                                placeholder="What changed in this version?"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Export to Git'}
                        </button>
                    </form>
                </div>

                {/* Import Section */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4">Import from Git</h2>
                    <p className="text-gray-400 text-sm mb-6">Restore the database state from an existing version in the Git repository.</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Select Version</label>
                            <select
                                value={selectedImportVersion}
                                onChange={e => setSelectedImportVersion(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                            >
                                <option value="">-- Select a version --</option>
                                {versions.map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleImport}
                            disabled={loading || !selectedImportVersion}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Import to Database'}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading || !selectedImportVersion}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Delete from Git'}
                        </button>
                        <button
                            onClick={fetchVersions}
                            className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Refresh Versions List
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
