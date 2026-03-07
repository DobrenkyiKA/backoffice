'use client'

import {useState} from 'react'
import {useAuth} from "@/auth/useAuth";
import {submitTopicsDeclaration} from "@/features/pipeline/pipeline.api";
import {useRouter} from "next/navigation";

export default function CreatePipelinePage() {
    const {accessToken} = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [yaml, setYaml] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [pipelineKey, setPipelineKey] = useState<string | null>(null)

    function submit() {
        if (!accessToken) return
        setLoading(true)
        setError(null)
        submitTopicsDeclaration(accessToken, yaml)
            .then(pipeline => {
                setPipelineKey(pipeline.pipelineKey)
                router.push('/admin/pipeline')
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-6">Create Content Pipeline</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <textarea
                className="w-full h-80 border mt-4 p-2 font-mono"
                value={yaml}
                onChange={e => setYaml(e.target.value)}
                placeholder="Paste topic definition YAML here"
                disabled={loading}
            />

            <div className="mt-4 flex items-center gap-4">
                <button
                    onClick={submit}
                    disabled={loading || !yaml.trim()}
                    className={`px-4 py-2 bg-green-600 text-white rounded transition-colors ${
                        loading || !yaml.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                    }`}
                >
                    {loading ? 'Creating...' : 'Create Pipeline'}
                </button>
                {loading && (
                    <div className="flex items-center text-gray-600">
                        <svg className="animate-spin h-5 w-5 mr-3 text-green-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                    </div>
                )}
            </div>

            {pipelineKey && (
                <p className="mt-4 text-green-600 font-medium">
                    Pipeline created: <strong>{pipelineKey}</strong>. Redirecting...
                </p>
            )}
        </div>
    )
}