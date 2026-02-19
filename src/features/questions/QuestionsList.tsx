'use client'

import {useState} from 'react'
import {useQuestions} from './useQuestions'
import {QuestionRow} from './QuestionRow'

type Props = {
    topicPath: string | null
}

/**
 * QuestionsList loads and displays QUIZ questions
 * for the selected topic.
 *
 * It owns the expanded-question UI state.
 */
export function QuestionsList({topicPath}: Props) {
    const {questions, loading, error} = useQuestions(topicPath)

    // ✅ which question is currently expanded
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

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

            <div className="space-y-3">
                {questions.map(question => (
                    <QuestionRow
                        key={question.itemId}
                        question={question}
                        expanded={expandedItemId === question.itemId}
                        onToggle={() =>
                            setExpandedItemId(prev =>
                                prev === question.itemId ? null : question.itemId
                            )
                        }
                    />
                ))}
            </div>
        </div>
    )
}