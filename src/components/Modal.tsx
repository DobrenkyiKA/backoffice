import {ReactNode} from 'react'

type Props = {
    title: string
    children: ReactNode
    onClose: () => void
}

export function Modal({ title, children, onClose }: Props) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 text-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-gray-700">
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    )
}
