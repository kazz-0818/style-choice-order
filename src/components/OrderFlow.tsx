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
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className="flex gap-4 rounded-2xl border border-stone bg-white p-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm text-cream">
                {index + 1}
              </span>
              <p className="self-center text-sm leading-relaxed text-charcoal">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
