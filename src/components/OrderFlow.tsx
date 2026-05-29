const STEPS = [
  'バッグの形を選ぶ',
  'パーツ・カラーを選ぶ',
  '完成イメージを確認',
  '仕様・数量を相談',
  'お見積もり',
  '製作開始',
]

export function OrderFlow() {
  return (
    <section id="flow" className="border-b border-stone bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-serif text-2xl font-light text-charcoal sm:text-3xl">
          オーダーの流れ
        </h2>
        <ol className="mt-10 grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {STEPS.flatMap((step, index) => {
            const stepItem = (
              <li
                key={step}
                className="flex gap-4 rounded-2xl border border-stone bg-white p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kogicha text-sm text-cream">
                  {index + 1}
                </span>
                <p className="self-center text-sm leading-relaxed text-charcoal">{step}</p>
              </li>
            )

            if (index === STEPS.length - 1) return [stepItem]

            return [
              stepItem,
              <li
                key={`${step}-arrow`}
                aria-hidden="true"
                className="flex list-none justify-center py-2 sm:hidden"
              >
                <span className="text-sm text-gold">↓</span>
              </li>,
            ]
          })}
        </ol>
      </div>
    </section>
  )
}
