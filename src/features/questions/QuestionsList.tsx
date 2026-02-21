'use client'

import { useEffect, useState } from 'react'
import { fetchQuestions } from './question.api'
import { QuestionRow } from './QuestionRow'
import { useAuth } from '@/auth/useAuth'
import {QuestionResponse} from "@/features/questions/question.types";
import { Filters } from './QuestionFilters'

type Props = {
    topicKeys: string[]
    filters: Filters
}

export function QuestionsList({ topicKeys, filters }: Props) {
    const { accessToken } = useAuth()
    const [questions, setQuestions] = useState<QuestionResponse[]>([])
    const [expandedId, setExpandedId] = useState<string | null>(null)

    useEffect(() => {
        if (!accessToken) return

        fetchQuestions(
            {
                topicKeys,
                difficulties: filters.difficulties,
                formats: filters.formats,
                labels: filters.labels,
            },
            accessToken
        ).then(setQuestions)
    }, [topicKeys, filters, accessToken])

    return (
        <div>
            {questions.map(q => (
                <QuestionRow
                    key={q.id}
                    question={q}
                    expanded={expandedId === q.id}
                    onToggle={() =>
                        setExpandedId(prev => (prev === q.id ? null : q.id))
                    }
                />
            ))}
        </div>
    )
}