'use client'

import {useEffect, useState} from 'react'
import {useAuth} from "@/auth/useAuth";
import {getPipelines, deletePipeline} from "@/features/pipeline/pipeline.api";
import {Pipeline} from "@/features/pipeline/pipeline.types";
import Link from 'next/link';
import {useRouter} from "next/navigation";

export default function PipelineListPage() {
    const {accessToken} = useAuth()
    const router = useRouter()
    const [pipelines, setPipelines] = useState<Pipeline[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPipelines = () => {
        if (!accessToken) return

        setLoading(true)
        getPipelines(accessToken)
            .then(setPipelines)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        fetchPipelines()
    }, [accessToken])

    const handleDelete = async (pipelineName: string) => {
        if (!accessToken) return
        if (!confirm(`Are you sure you want to delete pipeline "${pipelineName}"?`)) return

        try {
            await deletePipeline(accessToken, pipelineName)
            setPipelines(pipelines.filter(p => p.pipelineName !== pipelineName))
        } catch (err: any) {
            alert(err.message)
        }
    }

    if (loading) return <div className="p-6 text-gray-600">Loading pipelines...</div>
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Content Pipelines</h1>
                <Link
                    href="/admin/pipeline/create"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                    Create Pipeline
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-600 border-b">
                            <th className="text-left p-3 font-semibold">Name</th>
                            <th className="text-left p-3 font-semibold">Status</th>
                            <th className="text-left p-3 font-semibold">Created</th>
                            <th className="text-left p-3 font-semibold">Modified</th>
                            <th className="text-left p-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pipelines.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-3 text-center">
                                    No pipelines found.
                                </td>
                            </tr>
                        ) : (
                            pipelines.map((pipeline) => (
                                <tr
                                    key={pipeline.pipelineName}
                                    className="border-b hover:bg-gray-700 cursor-pointer"
                                    onClick={() => router.push(`/admin/pipeline/${pipeline.pipelineName}`)}
                                >
                                    <td className="p-3 font-medium">{pipeline.pipelineName}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            pipeline.status === 'WAITING_FOR_APPROVAL' ? "bg-yellow-300 text-yellow-800" :
                                            pipeline.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {pipeline.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-sm">{new Date(pipeline.createdAt).toLocaleString()}</td>
                                    <td className="p-3 text-sm">{new Date(pipeline.updatedAt).toLocaleString()}</td>
                                    <td className="p-3 text-sm">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(pipeline.pipelineName)
                                            }}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
