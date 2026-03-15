import { useEffect, useState } from 'react'

export type Filters = {
    difficulties: string[]
    formats: string[]
    labels: string[]
    searchTerm: string
    searchInAnswers: boolean
}

type Props = {
    filters: Filters
    onChange: (filters: Filters) => void
}

export function QuestionFilters({ filters, onChange }: Props) {
    const [labelsInput, setLabelsInput] = useState(filters.labels.join(', '))
    const [searchTermInput, setSearchTermInput] = useState(filters.searchTerm)
    const [prevLabels, setPrevLabels] = useState(filters.labels)
    const [prevSearchTerm, setPrevSearchTerm] = useState(filters.searchTerm)

    if (filters.labels !== prevLabels) {
        const propValue = filters.labels.join(', ')
        const currentParsedValue = labelsInput.split(',').map(v => v.trim()).filter(Boolean).join(', ')
        if (propValue !== currentParsedValue) {
            setLabelsInput(propValue)
        }
        setPrevLabels(filters.labels)
    }

    if (filters.searchTerm !== prevSearchTerm) {
        if (filters.searchTerm !== searchTermInput) {
            setSearchTermInput(filters.searchTerm)
        }
        setPrevSearchTerm(filters.searchTerm)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            const labels = labelsInput.split(',').map(v => v.trim()).filter(Boolean)
            const hasLabelsChanged = JSON.stringify(labels) !== JSON.stringify(filters.labels)
            const hasSearchChanged = searchTermInput !== filters.searchTerm

            if (hasLabelsChanged || hasSearchChanged) {
                onChange({ ...filters, labels, searchTerm: searchTermInput })
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [labelsInput, searchTermInput, filters, onChange])

    function toggle(value: string, list: string[]) {
        return list.includes(value)
            ? list.filter(v => v !== value)
            : [...list, value]
    }

    return (
        <div className="mb-6 space-y-4">
            {/* Search row */}
            <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg flex items-center gap-6">
                <div className="flex-1 flex items-center gap-3">
                    <span className="font-medium text-sm text-gray-300 uppercase tracking-wider text-[10px]">Search Questions:</span>
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search in questions..."
                            className="w-full border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-800 text-gray-200 placeholder:text-gray-500"
                            value={searchTermInput}
                            onChange={e => setSearchTermInput(e.target.value)}
                        />
                        {searchTermInput && (
                            <button
                                onClick={() => setSearchTermInput('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Search Type:</span>
                    <button
                        onClick={() => onChange({ ...filters, searchInAnswers: !filters.searchInAnswers })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] transition-colors border ${
                            filters.searchInAnswers
                                ? 'bg-green-500/10 border-green-500/50 text-green-400'
                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                    >
                        {filters.searchInAnswers ? 'Prompt + Answers' : 'Prompt Only'}
                        <div className={`w-3 h-3 rounded-full border border-current flex items-center justify-center`}>
                            {filters.searchInAnswers && <div className="w-1.5 h-1.5 rounded-full bg-current"/>}
                        </div>
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
                {/* Formats */}
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Format:</span>
                    <div className="flex gap-2">
                        {['INTERVIEW', 'QUIZ'].map(f => (
                            <button
                                key={f}
                                type="button"
                                onClick={() =>
                                    onChange({
                                        ...filters,
                                        formats: toggle(f, filters.formats),
                                    })
                                }
                                className={`px-3 py-1 border rounded text-sm transition-colors
                ${filters.formats.includes(f)
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}
              `}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty */}
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Difficulty:</span>
                    <div className="flex gap-2">
                        {['EASY', 'MEDIUM', 'HARD'].map(d => (
                            <button
                                key={d}
                                type="button"
                                onClick={() =>
                                    onChange({
                                        ...filters,
                                        difficulties: toggle(d, filters.difficulties),
                                    })
                                }
                                className={`px-3 py-1 border rounded text-sm transition-colors
                ${filters.difficulties.includes(d)
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}
              `}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Labels */}
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Labels:</span>
                    <input
                        type="text"
                        placeholder="e.g. java, spring"
                        className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-800"
                        value={labelsInput}
                        onChange={e => setLabelsInput(e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
}