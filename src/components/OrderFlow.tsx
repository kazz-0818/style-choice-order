import { FlowArt, GoldDivider } from './illustrations/Decor'
import { Icon, IconBadge, type IconName } from './illustrations/icons'
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../config/contact'

/** 製作の流れ（パンフレット P3） */
const STEPS: { title: string; body: string; icon: IconName }[] = [
  { title: 'ヒアリング', body: 'デザインや用途のご希望を伺います。', icon: 'hearing' },
  {
    title: '素材・デザインの決定',
    body: 'サンプルやアイデアを元に、一緒に形を考えます。',
    icon: 'swatches',
  },
  { title: 'お見積もり', body: '小ロットからでも製作OKです。', icon: 'calculator' },
  { title: '製作開始', body: '職人が丁寧に仕上げます。', icon: 'sewing' },
  { title: '納品', body: 'ご希望の形でお届けします。', icon: 'box' },
]

const SERVICES: { title: string; body: string; icon: IconName }[] = [
  {
    title: 'トータルコーディネート',
    body: 'バッグに合わせたトータルコーディネートのご提案も可能です。',
    icon: 'bag',
  },
  {
    title: 'ロゴ刻印・プレート・タグ',
    body: 'ロゴ刻印や、金属プレート・タグなどの製作にも対応可能です。',
    icon: 'engraving',
  },
  {
    title: 'アフターサポート',
    body: '部品の補修・交換など、幅広く対応いたします。',
    icon: 'support',
  },
]

export function OrderFlow() {
  return (
    <section id="flow" className="border-b border-stone bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.4em] text-gold uppercase">Flow</p>
          <h2 className="mt-2 font-serif text-2xl font-light text-navy sm:text-3xl">製作の流れ</h2>
          <GoldDivider className="mt-4" />
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-2">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex lg:block">
              <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-stone bg-cream/40">
                <div className="relative">
                  <FlowArt step={index + 1} className="block w-full" />
                  <span className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full border border-gold bg-navy font-serif text-sm text-gold-light">
                    {index + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center px-3 py-4 text-center">
                  <IconBadge name={step.icon} size={40} className="-mt-9 border-2 border-white" />
                  <h3 className="mt-2 font-serif text-base text-navy">{step.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-warm-gray">{step.body}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -bottom-3.5 left-1/2 z-10 -translate-x-1/2 rotate-90 text-gold sm:hidden"
                >
                  ▼
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="flex items-start gap-3 rounded-xl border border-stone bg-cream/50 p-4"
            >
              <IconBadge name={service.icon} size={48} />
              <div>
                <h3 className="font-serif text-sm text-navy sm:text-base">{service.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-warm-gray">{service.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cover-navy mt-10 overflow-hidden rounded-2xl border border-gold/40 px-6 py-8 text-center text-cream sm:py-10">
          <p className="font-serif text-lg text-gold-light sm:text-2xl">お見積もり・ご依頼はこちら</p>
          <a
            href={`tel:${CONTACT_PHONE_TEL}`}
            className="mt-3 inline-flex items-center gap-2 font-serif text-2xl tracking-wider text-cream transition hover:text-gold-light sm:text-4xl"
          >
            <Icon name="phone" size={28} />
            {CONTACT_PHONE_DISPLAY}
          </a>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#customizer"
              className="rounded-full border border-gold bg-gold px-6 py-2.5 text-sm text-navy-dark transition hover:bg-gold-light"
            >
              仕様を決めてから相談する
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-2 rounded-full border border-gold/60 px-6 py-2.5 text-sm text-gold-light transition hover:border-gold hover:text-cream"
            >
              <Icon name="mail" size={16} />
              メールで相談する
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
