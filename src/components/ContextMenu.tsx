type ContextMenuProps = {
    x: number
    y: number
    onClose: () => void
    options: { label: string; onClick: () => void }[]
}

export function ContextMenu({ x, y, onClose, options }: ContextMenuProps) {
    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
                onContextMenu={e => {
                    e.preventDefault()
                    onClose()
                }}
            />
            <div
                className="fixed z-50 bg-white border border-gray-200 shadow-md py-1 rounded w-32"
                style={{ top: y, left: x }}
            >
                {options.map((option, idx) => (
                    <button
                        key={idx}
                        className="w-full text-left px-4 py-1.5 text-sm hover:bg-blue-600 hover:text-white"
                        onClick={() => {
                            option.onClick()
                            onClose()
                        }}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </>
    )
}
