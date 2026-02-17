'use client'

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/auth/useAuth";

export default function LoginPage() {
    const {isAuthenticated, isAdmin, isLoading, login} = useAuth()
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isLoading && isAuthenticated && isAdmin) {
            router.push('/admin')
        }
    }, [isLoading, isAuthenticated, isAdmin, router])

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await login(email, password)
            router.push('/admin')
        } catch {
            setError('Invalid email or password')
        } finally {
            setLoading(false)
        }

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-96"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Admin Login
                </h1>

                {error && (
                    <p className="text-red-600 mb-4 text-sm">{error}</p>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-4 p-2 border rounded"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-6 p-2 border rounded"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    )
}