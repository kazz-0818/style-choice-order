import type { ReactNode } from 'react'
import { IconBadge, type IconName } from './illustrations/icons'

const STEP_NUMBERS = [
  '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
  '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳',
] as const

interface StepTitleProps {
  step: number
  children: ReactNode
  icon?: IconName
  lead?: string
}

export function StepTitle({ step, children, icon, lead }: StepTitleProps) {
  const number = STEP_NUMBERS[step - 1] ?? `${step}.`

  return (
    <div className="flex items-start gap-3">
      {icon && <IconBadge name={icon} size={36} className="sm:!h-14 sm:!w-14" />}
      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-base font-medium tracking-wide text-navy sm:text-lg">
          <span className="mr-1.5 text-gold">{number}</span>
          {children}
        </h3>
        {lead && (
          <p className="mt-1 hidden text-[11px] leading-relaxed text-warm-gray sm:block sm:text-xs">{lead}</p>
        )}
      </div>
    </div>
  )
}
