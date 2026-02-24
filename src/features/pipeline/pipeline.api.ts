import {Pipeline} from "@/features/pipeline/pipeline.types";

const AI_API = process.env.NEXT_PUBLIC_AI_API_URL

export async function submitTopicsDeclaration(
    accessToken: string,
    yaml: string
) : Promise<Pipeline> {

    const response =
        await fetch(`${AI_API}/pipeline/step-0`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'text/plain'
            },
            method: 'POST',
            body: yaml,
        })
    if (!response.ok) {
        throw new Error('Failed to create Pipeline.')
    }

    return response.json()
}