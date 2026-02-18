export type Answer = {
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