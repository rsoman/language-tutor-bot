import type { Segment } from '../../api/client'

type CorrectedSentenceProps = {
  segments: Segment[]
  className?: string
}

/** The whole corrected sentence, with the changed parts in bold (D0001). */
export function CorrectedSentence({ segments, className }: CorrectedSentenceProps) {
  return (
    <p className={className}>
      {segments.map((segment, index) =>
        segment.changed ? (
          <strong key={index}>{segment.text}</strong>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </p>
  )
}
