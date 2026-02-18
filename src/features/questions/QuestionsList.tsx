'use client'

import {useQuestions} from './useQuestions'

type Props = {
    topicPath: string | null
}

/**
 * QuestionsList displays QUIZ questions
 * for the currently selected topic.
 */
export function QuestionsList({topicPath}: Props) {
    const {questions, loading, error} = useQuestions(topicPath)

    if (!topicPath) {
        return (
            <div className="text-gray-500">
                Select a topic to see questions
            </div>
        )
    }

    if (loading) {
        return <div>Loading questions…</div>
    }

    if (error) {
        return <div className="text-red-600">{error}</div>
    }

    if (questions.length === 0) {
        return <div>No questions for this topic</div>
    }

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">
                Questions
            </h2>

            <ul className="space-y-2">
                {questions.map(q => (
                    <li
                        key={q.itemId}
                        className="p-3 border rounded hover:bg-gray-100 cursor-pointer"
                    >
                        {q.prompt}
                    </li>
                ))}
            </ul>
        </div>
    )
}