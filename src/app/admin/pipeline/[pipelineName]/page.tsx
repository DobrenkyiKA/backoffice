'use client'

import {useEffect, useState} from 'react'
import {useParams, useRouter} from 'next/navigation'
import {useAuth} from "@/auth/useAuth";
import {getPipeline, getPipelineArtifact, updatePipeline} from "@/features/pipeline/pipeline.api";
import {Pipeline} from "@/features/pipeline/pipeline.types";
import Link from 'next/link';

export default function PipelineDetailsPage() {
    const {pipelineName} = useParams()
    const {accessToken} = useAuth()
    const router = useRouter()
    
    const [pipeline, setPipeline] = useState<Pipeline | null>(null)
    const [yaml, setYaml] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    useEffect(() => {
        if (!accessToken || !pipelineName) return

        setLoading(true)
        Promise.all([
            getPipeline(accessToken, pipelineName as string),
            getPipelineArtifact(accessToken, pipelineName as string)
        ])
        .then(([p, y]) => {
            setPipeline(p)
            setYaml(y)
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }, [accessToken, pipelineName])

    const handleSave = async () => {
        if (!accessToken || !pipelineName) return
        
        setSaving(true)
        setError(null)
        setSuccess(null)
        
        try {
            const updated = await updatePipeline(accessToken, pipelineName as string, yaml)
            setPipeline(updated)
            setSuccess('Pipeline updated successfully!')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-6 text-gray-600">Loading pipeline details...</div>
    if (error && !pipeline) return <div className="p-6 text-red-600">Error: {error}</div>

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link href="/admin/pipeline" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
                        &larr; Back to Pipelines
                    </Link>
                    <h1 className="text-2xl font-bold">Pipeline: {pipelineName}</h1>
                </div>
                <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                        pipeline?.status === 'PENDING_FOR_ARTIFACT_APPROVAL' ? "bg-yellow-300 text-yellow-800" :
                        pipeline?.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                        {pipeline?.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                        Modified: {pipeline ? new Date(pipeline.updatedAt).toLocaleString() : ''}
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">YAML Definition</span>
                </div>
                <div className="p-4">
                    <textarea
                        className="w-full h-[500px] font-mono text-sm p-4 border rounded bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={yaml}
                        onChange={(e) => setYaml(e.target.value)}
                        spellCheck={false}
                    />
                </div>
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}
