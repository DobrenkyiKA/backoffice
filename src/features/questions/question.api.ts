import {QuizQuestion} from "@/features/questions/question.types";

const QUESTION_API = process.env.NEXT_PUBLIC_QUESTION_API_URL!

/**
 * Load QUIZ questions for a topic.
 */
export async function fetchQuizQuestions(
    topicPath: string,
    accessToken: string
): Promise<QuizQuestion[]> {
    const response = await fetch(
        `${QUESTION_API}/learning/topics/${encodeURIComponent(topicPath)}/items?format=QUIZ&state=ANY&limit=20`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error('Failed to load questions')
    }

    return response.json()
}