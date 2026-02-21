import { QuestionResponse } from './question.types'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'

type Props = {
    question: QuestionResponse
    expanded: boolean
    onToggle: () => void
}

/**
 * Renders a single question row in admin backoffice.
 * - Collapsed: shows question prompt
 * - Expanded: shows interview content and/or quiz content inline
 */
export function QuestionRow({ question, expanded, onToggle }: Props) {
    return (
        <div className="border rounded mb-3">
            {/* Header row */}
            <div
                className={`p-3 cursor-pointer flex items-center justify-between
          ${expanded ? 'bg-blue-600 text-white' : 'hover:bg-blue-500'}
        `}
                onClick={onToggle}
            >
        <span className="font-medium">
          {question.prompt}
        </span>
                <span className="text-sm">
          {expanded ? '▼' : '▶'}
        </span>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="p-4 bg-gray-50 text-gray-900 space-y-4">
                    {/* Interview content */}
                    {question.interview && (
                        <div>
                            <strong>Interview</strong>

                            <div className="mt-2">
                                <div className="font-medium">Short answer</div>
                                <MarkdownRenderer content={question.interview.shortAnswer} />
                            </div>

                            {question.interview.longAnswer && (
                                <div className="mt-3">
                                    <div className="font-medium">Long answer</div>
                                    <MarkdownRenderer content={question.interview.longAnswer} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quiz content */}
                    {question.quiz && (
                        <div>
                            <strong>Quiz answers</strong>

                            <ul className="mt-2 space-y-3">
                                {question.quiz.answers.map((answer, index) => (
                                    <li
                                        key={index}
                                        className={`p-3 rounded border flex gap-2
                      ${answer.correct
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'}
                    `}
                                    >
                    <span className="mt-1">
                      {answer.correct ? '✅' : '❌'}
                    </span>

                                        <div className="flex-1">
                                            <MarkdownRenderer content={answer.text} />

                                            {answer.explanation && (
                                                <div className="mt-2 text-sm italic text-gray-700">
                                                    <MarkdownRenderer content={answer.explanation} />
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}