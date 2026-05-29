const NOTES = [
  '画面上の完成イメージは、色や仕様を確認するためのシミュレーションです。実際の素材感・色味・サイズ感は、製作前の打ち合わせにて最終確認いたします。',
  '素材や仕様によっては、製作できない組み合わせがある場合があります。',
]

export function Disclaimer() {
  return (
    <section className="border-t border-stone bg-stone/30 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="space-y-3 text-xs leading-relaxed text-warm-gray sm:text-sm">
          {NOTES.map((note) => (
            <li key={note} className="flex gap-2">
              <span className="shrink-0 text-gold" aria-hidden>
                ※
              </span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
