'use client'

import {useEffect, useState} from 'react'
import {useParams, useRouter} from 'next/navigation'
import {useAuth} from "@/auth/useAuth";
import {getArtifactByStep, getPipeline, updateArtifactByStep} from "@/features/pipeline/pipeline.api";
import {ArtifactStatus, Pipeline} from "@/features/pipeline/pipeline.types";
import Link from 'next/link';

const STEPS = [
    { id: 0, label: 'Step 0: Topics' },
    { id: 1, label: 'Step 1: Questions' },
]

export default function PipelineDetailsPage() {
    const {pipelineName} = useParams()
    const {accessToken} = useAuth()
    
    const [pipeline, setPipeline] = useState<Pipeline | null>(null)
    const [selectedStep, setSelectedStep] = useState<number>(0)
    const [yaml, setYaml] = useState<string>('')
    const [artifactStatus, setArtifactStatus] = useState<ArtifactStatus>('PENDING_FOR_APPROVAL')
    const [loading, setLoading] = useState(true)
    const [artifactLoading, setArtifactLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    useEffect(() => {
        if (!accessToken || !pipelineName) return

        setLoading(true)
        getPipeline(accessToken, pipelineName as string)
        .then(p => {
            setPipeline(p)
            // If step 1 exists, maybe select it by default or stay at 0
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }, [accessToken, pipelineName])

    useEffect(() => {
        if (!accessToken || !pipelineName || selectedStep === null) return

        const stepInfo = pipeline?.steps.find(s => s.step === selectedStep)
        if (stepInfo?.status === undefined) {
            setYaml('')
            return
        }

        setArtifactLoading(true)
        setArtifactStatus(stepInfo.status || 'PENDING_FOR_APPROVAL')
        getArtifactByStep(accessToken, pipelineName as string, selectedStep)
        .then(y => setYaml(y))
        .catch(err => {
            setYaml('')
            setError(`Failed to load artifact for step ${selectedStep}: ${err.message}`)
        })
        .finally(() => setArtifactLoading(false))
    }, [accessToken, pipelineName, selectedStep, pipeline?.steps])

    const handleSave = async () => {
        if (!accessToken || !pipelineName || selectedStep === null) return
        
        setSaving(true)
        setError(null)
        setSuccess(null)
        
        try {
            const updated = await updateArtifactByStep(accessToken, pipelineName as string, selectedStep, yaml, artifactStatus)
            setPipeline(updated)
            setSuccess(`Step ${selectedStep} artifact updated successfully!`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const getStepColor = (stepId: number) => {
        const step = pipeline?.steps.find(s => s.step === stepId)
        if (!step || step.status === null) return 'bg-gray-200 text-gray-500 border-gray-300'
        
        switch (step.status) {
            case 'APPROVED': return 'bg-green-500 text-white border-green-600'
            case 'PENDING_FOR_APPROVAL': return 'bg-yellow-400 text-yellow-900 border-yellow-500'
            case 'TO_BE_REGENERATED': return 'bg-red-500 text-white border-red-600'
            default: return 'bg-gray-200 text-gray-500 border-gray-300'
        }
    }

    if (loading) return <div className="p-6 text-gray-600">Loading pipeline details...</div>
    if (error && !pipeline) return <div className="p-6 text-red-600">Error: {error}</div>

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Link href="/admin/pipeline" className="text-blue-600 hover:underline text-sm mb-2 inline-block font-medium">
                        &larr; Back to Pipelines
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900">Pipeline: {pipelineName}</h1>
                </div>
                <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Overall Status</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        pipeline?.status.includes('PENDING') ? "bg-yellow-100 text-yellow-800" :
                        pipeline?.status.includes('APPROVED') || pipeline?.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                        {pipeline?.status}
                    </span>
                </div>
            </div>

            {/* Pipeline Visual Representation */}
            <div className="mb-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                <div className="relative z-10 flex justify-between">
                    {STEPS.map((step, index) => {
                        const isSelected = selectedStep === step.id
                        const hasArtifact = pipeline?.steps.find(s => s.step === step.id)?.status !== null
                        
                        return (
                            <div key={step.id} className="flex flex-col items-center">
                                <button
                                    onClick={() => setSelectedStep(step.id)}
                                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-200 transform ${
                                        isSelected ? 'scale-125 shadow-lg' : 'hover:scale-110'
                                    } ${getStepColor(step.id)}`}
                                >
                                    {hasArtifact ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span className="text-lg font-bold">{index}</span>
                                    )}
                                </button>
                                <span className={`mt-3 text-sm font-bold ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {(error || success) && (
                <div className={`mb-6 p-4 rounded-lg border flex items-center ${
                    error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                    {error ? (
                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                    ) : (
                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    )}
                    {error || success}
                </div>
            )}
            
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <span className="text-lg font-bold text-gray-800">
                            Artifact for {STEPS.find(s => s.id === selectedStep)?.label}
                        </span>
                        {artifactLoading && <span className="ml-3 text-sm text-gray-500 italic">Loading...</span>}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <label className="text-sm font-semibold text-gray-700 mr-2">Status:</label>
                            <select
                                value={artifactStatus}
                                onChange={(e) => setArtifactStatus(e.target.value as ArtifactStatus)}
                                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="PENDING_FOR_APPROVAL">Pending Approval</option>
                                <option value="APPROVED">Approved</option>
                                <option value="TO_BE_REGENERATED">To Be Regenerated</option>
                            </select>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving || artifactLoading || !yaml}
                            className={`px-5 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 transition-all ${
                                (saving || artifactLoading || !yaml) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {saving ? 'Saving...' : 'Save Artifact'}
                        </button>
                    </div>
                </div>
                <div className="p-0">
                    <textarea
                        className="w-full h-[600px] font-mono text-sm p-6 bg-gray-900 text-gray-100 focus:outline-none border-none resize-none leading-relaxed"
                        value={yaml}
                        onChange={(e) => setYaml(e.target.value)}
                        placeholder={artifactLoading ? "Loading..." : "No artifact data for this step."}
                        spellCheck={false}
                        disabled={artifactLoading}
                    />
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-400 text-center">
                Last modified: {pipeline ? new Date(pipeline.updatedAt).toLocaleString() : 'N/A'}
            </div>
        </div>
    )
}
