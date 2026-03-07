'use client'

import {useEffect, useState} from 'react'
import {useAuth} from "@/auth/useAuth";
import {getPipelines} from "@/features/pipeline/pipeline.api";
import {Pipeline} from "@/features/pipeline/pipeline.types";
import Link from 'next/link';

export default function PipelineListPage() {
    const {accessToken} = useAuth()
    const [pipelines, setPipelines] = useState<Pipeline[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!accessToken) return

        setLoading(true)
        getPipelines(accessToken)
            .then(setPipelines)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [accessToken])

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
                        <tr className="bg-gray-100 border-b">
                            <th className="text-left p-3 font-semibold">Name</th>
                            <th className="text-left p-3 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pipelines.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="p-3 text-center text-gray-500">
                                    No pipelines found.
                                </td>
                            </tr>
                        ) : (
                            pipelines.map((pipeline) => (
                                <tr key={pipeline.pipelineKey} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">{pipeline.pipelineKey}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            pipeline.status === 'WAITING_FOR_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                                            pipeline.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {pipeline.status}
                                        </span>
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
