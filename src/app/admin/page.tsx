'use client'

import {useState} from 'react'
import {TopicTree} from '@/features/topics/TopicTree'
import {type Filters, QuestionFilters} from '@/features/questions/QuestionFilters'
import {QuestionsList} from '@/features/questions/QuestionsList'
import {useTopics} from "@/features/topics/useTopics";

export default function AdminHomePage() {
    const {topics} = useTopics()
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

    const selectedTopic = selectedTopicKeys.length === 1
        ? topics.find(t => t.key === selectedTopicKeys[0])
        : null

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

                {selectedTopic?.description && (
                    <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-300 leading-relaxed italic">
                            {selectedTopic.description}
                        </p>
                    </div>
                )}

                <QuestionsList
                    topicKeys={selectedTopicKeys}
                    filters={filters}
                />
            </section>
        </div>
    )
}