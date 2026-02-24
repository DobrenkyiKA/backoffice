import {Topic} from "@/features/topics/topic.types";

const QUESTION_API = process.env.NEXT_PUBLIC_QUESTION_API_URL

export async function fetchTopics(
    accessToken: string
) : Promise<Topic[]> {
    const response =
        await fetch(`${QUESTION_API}/topics`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
    if (!response.ok) {
        throw new Error('Failed to fetch topics')
    }

    return response.json()
}