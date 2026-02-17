import {LoginRequest, TokenResponse} from './auth.types'

const IDENTITY_API = process.env.NEXT_PUBLIC_IDENTITY_API_URL

export async function login(
    request: LoginRequest
): Promise<TokenResponse> {
    const response = await fetch(`${IDENTITY_API}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        throw new Error('Invalid credentials')
    }

    return response.json()
}

export async function refresh(): Promise<TokenResponse> {
    const response = await fetch(`${IDENTITY_API}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error('Not authenticated')
    }

    return response.json()
}

export async function logout(): Promise<void> {
    await fetch(`${IDENTITY_API}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    })
}
