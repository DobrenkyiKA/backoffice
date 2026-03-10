import { Page, QuestionResponse } from './question.types'

const QUESTION_API = process.env.NEXT_PUBLIC_QUESTION_API_URL!

type QuestionQuery = {
    topicKeys?: string[]
    difficulties?: string[]
    formats?: string[]
    labels?: string[]
    searchTerm?: string
    searchInAnswers?: boolean
    page?: number
    size?: number
}

/**
 * Fetch questions from backend /questions endpoint.
 */
export async function fetchQuestions(
    query: QuestionQuery,
    accessToken: string
): Promise<Page<QuestionResponse>> {

    const params = new URLSearchParams()

    query.topicKeys?.forEach(k => params.append('topicKeys', k))
    query.difficulties?.forEach(d => params.append('difficulty', d))
    query.formats?.forEach(f => params.append('formats', f))
    query.labels?.forEach(l => params.append('labels', l))
    if (query.searchTerm) {
        params.append('searchTerm', query.searchTerm)
    }
    if (query.searchInAnswers !== undefined) {
        params.append('searchInAnswers', query.searchInAnswers.toString())
    }
    if (query.page !== undefined) {
        params.append('page', query.page.toString())
    }
    if (query.size !== undefined) {
        params.append('size', query.size.toString())
    }

    const response = await fetch(
        `${QUESTION_API}/questions?${params.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch questions')
    }

    return await response.json()
}