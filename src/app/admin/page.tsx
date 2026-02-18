'use client'

import {TopicTree} from "@/features/topics/TopicTree";
import {useState} from "react";
import {QuestionsList} from "@/features/questions/QuestionsList";

export default function AdminHomePage() {
    const [selectedTopicPath, setSelectedTopicPath] = useState<string | null>(null)

    return (
        <div className="flex h-full">
            {/* LEFT: Topics */}
            <aside className="w-72 border-r p-2">
                <h2 className="font-semibold mb-2">Topics</h2>
                <TopicTree onSelectTopic={setSelectedTopicPath}/>
            </aside>

            {/* RIGHT: Questions */}
            <section className="flex-1 p-4">
                <QuestionsList topicPath={selectedTopicPath}/>
            </section>
        </div>
    )
}