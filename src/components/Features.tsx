import { BagArt } from './illustrations/BagArt'
import { GoldDivider, MaterialArt } from './illustrations/Decor'
import { Icon, IconBadge, type IconName } from './illustrations/icons'
import { BAG_TEMPLATES } from '../data/bagTemplates'
import { MATERIALS } from '../data/parts'
import { getStepsForTemplate } from '../data/specs'

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'hide',
    title: '素材選びも自由自在',
    body: '上質な本革、扱いやすい合皮、個性的な布など、お好みに合わせてお選びいただけます。',
  },
  {
    icon: 'sewing',
    title: 'オーダーメイドの自由度',
    body: '小さなポケットや内部の仕切り、持ち手の長さ調整など、細部までご要望に対応します。',
  },
  {
    icon: 'briefcase',
    title: '1点から製作可能',
    body: '1点からのオーダーメイドも歓迎です。小ロットからでも製作いたします。',
  },
]

const HIGHLIGHTS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'bag', title: 'Full Custom Order', body: '個別の要望に合わせて一点ずつ設計' },
  { icon: 'ruler', title: 'Free Size Design', body: '高さ・幅・マチを自由に調整' },
  { icon: 'padlock', title: 'Detail Customization', body: '素材・金具・内部仕様まで選択' },
]

export function Features() {
  return (
    <>
      <section id="features" className="border-b border-stone bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-[10px] tracking-[0.4em] text-gold uppercase">Desfy Original</p>
            <h2 className="mt-2 font-serif text-2xl font-light text-navy sm:text-3xl">
              自由なサイズと仕様でつくる
              <br className="sm:hidden" />
              オーダーメイドバッグ
            </h2>
            <GoldDivider className="mt-4" />
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-warm-gray">
              本革・合皮・布・化学繊維など、さまざまな素材を使い、デザイン・サイズ・細かな仕様まで
              ご希望を反映した、世界にひとつのオリジナルバッグをお作りします。
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="flex flex-col items-center rounded-2xl border border-stone bg-cream/50 p-5 text-center transition hover:border-gold/60 sm:p-6"
              >
                <IconBadge name={feature.icon} size={72} />
                <h3 className="mt-4 font-serif text-base text-navy sm:text-lg">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-warm-gray sm:text-sm">{feature.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 sm:mt-16">
            <h3 className="text-center font-serif text-lg text-navy sm:text-xl">選べる素材</h3>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
              {MATERIALS.map((material) => (
                <a
                  key={material.id}
                  href="#customizer"
                  className="group overflow-hidden rounded-xl border border-stone bg-white transition hover:border-gold hover:shadow-md"
                >
                  <span className="block bg-[#f3ede0] p-3">
                    <MaterialArt id={material.id} className="h-20 w-full sm:h-24" />
                  </span>
                  <span className="block px-3 py-2.5">
                    <span className="block font-serif text-sm text-navy">{material.name}</span>
                    <span className="mt-0.5 block text-[10px] leading-snug text-warm-gray sm:text-xs">
                      {material.description}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="lineup" className="border-b border-stone bg-cream py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-[10px] tracking-[0.4em] text-gold uppercase">Lineup</p>
            <h2 className="mt-2 font-serif text-2xl font-light text-navy sm:text-3xl">
              選べる6つのバッグ型
            </h2>
            <GoldDivider className="mt-4" />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-4">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center rounded-xl border border-stone bg-white p-3 text-center sm:flex-row sm:gap-3 sm:p-4 sm:text-left"
              >
                <IconBadge name={item.icon} size={44} />
                <div className="mt-2 sm:mt-0">
                  <p className="font-serif text-[11px] text-navy sm:text-sm">{item.title}</p>
                  <p className="mt-0.5 text-[9px] leading-snug text-warm-gray sm:text-xs">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BAG_TEMPLATES.map((template) => {
              const steps = getStepsForTemplate(template.id)
              return (
                <article
                  key={template.id}
                  className="overflow-hidden rounded-2xl border border-stone bg-white transition hover:border-gold/60 hover:shadow-md"
                >
                  <div className="art-grid grid grid-cols-[1.4fr_1fr] items-center gap-1 p-3">
                    <BagArt type={template.id} className="aspect-square w-full" />
                    <div className="grid grid-cols-2 gap-1">
                      {(['side', 'top', 'back', 'bottom'] as const).map((view) => (
                        <BagArt
                          key={view}
                          type={template.id}
                          view={view}
                          className="aspect-square w-full rounded bg-white/70"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-base text-navy">
                      {template.name}
                      <span className="ml-2 text-[10px] tracking-widest text-gold uppercase">
                        {template.nameEn}
                      </span>
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-warm-gray">{template.description}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {steps.map((step) => (
                        <li
                          key={step.id}
                          className="flex items-center gap-1 rounded-full border border-stone bg-cream px-2 py-0.5 text-[10px] text-navy"
                        >
                          <Icon name={step.icon} size={12} strokeWidth={2.4} />
                          {step.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
