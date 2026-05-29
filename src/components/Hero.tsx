export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-stone bg-gradient-to-b from-white to-cream">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(184,149,106,0.08),_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <p className="mb-4 text-xs tracking-[0.35em] text-gold uppercase">
          Style Choice LLC — Custom Bags
        </p>
        <h1 className="max-w-2xl font-serif text-3xl leading-snug font-light text-charcoal sm:text-4xl lg:text-5xl">
          世界にひとつ、自分だけの
          <br />
          オーダーメイドバッグを。
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-warm-gray sm:text-base">
          本体・取手・金具・カラーを選びながら、完成イメージを確認。ショップ様の別注やオリジナル商品のご相談にも対応します。
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <a
            href="#customizer"
            className="inline-flex items-center justify-center rounded-full bg-charcoal px-8 py-3.5 text-sm tracking-wide text-cream transition hover:bg-brown-deep"
          >
            バッグをカスタムする
          </a>
          <a
            href="#inquiry"
            className="inline-flex items-center justify-center rounded-full border border-charcoal/20 bg-white px-8 py-3.5 text-sm tracking-wide text-charcoal transition hover:border-gold hover:text-gold"
          >
            問い合わせする
          </a>
        </div>
      </div>
    </section>
  )
}
