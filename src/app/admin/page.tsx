import {TopicTree} from "@/features/topics/TopicTree";

export default function AdminHomePage() {
    return (
        <div className="flex h-full">
            <aside className="w-72 border-r p-2">
                <h2 className="font-semibold mb-2">Topics</h2>
                <TopicTree/>
            </aside>

            <section className="flex-1 p-4">
                <p>Select a topic to see questions</p>
            </section>
        </div>
    )
}