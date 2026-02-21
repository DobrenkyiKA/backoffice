'use client'

import {useState} from 'react'
import {TopicTree} from '@/features/topics/TopicTree'
import {type Filters, QuestionFilters} from '@/features/questions/QuestionFilters'
import {QuestionsList} from '@/features/questions/QuestionsList'

export default function AdminHomePage() {
    const [selectedTopicKeys, setSelectedTopicKeys] = useState<string[]>([])
    const [filters, setFilters] = useState<Filters>({
        difficulties: [],
        formats: [],
        labels: [],
    })

    function toggleTopic(key: string) {
        setSelectedTopicKeys(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        )
    }

    return (
        <div className="flex h-full">
            <aside className="w-72 border-r p-2">
                <TopicTree
                    selectedTopicKeys={selectedTopicKeys}
                    onToggleTopic={toggleTopic}
                />
            </aside>

            <section className="flex-1 p-4">
                <QuestionFilters filters={filters} onChange={setFilters}/>
                <QuestionsList
                    topicKeys={selectedTopicKeys}
                    filters={filters}
                />
            </section>
        </div>
    )
}