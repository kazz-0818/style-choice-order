const FEATURES = [
  {
    title: 'パーツ選定',
    body: '本体・取手・金具・装飾など、バッグの印象を決める要素を組み合わせ可能。',
  },
  {
    title: 'カラー確認',
    body: '各パーツごとにカラーを変更し、完成イメージを見ながら検討可能。',
  },
  {
    title: '別注対応',
    body: '店舗オリジナル商品、ブランド別注、イベント販売用などの相談導線を設ける。',
  },
]

export function Features() {
  return (
    <section id="features" className="border-b border-stone bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-serif text-2xl font-light text-charcoal sm:text-3xl">
          オーダーメイドの特徴
        </h2>
        <p className="mt-3 max-w-xl text-sm text-warm-gray">
          画面上で仕様を固めながら、Style Choice の製作チームへスムーズにご相談いただけます。
        </p>
        <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-6">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className="rounded-xl border border-stone bg-cream/50 p-3 transition hover:border-gold/40 sm:rounded-2xl sm:p-6"
            >
              <span className="text-[10px] tracking-widest text-gold sm:text-xs">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 font-serif text-xs leading-snug text-charcoal sm:mt-3 sm:text-lg">
                {feature.title}
              </h3>
              <p className="mt-2 text-[9px] leading-snug text-warm-gray sm:mt-3 sm:text-sm sm:leading-relaxed">
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
