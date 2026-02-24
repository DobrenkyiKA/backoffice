'use client'

import {useState} from 'react'
import {useAuth} from "@/auth/useAuth";
import {submitTopicsDeclaration} from "@/features/pipeline/pipeline.api";

export default function CreatePipelinePage() {
    const {accessToken} = useAuth()
    const [loading, setLoading] = useState(true)
    const [yaml, setYaml] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [pipelineId, setPipelineId] = useState<string | null>(null)

    function submit() {
        if (!accessToken) return
        setLoading(true)
        submitTopicsDeclaration(accessToken, yaml)
            .then(pipeline => setPipelineId(pipeline.pipelineId))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }

    // if (loading) return <div>Loading topics…</div>
    // if (error) return <div className="text-red-600">{error}</div>

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold">Create Content Pipeline</h1>

            <textarea
                className="w-full h-80 border mt-4 p-2 font-mono"
                value={yaml}
                onChange={e => setYaml(e.target.value)}
                placeholder="Paste topic definition YAML here"
            />

            <button
                onClick={submit}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            >
                Create Pipeline
            </button>

            {pipelineId && (
                <p className="mt-4">
                    Pipeline created: <strong>{pipelineId}</strong>
                </p>
            )}
        </div>
    )
}