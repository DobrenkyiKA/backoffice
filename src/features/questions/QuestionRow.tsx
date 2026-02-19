import {QuizQuestion} from './question.types'
import {MarkdownRenderer} from "@/components/MarkdownRenderer";

type Props = {
    question: QuizQuestion
    expanded: boolean
    onToggle: () => void
}

/**
 * QuestionRow renders a single question.
 * It supports collapsed and expanded states.
 *
 * This is a purely presentational component.
 */
export function QuestionRow({question, expanded, onToggle}: Props) {
    return (
        <div className="border rounded">
            {/* Header row (always visible) */}
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

            {/* Expanded details */}
            {expanded && (
                <div className="p-4 bg-gray-50 text-gray-900">
                    <div className="mb-3">
                        <strong>Question</strong>
                        <div className="mt-1">
                            {question.prompt}
                        </div>
                    </div>

                    <div>
                        <strong>Answers</strong>
                        <ul className="mt-2 space-y-3">
                            {question.answers.map((answer, index) => (
                                <li
                                    key={index}
                                    className={`p-3 rounded border
        ${answer.correct
                                        ? 'bg-green-50 border-green-300'
                                        : 'bg-red-50 border-red-300'
                                    }
      `}
                                >
                                    {/* Correct / incorrect indicator */}
                                    <div className="mb-2 font-medium">
                                        {answer.correct ? '✅ Correct answer' : '❌ Incorrect answer'}
                                    </div>

                                    {/* Markdown content — FULL CONTROL */}
                                    <MarkdownRenderer content={answer.text}/>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}