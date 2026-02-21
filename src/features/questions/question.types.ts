/**
 * Frontend representation of backend QuestionResponse DTO.
 * This mirrors the API contract.
 */
export type QuestionResponse = {
    id: string
    key: string
    prompt: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    labels: string[]
    topics: string[]          // topic keys

    interview?: {
        shortAnswer: string
        longAnswer?: string
    }

    quiz?: {
        answers: QuizAnswerResponse[]
    }
}

export type QuizAnswerResponse = {
    text: string
    correct: boolean
    explanation?: string
}

export type QuizQuestion = {
    itemId: string
    format: 'QUIZ'
    prompt: string
    answers: Answer[]
}

export type Answer = {
    text: string
    correct: boolean
    explanation?: string
}