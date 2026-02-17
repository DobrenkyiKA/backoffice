'use client'

import { useAuth } from '@/auth/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode
}) {
    const { isAuthenticated, isAdmin, isLoading, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !isAdmin)) {
            router.push('/login')
        }
    }, [isLoading, isAuthenticated, isAdmin, router])

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    if (!isAuthenticated || !isAdmin) {
        return null
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-gray-900 text-white p-4 flex justify-between">
                <span>PIQ Admin</span>
                <button onClick={logout} className="text-sm underline">
                    Logout
                </button>
            </header>
            <main className="flex-1 p-4">{children}</main>
        </div>
    )
}