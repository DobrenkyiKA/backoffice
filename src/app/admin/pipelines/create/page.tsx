'use client'

import {useEffect, useMemo, useState} from 'react'
import {useAuth} from "@/auth/useAuth";
import {createPipeline, getPrompts, getStepTypes} from "@/features/pipeline/pipeline.api";
import {fetchTopics} from "@/features/topics/topic.api";
import {Topic} from "@/features/topics/topic.types";
import {Prompt} from "@/features/pipeline/pipeline.types";
import {useRouter} from "next/navigation";

export default function CreatePipelinePage() {
    const {accessToken} = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [topicKey, setTopicKey] = useState('')
    const [topicSearch, setTopicSearch] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [topics, setTopics] = useState<Topic[]>([])
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [stepTypes, setStepTypes] = useState<{type: string, label: string}[]>([])
    const [error, setError] = useState<string | null>(null)
    const [pipelineKey, setPipelineKey] = useState<string | null>(null)
    const [selectedSteps, setSelectedSteps] = useState<{
        type: string, 
        systemPromptName?: string, 
        systemPrompt: string, 
        userPromptName?: string, 
        userPrompt: string
    }[]>([
        { type: 'TOPIC_TREE_GENERATION', systemPrompt: '', userPrompt: '' },
        { type: 'QUESTIONS_GENERATION', systemPrompt: '', userPrompt: '' },
        { type: 'LONG_ANSWERS_GENERATION', systemPrompt: '', userPrompt: '' },
        { type: 'SHORT_ANSWERS_GENERATION', systemPrompt: '', userPrompt: '' }
    ])

    useEffect(() => {
        if (!accessToken) return
        Promise.all([
            fetchTopics(accessToken),
            getPrompts(accessToken),
            getStepTypes(accessToken)
        ])
        .then(([t, p, s]) => {
            setTopics(t)
            setPrompts(p)
            setStepTypes(s)
        })
        .catch(err => setError("Failed to load initial data: " + err.message))
    }, [accessToken])

    const filteredTopics = useMemo(() => {
        const term = topicSearch.toLowerCase();
        return topics.filter(t => 
            t.name.toLowerCase().includes(term) ||
            t.key.toLowerCase().includes(term)
        );
    }, [topics, topicSearch]);

    function submit() {
        if (!accessToken) return

        const normalized = name.trim().replace(/\s+/g, '-').toLowerCase();
        if (!normalized) {
            setError("Pipeline name cannot be empty")
            return
        }
        if (!/^[a-z0-9-]+$/.test(normalized)) {
            setError("Pipeline name can only contain alphanumeric characters and '-'")
            return
        }
        if (!topicKey) {
            setError("Please choose a topic")
            return
        }

        setLoading(true)
        setError(null)
        createPipeline(accessToken, normalized, topicKey, selectedSteps)
            .then(pipeline => {
                setPipelineKey(pipeline.pipelineName)
                router.push('/admin/pipelines')
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

            <div className="max-w-3xl space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Pipeline Name
                    </label>
                    <input
                        type="text"
                        className="w-full border p-2 bg-gray-800 text-white rounded"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. java-core-interview-v1"
                        disabled={loading}
                    />
                    <p className="mt-2 text-xs text-gray-400">
                        Whitespaces will be replaced with &quot;-&quot;, only alphanumeric and &quot;-&quot; symbols are allowed. The name will be lower-cased.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Topic
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type to search topic..."
                            className="w-full border p-2 bg-gray-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={topicSearch}
                            onChange={e => {
                                setTopicSearch(e.target.value)
                                setTopicKey('')
                                setShowSuggestions(true)
                            }}
                            onFocus={() => { if (topicSearch) setShowSuggestions(true); }}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            disabled={loading}
                        />
                        {topicSearch && (
                            <button
                                onClick={() => {
                                    setTopicSearch('')
                                    setTopicKey('')
                                    setShowSuggestions(true)
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                            >
                                ✕
                            </button>
                        )}
                        {showSuggestions && topicSearch.length > 0 && (
                            <ul className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded mt-1 max-h-60 overflow-auto shadow-xl">
                                {filteredTopics.length > 0 ? (
                                    filteredTopics.map(topic => (
                                        <li
                                            key={topic.key}
                                            className="p-2 hover:bg-gray-700 cursor-pointer text-sm text-white border-b border-gray-700 last:border-0"
                                            onMouseDown={() => {
                                                setTopicKey(topic.key)
                                                setTopicSearch(`${topic.name} (${topic.key})`)
                                                setShowSuggestions(false)
                                            }}
                                        >
                                            <div className="font-medium">{topic.name}</div>
                                            <div className="text-xs text-gray-400">{topic.key}</div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="p-2 text-sm text-gray-500">No topics found</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="pt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                        Pipeline Steps (Order Matters)
                    </label>
                    <div className="space-y-4">
                        {selectedSteps.map((step, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded border border-gray-700 w-full min-w-fit">
                                <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full text-xs font-bold text-gray-400">
                                    {index}
                                </div>
                                <select
                                    className="grow border p-1.5 bg-gray-900 text-white rounded text-sm"
                                    value={step.type}
                                    onChange={e => {
                                        const newSteps = [...selectedSteps]
                                        newSteps[index].type = e.target.value
                                        setSelectedSteps(newSteps)
                                    }}
                                    disabled={loading}
                                >
                                    {stepTypes.map(t => (
                                        <option key={t.type} value={t.type}>{t.label}</option>
                                    ))}
                                </select>
                                <div className="flex gap-1">
                                    <select
                                        className="text-[10px] border border-gray-600 rounded px-2 py-1 bg-gray-900 text-gray-400"
                                        value={step.systemPromptName || ''}
                                        onChange={(e) => {
                                            const name = e.target.value
                                            const newSteps = [...selectedSteps]
                                            newSteps[index].systemPromptName = name
                                            const found = prompts.find(p => p.name === name)
                                            if (found) newSteps[index].systemPrompt = found.content
                                            setSelectedSteps(newSteps)
                                        }}
                                    >
                                        <option value="">System Prompt (Default)</option>
                                        {prompts.filter(p => p.type === 'SYSTEM').map(p => (
                                            <option key={p.name} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="text-[10px] border border-gray-600 rounded px-2 py-1 bg-gray-900 text-gray-400"
                                        value={step.userPromptName || ''}
                                        onChange={(e) => {
                                            const name = e.target.value
                                            const newSteps = [...selectedSteps]
                                            newSteps[index].userPromptName = name
                                            const found = prompts.find(p => p.name === name)
                                            if (found) newSteps[index].userPrompt = found.content
                                            setSelectedSteps(newSteps)
                                        }}
                                    >
                                        <option value="">User Prompt (Default)</option>
                                        {prompts.filter(p => p.type === 'USER').map(p => (
                                            <option key={p.name} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            if (index === 0) return
                                            const newSteps = [...selectedSteps]
                                            const temp = newSteps[index]
                                            newSteps[index] = newSteps[index - 1]
                                            newSteps[index - 1] = temp
                                            setSelectedSteps(newSteps)
                                        }}
                                        disabled={loading || index === 0}
                                        className="p-1.5 hover:bg-gray-700 rounded text-gray-400 disabled:opacity-30"
                                        title="Move Up"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (index === selectedSteps.length - 1) return
                                            const newSteps = [...selectedSteps]
                                            const temp = newSteps[index]
                                            newSteps[index] = newSteps[index + 1]
                                            newSteps[index + 1] = temp
                                            setSelectedSteps(newSteps)
                                        }}
                                        disabled={loading || index === selectedSteps.length - 1}
                                        className="p-1.5 hover:bg-gray-700 rounded text-gray-400 disabled:opacity-30"
                                        title="Move Down"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedSteps(selectedSteps.filter((_, i) => i !== index))
                                        }}
                                        disabled={loading}
                                        className="p-1.5 hover:bg-red-900/30 text-red-400 rounded"
                                        title="Remove Step"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setSelectedSteps([...selectedSteps, { type: stepTypes[0]?.type || 'TOPIC_TREE_GENERATION', systemPrompt: '', userPrompt: '' }])}
                        disabled={loading}
                        className="mt-4 text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                        + Add Step
                    </button>
                </div>

                <div className="mt-6 flex items-center gap-4">
                    <button
                        onClick={submit}
                        disabled={loading || !name.trim()}
                        className={`px-4 py-2 bg-green-600 text-white rounded transition-colors ${
                            loading || !name.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
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
            </div>

            {pipelineKey && (
                <p className="mt-4 text-green-600 font-medium">
                    Pipeline created: <strong>{pipelineKey}</strong>. Redirecting...
                </p>
            )}
        </div>
    )
}