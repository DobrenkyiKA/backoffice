'use client'

import { useAuth } from '@/auth/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

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
            <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
                <div className="flex gap-6 items-center">
                    <span className="font-bold">PIQ Admin</span>
                    <nav className="flex gap-4">
                        <Link href="/admin" className="text-sm hover:underline text-gray-300 hover:text-white transition-colors">Questions</Link>
                        <Link href="/admin/pipeline" className="text-sm hover:underline text-gray-300 hover:text-white transition-colors">Pipelines</Link>
                        <Link href="/admin/sync" className="text-sm hover:underline text-gray-300 hover:text-white transition-colors">Sync</Link>
                    </nav>
                </div>
                <button onClick={logout} className="text-sm underline hover:text-gray-300 transition-colors">
                    Logout
                </button>
            </header>
            <main className="flex-1 p-4">{children}</main>
        </div>
    )
}