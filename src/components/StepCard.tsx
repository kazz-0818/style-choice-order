import type { ReactNode } from 'react'

export const STEP_CARD_CLASS =
  'rounded-xl border border-stone bg-white p-4 shadow-[0_1px_0_rgba(26,45,75,0.03)] sm:rounded-2xl sm:p-6'

export function StepCard({ children }: { children: ReactNode }) {
  return <div className={STEP_CARD_CLASS}>{children}</div>
}
