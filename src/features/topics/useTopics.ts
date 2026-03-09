'use client'

import {Topic} from "@/features/topics/topic.types";
import {useCallback, useEffect, useState} from "react";
import {useAuth} from "@/auth/useAuth";
import * as api from "@/features/topics/topic.api";

export function useTopics() {
    const {accessToken} = useAuth()
    const [topics, setTopics] = useState<Topic[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string |null> (null)

    const refresh = useCallback(() => {
        if (!accessToken) return

        setLoading(true)
        api.fetchTopics(accessToken)
            .then(setTopics)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [accessToken])

    useEffect(() => {
        refresh()
    }, [refresh])

    const createTopic = async (key: string, name: string, parentPath: string | null, coverageArea: string, exclusions: string) => {
        if (!accessToken) return
        const newTopic = await api.createTopic(accessToken, key, name, parentPath, coverageArea, exclusions)
        setTopics(prev => [...prev, newTopic])
        return newTopic
    }

    const updateTopic = async (oldKey: string, newKey: string, name: string, coverageArea: string, exclusions: string) => {
        if (!accessToken) return
        const updatedTopic = await api.updateTopic(accessToken, oldKey, newKey, name, coverageArea, exclusions)
        setTopics(prev => prev.map(t => t.key === oldKey ? updatedTopic : t))
        // If key changed, we might need to refresh because children paths also changed
        if (oldKey !== updatedTopic.key) {
            refresh()
        }
        return updatedTopic
    }

    const deleteTopic = async (key: string) => {
        if (!accessToken) return
        await api.deleteTopic(accessToken, key)
        setTopics(prev => prev.filter(t => t.key !== key))
    }

    const moveTopic = async (key: string, newParentPath: string | null) => {
        if (!accessToken) return
        const updatedTopic = await api.moveTopic(accessToken, key, newParentPath)
        // Refresh everything because paths of children also changed
        refresh()
        return updatedTopic
    }

    return {topics, loading, error, createTopic, updateTopic, deleteTopic, moveTopic, refresh}
}