'use client'

import {useEffect, useMemo, useState} from 'react'
import {useParams, usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useAuth} from "@/auth/useAuth";
import {getArtifactByStep, getPipeline, updateArtifactByStep, runStep, runPipelineFrom, updatePipeline, getStepTypes, pausePipeline, abortPipeline, removeArtifactByStep} from "@/features/pipeline/pipeline.api";
import {getPrompts, createPrompt, updatePrompt, deletePrompt} from "@/features/pipeline/prompt.api";
import {ArtifactStatus, Pipeline, Prompt} from "@/features/pipeline/pipeline.types";
import Link from 'next/link';


export default function PipelineDetailsPage() {
    const {pipelineName} = useParams()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const selectedStep = useMemo(() => {
        const step = searchParams.get('step')
        const parsed = step ? parseInt(step, 10) : 0
        return isNaN(parsed) ? 0 : parsed
    }, [searchParams])

    const setSelectedStep = (step: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('step', step.toString())
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    const {accessToken} = useAuth()
    
    const [pipeline, setPipeline] = useState<Pipeline | null>(null)
    const [yaml, setYaml] = useState<string>('')
    const [allPrompts, setAllPrompts] = useState<Prompt[]>([])
    const [stepTypes, setStepTypes] = useState<{type: string, label: string}[]>([])
    const [systemPrompt, setSystemPrompt] = useState<string>('')
    const [systemPromptName, setSystemPromptName] = useState<string>('')
    const [userPrompt, setUserPrompt] = useState<string>('')
    const [userPromptName, setUserPromptName] = useState<string>('')
    const [artifactStatus, setArtifactStatus] = useState<ArtifactStatus>('PENDING_FOR_APPROVAL')
    const [loading, setLoading] = useState(true)
    const [artifactLoading, setArtifactLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [running, setRunning] = useState(false)
    const [runFromStep, setRunFromStep] = useState<number>(0)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [prevAccessToken, setPrevAccessToken] = useState<string | null>(accessToken)
    const [prevPipelineName, setPrevPipelineName] = useState<string | string[] | undefined>(pipelineName)
    const [prevSelectedStep, setPrevSelectedStep] = useState<number>(selectedStep)
    const [prevPipeline, setPrevPipeline] = useState<Pipeline | null>(null)

    if (accessToken !== prevAccessToken || pipelineName !== prevPipelineName) {
        setPrevAccessToken(accessToken)
        setPrevPipelineName(pipelineName)
        if (accessToken && pipelineName) {
            setLoading(true)
            setError(null)
        } else {
            setLoading(false)
        }
    }

    if (selectedStep !== prevSelectedStep || pipeline !== prevPipeline) {
        setPrevSelectedStep(selectedStep)
        setPrevPipeline(pipeline)

        const stepInfo = pipeline?.steps.find(s => s.step === selectedStep)
        if (stepInfo) {
            setSystemPrompt(stepInfo.systemPrompt || '')
            setSystemPromptName(stepInfo.systemPromptName || '')
            setUserPrompt(stepInfo.userPrompt || '')
            setUserPromptName(stepInfo.userPromptName || '')
            setArtifactStatus(stepInfo.status || 'PENDING_FOR_APPROVAL')

            if (stepInfo.status !== undefined && stepInfo.status !== null) {
                setArtifactLoading(true)
            } else {
                setYaml('')
                setArtifactLoading(false)
            }
        } else {
            setYaml('')
            setArtifactLoading(false)
        }
    }

    useEffect(() => {
        if (!accessToken || !pipelineName) return

        let ignore = false
        Promise.all([
            getPipeline(accessToken, pipelineName as string),
            getPrompts(accessToken),
            getStepTypes(accessToken)
        ])
        .then(([p, pr, st]) => {
            if (ignore) return
            setPipeline(p)
            setAllPrompts(pr)
            setStepTypes(st)
        })
        .catch(err => {
            if (!ignore) setError(err.message)
        })
        .finally(() => {
            if (!ignore) setLoading(false)
        })

        return () => { ignore = true }
    }, [accessToken, pipelineName])

    useEffect(() => {
        if (!accessToken || !pipelineName || selectedStep === null) return

        const stepInfo = pipeline?.steps.find(s => s.step === selectedStep)
        if (stepInfo?.status === undefined || stepInfo?.status === null) {
            return
        }

        let ignore = false
        getArtifactByStep(accessToken, pipelineName as string, selectedStep)
        .then(y => {
            if (!ignore) setYaml(y)
        })
        .catch(err => {
            if (!ignore) {
                setYaml('')
                console.error(`Failed to load artifact for step ${selectedStep}: ${err.message}`)
            }
        })
        .finally(() => {
            if (!ignore) setArtifactLoading(false)
        })

        return () => { ignore = true }
    }, [accessToken, pipelineName, selectedStep, pipeline?.steps])

    useEffect(() => {
        if (!accessToken || !pipelineName || pipeline?.status !== 'GENERATION_IN_PROGRESS') return

        const interval = setInterval(async () => {
            try {
                const updated = await getPipeline(accessToken, pipelineName as string)
                setPipeline(updated)
                
                // Also update YAML if we're on the current step being generated
                // For simplicity, always fetch if it's the selected step and it has at least some status
                const stepInfo = updated.steps.find(s => s.step === selectedStep)
                if (stepInfo && (stepInfo.status || updated.status === 'GENERATION_IN_PROGRESS')) {
                     const newYaml = await getArtifactByStep(accessToken, pipelineName as string, selectedStep)
                     setYaml(newYaml)
                }
            } catch (err) {
                console.error("Polling error:", err)
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [accessToken, pipelineName, pipeline?.status, selectedStep])


    const handleCreatePrompt = async (type: 'SYSTEM' | 'USER') => {
        if (!accessToken || !pipelineName || !pipeline) return
        const name = prompt(`Enter new ${type} prompt name:`)
        if (!name) return

        const content = type === 'SYSTEM' ? systemPrompt : userPrompt
        
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            const newPrompt = await createPrompt(accessToken, { name, type, content })
            setAllPrompts([...allPrompts, newPrompt])
            if (type === 'SYSTEM') setSystemPromptName(name)
            else setUserPromptName(name)

            const updatedSteps = pipeline.steps.map(s => {
                const isSelected = s.step === selectedStep
                return {
                    type: s.type,
                    systemPromptName: (isSelected && type === 'SYSTEM') ? name : s.systemPromptName,
                    userPromptName: (isSelected && type === 'USER') ? name : s.userPromptName
                }
            })

            const updated = await updatePipeline(accessToken, pipelineName as string, updatedSteps)
            setPipeline(updated)
            setSuccess(`Prompt '${name}' created and attached successfully!`)
        } catch (err: unknown) {
            setError((err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateExistingPrompt = async (type: 'SYSTEM' | 'USER') => {
        if (!accessToken) return
        const name = type === 'SYSTEM' ? systemPromptName : userPromptName
        if (!name) return

        if (!confirm(`Are you sure you want to update the shared prompt '${name}'? This will affect all pipelines using it.`)) return

        const content = type === 'SYSTEM' ? systemPrompt : userPrompt
        
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            const updated = await updatePrompt(accessToken, {name, content })
            setAllPrompts(allPrompts.map(p => p.name === name ? updated : p))
            setSuccess(`Prompt '${name}' updated successfully!`)
        } catch (err: unknown) {
            setError((err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    const handleRefreshPrompt = (type: 'SYSTEM' | 'USER') => {
        const name = type === 'SYSTEM' ? systemPromptName : userPromptName
        if (!name) return
        
        const found = allPrompts.find(p => p.name === name)
        if (found) {
            if (type === 'SYSTEM') setSystemPrompt(found.content)
            else setUserPrompt(found.content)
            setSuccess(`Prompt '${name}' refreshed.`)
            setError(null)
        }
    }

    const handleDeletePromptByName = async (name: string) => {
        if (!accessToken || !name) return
        if (!confirm(`Are you sure you want to delete prompt '${name}' from database?`)) return

        setSaving(true)
        try {
            await deletePrompt(accessToken, name)
            setAllPrompts(allPrompts.filter(p => p.name !== name))
            if (systemPromptName === name) setSystemPromptName('')
            if (userPromptName === name) setUserPromptName('')
            setSuccess(`Prompt '${name}' deleted successfully!`)
        } catch (err: unknown) {
            setError((err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveArtifact = async () => {
        if (!accessToken || !pipelineName || selectedStep === null) return
        if (!confirm(`Are you sure you want to remove the artifact for step ${selectedStep}? This will delete the file and all generated progress.`)) return
        
        setSaving(true)
        setError(null)
        setSuccess(null)
        
        try {
            const updated = await removeArtifactByStep(accessToken, pipelineName as string, selectedStep)
            setPipeline(updated)
            setYaml('')
            setSuccess(`Artifact for step ${selectedStep} removed successfully!`)
        } catch (err: unknown) {
            setError((err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    const handleSelectPrompt = (name: string, type: 'SYSTEM' | 'USER') => {
        const found = allPrompts.find(p => p.name === name)
        if (found) {
            if (type === 'SYSTEM') {
                setSystemPromptName(name)
                setSystemPrompt(found.content)
            } else {
                setUserPromptName(name)
                setUserPrompt(found.content)
            }
        } else if (name === "") {
             if (type === 'SYSTEM') {
                setSystemPromptName("")
            } else {
                setUserPromptName("")
            }
        }
    }

    const handleSave = async () => {
        if (!accessToken || !pipelineName || selectedStep === null) return
        
        setSaving(true)
        setError(null)
        setSuccess(null)
        
        try {
            const updated = await updateArtifactByStep(accessToken, pipelineName as string, selectedStep, yaml, artifactStatus)
            setPipeline(updated)
            setSuccess(`Step ${selectedStep} artifact updated successfully!`)
        } catch (err: unknown) {
            setError((err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    const handleContinuePipelineExecution = async () => {
        if (!accessToken || !pipelineName || !pipeline) return
        
        const lastApprovedIndex = [...pipeline.steps].reverse().findIndex(s => s.status === 'APPROVED')
        const nextStep = lastApprovedIndex === -1 ? 0 : pipeline.steps.length - 1 - lastApprovedIndex + 1
        
        if (nextStep >= pipeline.steps.length) {
            setSuccess("All steps are already approved!")
            return
        }

        setRunning(true)
        setError(null)
        setSuccess(null)
        
        try {
            const updated = await runPipelineFrom(accessToken, pipelineName as string, nextStep)
            setPipeline(updated)
            setSuccess(`Pipeline execution continued from step ${nextStep} successfully!`)
            setSelectedStep(nextStep)
        } catch (err: unknown) {
            setError((err as Error).message)
        } finally {
            setRunning(false)
        }
    }

    const handleRunPipelineFrom = async () => {
        if (!accessToken || !pipelineName) return
        
        setRunning(true)
        setError(null)
        setSuccess(null)
        
        try {
            const updated = await runPipelineFrom(accessToken, pipelineName as string, runFromStep)
            setPipeline(updated)
            setSuccess(`Pipeline run from step ${runFromStep} completed successfully!`)
            // Refresh current artifact if needed
            if (selectedStep >= runFromStep) {
                const stepInfo = updated.steps.find(s => s.step === selectedStep)
                if (stepInfo?.status) {
                    const newYaml = await getArtifactByStep(accessToken, pipelineName as string, selectedStep)
                    setYaml(newYaml)
                    setArtifactStatus(stepInfo.status)
                }
            }
        } catch (err: unknown) {
            setError((err as Error).message)
        } finally {
            setRunning(false)
        }
    }

    const handleRunStep = async () => {
        if (!accessToken || !pipelineName || selectedStep === null) return
        
        setRunning(true)
        setError(null)
        setSuccess(null)
        
        try {
            const updated = await runStep(accessToken, pipelineName as string, selectedStep)
            setPipeline(updated)
            setSuccess(`Step ${selectedStep} generation completed successfully!`)
            
            const newYaml = await getArtifactByStep(accessToken, pipelineName as string, selectedStep)
            setYaml(newYaml)
            const stepInfo = updated.steps.find(s => s.step === selectedStep)
            if (stepInfo?.status) setArtifactStatus(stepInfo.status)
        } catch (err: unknown) {
            setError((err as Error).message)
        } finally {
            setRunning(false)
        }
    }

    const handlePause = async () => {
        if (!accessToken || !pipelineName) return
        setError(null)
        setSuccess(null)
        try {
            const updated = await pausePipeline(accessToken, pipelineName as string)
            setPipeline(updated)
            setSuccess(`Pipeline generation paused.`)
        } catch (err: unknown) {
            setError((err as Error).message)
        }
    }

    const handleAbort = async () => {
        if (!accessToken || !pipelineName) return
        if (!confirm("Are you sure you want to abort the generation?")) return
        setError(null)
        setSuccess(null)
        try {
            const updated = await abortPipeline(accessToken, pipelineName as string)
            setPipeline(updated)
            setSuccess(`Pipeline generation aborted.`)
        } catch (err: unknown) {
            setError((err as Error).message)
        }
    }

    const getStepColor = (stepId: number) => {
        const step = pipeline?.steps.find(s => s.step === stepId)
        if (!step || step.status === null) return 'bg-gray-200 text-gray-500 border-gray-300'
        
        switch (step.status) {
            case 'APPROVED': return 'bg-green-500 text-white border-green-600'
            case 'PENDING_FOR_APPROVAL': return 'bg-yellow-400 text-yellow-900 border-yellow-500'
            default: return 'bg-gray-200 text-gray-500 border-gray-300'
        }
    }

    const stepsToDisplay = pipeline?.steps.map(s => {
        const typeInfo = stepTypes.find(st => st.type === s.type)
        return {
            id: s.step,
            label: typeInfo ? typeInfo.label : s.type
        }
    }) || []

    if (loading) return <div className="p-6 text-gray-600">Loading pipeline details...</div>
    if (error && !pipeline) return <div className="p-6 text-red-600">Error: {error}</div>

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Link href="/admin/pipelines" className="text-blue-600 hover:underline text-sm mb-2 inline-block font-medium">
                        &larr; Back to Pipelines
                    </Link>
                </div>
                <div className="text-right flex items-center gap-6">


                    <div className="flex flex-col items-end border-l pl-6 border-gray-200">
                        <div className="text-sm font-semibold text-gray-700 mb-1">Pipeline Status</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            pipeline?.status.includes('PENDING') || pipeline?.status.includes('WAITING') ? "bg-yellow-100 text-yellow-800" :
                            pipeline?.status.includes('APPROVED') || pipeline?.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            pipeline?.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {pipeline?.status}
                        </span>
                    </div>
                    
                    <div className="flex flex-col items-end border-l pl-6 border-gray-200">
                        <div className="text-sm font-semibold text-gray-700 mb-1">Actions</div>
                        <div className="flex items-center gap-2">
                             <select
                                value={runFromStep}
                                onChange={(e) => setRunFromStep(parseInt(e.target.value))}
                                className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                {stepsToDisplay.map(s => (
                                    <option key={s.id} value={s.id}>From {s.label}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleRunPipelineFrom}
                                disabled={running || loading}
                                className={`px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-xs shadow-md hover:bg-indigo-700 transition-all ${
                                    (running || loading) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {running ? 'Running...' : 'Run Pipeline'}
                            </button>
                            {(pipeline?.status === 'ARTIFACT_APPROVED' || (pipeline?.status === 'FAILED' && pipeline?.steps.some(s => s.status === 'APPROVED'))) && (
                                <button
                                    onClick={handleContinuePipelineExecution}
                                    disabled={running || loading}
                                    className={`px-4 py-1.5 bg-green-600 text-white rounded-lg font-bold text-xs shadow-md hover:bg-green-700 transition-all ${
                                        (running || loading) ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {running ? 'Running...' : 'CONTINUE_PIPELINE_EXECUTION'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-white">Pipeline name: {pipelineName}</h1>
                </div>
            </div>
            <div className="flex flex-col mb-8">
                <div className="text-2xl font-extrabold text-white mb-2">Start topic: {pipeline?.topicKey}</div>
            </div>
            {/* Pipeline Visual Representation */}
            <div className="mb-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                <div className="relative z-10 flex justify-between">
                    {stepsToDisplay.map((step, index) => {
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
            
            {/* Prompt Editors */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">System Prompt</span>
                        <div className="flex gap-2">
                             <select
                                value={systemPromptName}
                                onChange={(e) => handleSelectPrompt(e.target.value, 'SYSTEM')}
                                className="text-[10px] border border-gray-300 rounded px-2 py-1 bg-white"
                            >
                                <option value="">Custom / None</option>
                                {allPrompts.filter(p => p.type === 'SYSTEM').map(p => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => handleUpdateExistingPrompt('SYSTEM')}
                                disabled={saving || loading || !systemPromptName}
                                className={`px-4 py-1.5 bg-blue-600 text-white rounded-md font-bold text-xs shadow hover:bg-blue-700 transition-all ${(saving || loading || !systemPromptName) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Save
                            </button>
                            <button
                                onClick={() => handleDeletePromptByName(systemPromptName)}
                                disabled={saving || loading || !systemPromptName}
                                className={`px-4 py-1.5 bg-red-600 text-white rounded-md font-bold text-xs shadow hover:bg-red-700 transition-all ${(saving || loading || !systemPromptName) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => handleRefreshPrompt('SYSTEM')}
                                disabled={saving || loading || !systemPromptName}
                                className={`px-4 py-1.5 bg-gray-600 text-white rounded-md font-bold text-xs shadow hover:bg-gray-700 transition-all ${(saving || loading || !systemPromptName) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Refresh
                            </button>
                            <button
                                onClick={() => handleCreatePrompt('SYSTEM')}
                                disabled={saving || loading}
                                className={`px-4 py-1.5 bg-green-600 text-white rounded-md font-bold text-xs shadow hover:bg-green-700 transition-all ${(saving || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                + New
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="w-full h-48 font-mono text-xs p-4 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white transition-all resize-none border-none"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="Enter system prompt template..."
                    />
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">User Prompt</span>
                        <div className="flex gap-2">
                             <select
                                value={userPromptName}
                                onChange={(e) => handleSelectPrompt(e.target.value, 'USER')}
                                className="text-[10px] border border-gray-300 rounded px-2 py-1 bg-white"
                            >
                                <option value="">Custom / None</option>
                                {allPrompts.filter(p => p.type === 'USER').map(p => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => handleUpdateExistingPrompt('USER')}
                                disabled={saving || loading || !userPromptName}
                                className={`px-4 py-1.5 bg-blue-600 text-white rounded-md font-bold text-xs shadow hover:bg-blue-700 transition-all ${(saving || loading || !userPromptName) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Save
                            </button>
                            <button
                                onClick={() => handleDeletePromptByName(userPromptName)}
                                disabled={saving || loading || !userPromptName}
                                className={`px-4 py-1.5 bg-red-600 text-white rounded-md font-bold text-xs shadow hover:bg-red-700 transition-all ${(saving || loading || !userPromptName) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => handleRefreshPrompt('USER')}
                                disabled={saving || loading || !userPromptName}
                                className={`px-4 py-1.5 bg-gray-600 text-white rounded-md font-bold text-xs shadow hover:bg-gray-700 transition-all ${(saving || loading || !userPromptName) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Refresh
                            </button>
                            <button
                                onClick={() => handleCreatePrompt('USER')}
                                disabled={saving || loading}
                                className={`px-4 py-1.5 bg-green-600 text-white rounded-md font-bold text-xs shadow hover:bg-green-700 transition-all ${(saving || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                + New
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="w-full h-48 font-mono text-xs p-4 bg-gray-50 text-gray-800 focus:outline-none focus:bg-white transition-all resize-none border-none"
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder="Enter user prompt template..."
                    />
                </div>
            </div>

            {/* Logs Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden mb-8 flex flex-col">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">Generation Logs</span>
                </div>
                <div className="h-64 overflow-y-auto p-4 font-mono text-[10px] bg-gray-50 text-gray-800">
                    {pipeline?.logs?.filter(log => log.stepOrder === selectedStep).length ? (
                        pipeline.logs.filter(log => log.stepOrder === selectedStep).map((log, i) => (
                            <div key={i} className="mb-1 border-b border-gray-100 pb-1">
                                <span className="text-gray-400 mr-2">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                                {log.message}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 italic">No logs available for this step.</div>
                    )}
                </div>
            </div>

            {(pipeline?.status === 'PAUSED' || pipeline?.status === 'ABORTED' || pipeline?.status === 'FAILED') && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
                    <span>Generation {pipeline?.status}. You can manage it below.</span>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <span className="text-lg font-bold text-gray-800">
                                Artifact for {stepsToDisplay.find(s => s.id === selectedStep)?.label}
                            </span>
                            {artifactLoading && <span className="ml-3 text-sm text-gray-500 italic">Loading...</span>}
                        </div>
                        
                        <div className="flex items-center">
                            <label className="text-sm font-semibold text-gray-700 mr-2">Status:</label>
                            <select
                                value={artifactStatus}
                                onChange={(e) => setArtifactStatus(e.target.value as ArtifactStatus)}
                                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="PENDING_FOR_APPROVAL">PENDING_FOR_APPROVAL</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="PAUSED">PAUSED</option>
                                <option value="ABORTED">ABORTED</option>
                                <option value="GENERATION_IN_PROGRESS">GENERATION_IN_PROGRESS</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving || artifactLoading || running}
                            className={`px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-md hover:bg-blue-700 transition-all ${
                                (saving || artifactLoading || running) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {saving ? 'Saving...' : 'SAVE_ARTIFACT'}
                        </button>

                        {pipeline?.status === 'GENERATION_IN_PROGRESS' && (
                            <>
                                <button
                                    onClick={handlePause}
                                    className="px-4 py-1.5 bg-yellow-500 text-white rounded-lg font-bold text-xs shadow-md hover:bg-yellow-600 transition-all"
                                >
                                    PAUSE_ARTIFACT_GENERATION
                                </button>
                                <button
                                    onClick={handleAbort}
                                    className="px-4 py-1.5 bg-red-600 text-white rounded-lg font-bold text-xs shadow-md hover:bg-red-700 transition-all"
                                >
                                    ABORT_ARTIFACT_GENERATION
                                </button>
                            </>
                        )}

                        {artifactStatus !== 'APPROVED' && pipeline?.status !== 'GENERATION_IN_PROGRESS' && (
                            <button
                                onClick={handleRunStep}
                                disabled={running || artifactLoading}
                                className="px-4 py-1.5 bg-green-600 text-white rounded-lg font-bold text-xs shadow-md hover:bg-green-700 transition-all"
                            >
                                {running ? 'Running...' : (
                                    pipeline?.steps.find(s => s.step === selectedStep)?.status === null
                                        ? 'GENERATE_ARTIFACT'
                                        : 'RESUME_ARTIFACT_GENERATION'
                                )}
                            </button>
                        )}

                        {pipeline?.steps.find(s => s.step === selectedStep)?.status !== null && (
                            <button
                                onClick={handleRemoveArtifact}
                                disabled={saving || running || artifactLoading}
                                className="px-4 py-1.5 bg-gray-600 text-white rounded-lg font-bold text-xs shadow-md hover:bg-gray-700 transition-all"
                            >
                                REMOVE_ARTIFACT
                            </button>
                        )}
                    </div>
                </div>
                <div className="p-0">
                    <textarea
                        className="w-full h-150 font-mono text-sm p-6 bg-gray-900 text-gray-100 focus:outline-none border-none resize-none leading-relaxed"
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
