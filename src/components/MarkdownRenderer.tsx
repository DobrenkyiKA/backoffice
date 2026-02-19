'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
    content: string
}

/**
 * MarkdownRenderer renders markdown content
 * in a safe and consistent way.
 *
 * This component is intentionally generic
 * so it can be reused in:
 * - admin backoffice
 * - user learning UI
 * - previews during editing
 */
export function MarkdownRenderer({ content }: Props) {
    return (
        <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    )
}