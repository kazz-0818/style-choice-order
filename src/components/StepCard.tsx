import type { ReactNode } from 'react'

export const STEP_CARD_CLASS =
  'step-card-scroll max-h-[38vh] overflow-y-auto overscroll-y-contain rounded-xl border border-stone bg-white p-4 sm:max-h-none sm:overflow-visible sm:rounded-2xl sm:p-6'

export function StepCard({ children }: { children: ReactNode }) {
  return <div className={STEP_CARD_CLASS}>{children}</div>
}
