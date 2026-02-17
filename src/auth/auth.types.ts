export type UserInfo = {
    id: string
    roles: string[]
}

export type AuthState = {
    accessToken: string | null
    user: UserInfo | null
    isAuthenticated: boolean
    isLoading: boolean
}

export type LoginRequest = {
    email: string
    password: string
}

export type TokenResponse = {
    accessToken: string
}