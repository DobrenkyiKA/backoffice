'use client'

import { useState } from 'react'

export default function CreatePipelinePage() {
    const [yaml, setYaml] = useState('')
    const [pipelineId, setPipelineId] = useState<string | null>(null)

    function submit() {
        fetch('http://localhost:8081/pipeline/step-0', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: yaml,
        })
            .then(res => res.json())
            .then(data => setPipelineId(data.pipelineId))
    }

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