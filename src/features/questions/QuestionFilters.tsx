import { useEffect, useState } from 'react'

export type Filters = {
    difficulties: string[]
    formats: string[]
    labels: string[]
}

type Props = {
    filters: Filters
    onChange: (filters: Filters) => void
}

export function QuestionFilters({ filters, onChange }: Props) {
    const [labelsInput, setLabelsInput] = useState(filters.labels.join(', '))

    useEffect(() => {
        const propValue = filters.labels.join(', ')
        const currentParsedValue = labelsInput.split(',').map(v => v.trim()).filter(Boolean).join(', ')
        if (propValue !== currentParsedValue) {
            setLabelsInput(propValue)
        }
    }, [filters.labels])

    useEffect(() => {
        const timer = setTimeout(() => {
            const labels = labelsInput.split(',').map(v => v.trim()).filter(Boolean)
            if (JSON.stringify(labels) !== JSON.stringify(filters.labels)) {
                onChange({ ...filters, labels })
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [labelsInput, filters, onChange])

    function toggle(value: string, list: string[]) {
        return list.includes(value)
            ? list.filter(v => v !== value)
            : [...list, value]
    }

    return (
        <div className="mb-4 space-y-3">
            {/* Formats */}
            <div>
                <span className="font-medium text-sm">Format:</span>
                <div className="flex gap-2 mt-1">
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
                                : 'bg-white hover:bg-gray-50'}
              `}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Difficulty */}
            <div>
                <span className="font-medium text-sm">Difficulty:</span>
                <div className="flex gap-2 mt-1">
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
                                : 'bg-white hover:bg-gray-50'}
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
                    className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={labelsInput}
                    onChange={e => setLabelsInput(e.target.value)}
                />
            </div>
        </div>
    )
}