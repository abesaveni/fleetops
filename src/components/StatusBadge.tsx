import type { BusStatus } from '@/types'
import { STATUS_LABELS } from '@/types'
export default function StatusBadge({ status }: { status: BusStatus }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className={`dot dot-${status}`}/>
      {STATUS_LABELS[status]}
    </span>
  )
}
