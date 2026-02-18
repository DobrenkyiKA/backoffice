'use client'

import {useAuth} from "@/auth/useAuth";
import {useEffect, useState} from "react";
import {QuizQuestion} from "@/features/questions/question.types";
import {fetchQuizQuestions} from "@/features/questions/question.api";

export function useQuestions(topicPath: string | null) {
    const {accessToken} = useAuth()

    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!topicPath || !accessToken) {
            setQuestions([])
            return
        }

        setLoading(true)
        setError(null)

        fetchQuizQuestions(topicPath, accessToken)
            .then(setQuestions)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [topicPath, accessToken])
    return {questions, loading, error}
}

