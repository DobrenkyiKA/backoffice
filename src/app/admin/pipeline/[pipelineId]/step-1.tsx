import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Question = {
    id: string
    topicKey: string
    prompt: string
}

export default function Step1ReviewPage() {
    const params = useParams()
    const pipelineId = params.pipelineId as string

    const [questions, setQuestions] = useState<Question[]>([])
    const [status, setStatus] = useState<string>('')

    useEffect(() => {
        fetch(`http://localhost:8081/pipeline/${pipelineId}/step-1`)
            .then(res => res.json())
            .then(data => {
                setQuestions(data.questions)
                setStatus(data.status)
            })
    }, [pipelineId])

    const grouped = questions.reduce<Record<string, Question[]>>((acc, q) => {
        acc[q.topicKey] = acc[q.topicKey] || []
        acc[q.topicKey].push(q)
        return acc
    }, {})

    function approve() {
        fetch(`http://localhost:8081/pipeline/${pipelineId}/step-1/approve`, {
            method: 'POST',
        }).then(() => alert('Step 1 approved'))
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold">Pipeline {pipelineId}</h1>
            <h2 className="mt-2 text-lg">Step 1 — Question Generation</h2>
            <p>Status: <strong>{status}</strong></p>

            {Object.entries(grouped).map(([topic, qs]) => (
                <div key={topic} className="mt-6">
                    <h3 className="font-semibold">Topic: {topic}</h3>
                    <ul className="list-disc ml-6">
                        {qs.map(q => (
                            <li key={q.id}>{q.prompt}</li>
                        ))}
                    </ul>
                </div>
            ))}

            <button
                onClick={approve}
                className="mt-8 px-4 py-2 bg-blue-600 text-white rounded"
            >
                Approve Step 1
            </button>
        </div>
    )
}