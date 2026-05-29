import type { ReactNode } from 'react'

const STEP_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'] as const

interface StepTitleProps {
  step: number
  children: ReactNode
}

export function StepTitle({ step, children }: StepTitleProps) {
  const number = STEP_NUMBERS[step - 1] ?? `${step}.`

  return (
    <h3 className="text-sm font-medium tracking-wide text-warm-gray uppercase sm:text-base">
      <span className="mr-1 text-gold">{number}</span>
      {children}
    </h3>
  )
}
