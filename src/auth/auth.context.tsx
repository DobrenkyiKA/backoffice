'use client'

import React, {createContext, useContext, useEffect, useState} from 'react'
import {AuthState, UserInfo} from './auth.types'
import * as authService from './auth.service'

type AuthContextType = {
    state: AuthState
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: true,
    })

    useEffect(() => {
        authService
            .refresh()
            .then(({accessToken}) => {
                const user = parseUserFromToken(accessToken)
                setState({
                    accessToken,
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                })
            })
            .catch(() => {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                }))
            })
    }, [])

    async function login(email: string, password: string) {
        const {accessToken} = await authService.login({email, password})
        const user = parseUserFromToken(accessToken)

        setState({
            accessToken,
            user,
            isAuthenticated: true,
            isLoading: false,
        })
    }

    async function logout() {
        await authService.logout()
        setState({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
        })
    }

    return (
        <AuthContext.Provider value={{state, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuthContext must be used inside AuthProvider')
    }
    return ctx
}

function parseUserFromToken(token: string): UserInfo {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))

        const payload = JSON.parse(jsonPayload)
        return {
            id: payload.sub,
            roles: payload.roles ?? [],
        }
    } catch (e) {
        console.error('Failed to parse token', e)
        throw new Error('Invalid token format')
    }
}