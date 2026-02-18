'use client'

import {Topic} from "@/features/topics/topic.types";
import {useEffect, useState} from "react";
import {useAuth} from "@/auth/useAuth";
import {fetchTopics} from "@/features/topics/topic.api";

export function useTopics() {
    const {accessToken} = useAuth()
    const [topics, setTopics] = useState<Topic[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string |null> (null)

    useEffect(() => {
        if (!accessToken) return

        setLoading(true)
        fetchTopics(accessToken)
            .then(setTopics)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [accessToken])

    return {topics, loading, error}
}