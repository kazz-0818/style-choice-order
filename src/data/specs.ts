import type { IconName } from '../components/illustrations/icons'
import type {
  BagCustomization,
  BagSpecs,
  BagTemplateId,
  SpecKey,
} from '../types/bag'

/** カスタマイズのステップ種別（パンフレット記載の項目名に対応） */
export type StepId =
  | 'silhouette'
  | 'opening'
  | 'handle'
  | 'pocket'
  | 'lock'
  | 'studs'
  | 'flap'
  | 'clasp'
  | 'charm'
  | 'strap'
  | 'belt'
  | 'bottom'
  | 'logo'

export interface SpecOption {
  id: string
  name: string
  description?: string
}

export interface SpecGroup {
  key: SpecKey
  label: string
  options: SpecOption[]
  defaultId?: string
  /** 他の選択によって表示を切り替える */
  showWhen?: (specs: BagSpecs) => boolean
}

export interface SpecStep {
  id: StepId
  label: string
  icon: IconName
  lead: string
  groups: SpecGroup[]
}

const HAND_CARRY: BagTemplateId[] = ['top-handle', 'business', 'boston', 'mini-boston', 'tote']

const ZIPPER_OPENINGS = ['zipper', 'zip-single', 'zip-double', 'frame-zip']

/** 型ごとのステップ構成（パンフレット P5〜P7 の順に準拠。先頭にシルエット） */
const TEMPLATE_STEPS: Record<BagTemplateId, StepId[]> = {
  business: ['silhouette', 'opening', 'pocket', 'handle', 'lock', 'studs'],
  boston: ['silhouette', 'opening', 'handle', 'lock', 'studs'],
  'shoulder-pouch': ['silhouette', 'flap', 'handle', 'clasp', 'charm'],
  'mini-boston': ['silhouette', 'opening', 'handle', 'lock', 'charm'],
  shoulder: ['silhouette', 'opening', 'handle', 'strap', 'bottom'],
  tote: ['silhouette', 'opening', 'handle', 'pocket', 'studs'],
  'top-handle': ['silhouette', 'opening', 'handle', 'lock', 'belt', 'studs'],
}

function openingGroup(t: BagTemplateId): SpecGroup {
  const label = '開口部'
  switch (t) {
    case 'business':
    case 'top-handle':
      return {
        key: 'opening',
        label,
        options: [
          { id: 'zipper', name: 'ファスナー', description: 'しっかり閉じられる定番仕様' },
          { id: 'flap', name: 'フラップ', description: 'かぶせ蓋で上品な印象に' },
          { id: 'open', name: 'オープントップ', description: '出し入れしやすい開口' },
        ],
      }
    case 'boston':
      return {
        key: 'opening',
        label,
        options: [
          { id: 'frame-flap', name: 'フラップ＋口金', description: '中身を守るフラップ付き' },
          { id: 'frame', name: '口金フレーム', description: '開口が大きく開くクラシック仕様' },
          { id: 'frame-zip', name: '口金＋ファスナー', description: '防犯性を高めた二重仕様' },
        ],
      }
    case 'mini-boston':
      return {
        key: 'opening',
        label,
        options: [
          { id: 'zip-single', name: 'センターファスナー', description: '天面を1本のファスナーで' },
          { id: 'zip-double', name: 'ダブルファスナー', description: '両側から開閉できる仕様' },
        ],
      }
    default:
      return {
        key: 'opening',
        label,
        options: [
          { id: 'zipper', name: 'ファスナー', description: '天面をしっかり閉じる仕様' },
          { id: 'magnet', name: 'マグネット', description: 'ワンタッチで開閉' },
          { id: 'open', name: 'オープントップ', description: '出し入れが楽な開口' },
        ],
      }
  }
}

const PULLER_GROUP: SpecGroup = {
  key: 'puller',
  label: 'ファスナー引き手のデザイン',
  showWhen: (specs) => ZIPPER_OPENINGS.includes(specs.opening ?? ''),
  options: [
    { id: 'ring', name: 'リング', description: '金属リングの引き手' },
    { id: 'tab', name: 'レザータブ', description: '革のタブで柔らかい印象に' },
    { id: 'tassel', name: 'タッセル', description: '房飾り付きの華やかな引き手' },
    { id: 'bar', name: 'メタルバー', description: 'シャープな金属バー' },
  ],
}

function handleGroup(t: BagTemplateId): SpecGroup {
  if (HAND_CARRY.includes(t)) {
    return {
      key: 'handle',
      label: '持ち手の長さ',
      defaultId: 'standard',
      options: [
        { id: 'short', name: 'ショート', description: '手持ち向けのコンパクトな長さ' },
        { id: 'standard', name: 'スタンダード', description: '手持ちしやすい標準の長さ' },
        { id: 'long', name: 'ロング', description: '腕にかけやすい長め' },
        { id: 'shoulder', name: '肩掛け', description: '肩にかけられる長さ' },
      ],
    }
  }
  return {
    key: 'handle',
    label: 'ストラップの長さ',
    defaultId: 'standard',
    options: [
      { id: 'short', name: 'ショート', description: 'コンパクトに持ち歩ける長さ' },
      { id: 'standard', name: 'スタンダード', description: '肩掛けに最適な標準の長さ' },
      { id: 'long', name: 'ロング', description: '斜め掛けもできる長め' },
    ],
  }
}

function lockGroup(t: BagTemplateId): SpecGroup {
  const label = '金具のデザイン'
  switch (t) {
    case 'business':
      return {
        key: 'lock',
        label,
        defaultId: 'turn',
        options: [
          { id: 'none', name: 'なし', description: 'すっきりとしたシンプル仕様' },
          { id: 'turn', name: 'ターンロック', description: '前面のワンポイントに' },
          { id: 'padlock', name: 'パドロック', description: '南京錠風のクラシック金具' },
          { id: 'shield', name: 'シールドロック', description: '盾形のゴールド金具で華やかに' },
          { id: 'belt', name: 'ベルト＆バックル', description: 'ベルトで固定する仕様' },
        ],
      }
    case 'top-handle':
      return {
        key: 'lock',
        label,
        defaultId: 'turn',
        options: [
          { id: 'turn', name: 'ターンロック', description: 'ベルト中央のワンポイントに' },
          { id: 'padlock', name: 'パドロック', description: '南京錠風のクラシック金具' },
          { id: 'shield', name: 'シールドロック', description: '盾形のゴールド金具' },
          { id: 'none', name: 'なし', description: '金具なしのシンプル仕様' },
        ],
      }
    case 'boston':
      return {
        key: 'lock',
        label,
        defaultId: 'twist',
        options: [
          { id: 'twist', name: 'ツイストロック', description: '中央でひねって留める' },
          { id: 'shield', name: 'シールドロック', description: '盾形のゴールド金具で華やかに' },
          { id: 'belt', name: 'ベルト＆バックル', description: 'ベルト仕様（太さも相談可）' },
          { id: 'turn', name: 'ターンロック', description: '前面のワンポイントに' },
          { id: 'none', name: 'なし', description: 'ロックなしのシンプル仕様' },
        ],
      }
    default:
      return {
        key: 'lock',
        label: '金具（Dカン・ナスカン等）',
        defaultId: 'dring',
        options: [
          { id: 'none', name: 'なし', description: '金具なしのシンプル仕様' },
          { id: 'dring', name: 'Dカン', description: 'ストラップ取付にも便利' },
          { id: 'snaphook', name: 'ナスカン', description: '着脱しやすいフック' },
          { id: 'dring-snap', name: 'Dカン＋ナスカン', description: '両方を組み合わせ' },
        ],
      }
  }
}

const STEP_BUILDERS: Record<StepId, (t: BagTemplateId) => SpecStep> = {
  silhouette: (t) => ({
    id: 'silhouette',
    label: '本体シルエット',
    icon: 'silhouette',
    lead:
      t === 'boston'
        ? '容量や用途に合わせた、横長でエレガントなフォルムを設計します。'
        : t === 'shoulder-pouch'
          ? '縦型ポーチの高さ・幅・マチのバランスを自由に設計できます。'
          : '高さ・幅・マチ（奥行き）のバランスを自由に設計できます。',
    groups: [],
  }),
  opening: (t) => ({
    id: 'opening',
    label: '開口部',
    icon: 'zipper',
    lead:
      t === 'boston'
        ? 'フラップと口金フレームの仕様で、中身を守るデザインを選べます。'
        : 'ファスナーなど開口の仕様と、引き手のデザインを選べます。',
    groups: t === 'boston' ? [openingGroup(t)] : [openingGroup(t), PULLER_GROUP],
  }),
  handle: (t) => ({
    id: 'handle',
    label: HAND_CARRY.includes(t) ? '持ち手の長さ' : 'ストラップの長さ',
    icon: 'handle',
    lead: HAND_CARRY.includes(t)
      ? '手持ち用・肩掛け用など、使い方に合わせて長さを調整できます。'
      : '肩掛けに最適な長さに調整できます。',
    groups: [handleGroup(t)],
  }),
  pocket: () => ({
    id: 'pocket',
    label: '外ポケット・内仕様',
    icon: 'pocket',
    lead: '背面ポケットや内側の仕切りなど、機能面の仕様を設計できます。',
    groups: [
      {
        key: 'pocket',
        label: '外ポケット',
        defaultId: 'front',
        options: [
          { id: 'none', name: 'なし', description: 'すっきりしたシンプル仕様' },
          { id: 'front', name: '前面ポケット', description: '前面に外ポケットを追加' },
          { id: 'back', name: '背面ポケット', description: '背面に外ポケットを追加' },
          { id: 'both', name: '前面＋背面', description: '両面にポケットを追加' },
        ],
      },
      {
        key: 'inner',
        label: '内仕切り・内ポケット',
        options: [
          { id: 'none', name: 'なし' },
          { id: 'divider', name: '内仕切り', description: '荷物を分けて整理' },
          { id: 'zip', name: '内ファスナーポケット', description: '貴重品の収納に' },
          { id: 'both', name: '仕切り＋ファスナー', description: '両方を組み合わせ' },
        ],
      },
    ],
  }),
  lock: (t) => ({
    id: 'lock',
    label: '金具',
    icon: 'padlock',
    lead:
      t === 'boston'
        ? 'ツイストロックやベルトなど、金具のデザインを選べます。'
        : t === 'mini-boston'
          ? 'Dカンやナスカンなど、金具の仕様を選べます。'
          : 'ロック金具などのデザインを選べます。色・素材は下の「金具のカラー・素材」で選べます。',
    groups: [lockGroup(t)],
  }),
  studs: () => ({
    id: 'studs',
    label: '底鋲',
    icon: 'studs',
    lead: '底鋲の有無・素材・カラーを選べます。',
    groups: [
      {
        key: 'studs',
        label: '底鋲の有無',
        defaultId: 'four',
        options: [
          { id: 'none', name: 'なし', description: '底面をフラットに' },
          { id: 'four', name: '4点', description: '四隅に底鋲を配置' },
        ],
      },
      {
        key: 'studColor',
        label: '底鋲の素材・カラー',
        showWhen: (specs) => specs.studs !== 'none',
        options: [
          { id: 'gold', name: '真鍮ゴールド' },
          { id: 'silver', name: 'ニッケルシルバー' },
          { id: 'black', name: 'ブラック' },
        ],
      },
    ],
  }),
  flap: () => ({
    id: 'flap',
    label: 'フラップ仕様',
    icon: 'flap',
    lead: 'フラップの形と、縁のパイピング・コバ仕上げを調整できます。',
    groups: [
      {
        key: 'flap',
        label: 'フラップの形',
        options: [
          { id: 'square', name: 'スクエア', description: 'すっきり端正な直線' },
          { id: 'round', name: 'ラウンド', description: 'やわらかな丸み' },
          { id: 'curve', name: 'カーブ', description: '中央が下がる曲線' },
          { id: 'point', name: 'ポイント', description: 'V字に尖った形' },
        ],
      },
      {
        key: 'piping',
        label: '縁の仕上げ',
        options: [
          { id: 'none', name: 'なし' },
          { id: 'piping', name: 'パイピング', description: '別色で縁取り' },
          { id: 'edge', name: 'コバ塗り', description: '断面を丁寧に仕上げ' },
        ],
      },
    ],
  }),
  clasp: (t) => ({
    id: 'clasp',
    label: '留め具',
    icon: 'clasp',
    lead: '前面の金属留め具のデザインを選べます。カラーは下の「金具のカラー・素材」で選べます。',
    groups: [
      {
        key: 'clasp',
        label: '留め具のデザイン',
        defaultId: t === 'shoulder-pouch' ? 'shield' : 'turn',
        options: [
          { id: 'none', name: 'なし', description: 'マグネットの隠し留め' },
          { id: 'turn', name: 'ターンロック', description: '前面のワンポイントに' },
          { id: 'shield', name: 'シールドロック', description: '盾形のゴールド金具（フラップ中央）' },
          { id: 'snap', name: 'スナップ', description: 'シンプルな丸型' },
          { id: 'bar', name: 'バークラスプ', description: '横長のモダンな留め具' },
        ],
      },
    ],
  }),
  charm: () => ({
    id: 'charm',
    label: 'チャーム・チェーン',
    icon: 'charm',
    lead: 'チャーム・チェーンの有無、長さ、デザインを選べます。',
    groups: [
      {
        key: 'charm',
        label: '有無',
        defaultId: 'charm',
        options: [
          { id: 'none', name: 'なし' },
          { id: 'charm', name: 'チャームのみ' },
          { id: 'chain', name: 'チェーンのみ' },
          { id: 'both', name: 'チェーン＋チャーム' },
        ],
      },
      {
        key: 'charmDesign',
        label: 'チャームのデザイン',
        showWhen: (specs) => specs.charm === 'charm' || specs.charm === 'both',
        options: [
          { id: 'ball', name: 'ボール' },
          { id: 'star', name: 'スター' },
          { id: 'heart', name: 'ハート' },
          { id: 'tassel', name: 'タッセル' },
          { id: 'tag', name: 'メタルタグ', description: '金属プレートのタグ' },
        ],
      },
      {
        key: 'chainLength',
        label: 'チェーンの長さ',
        defaultId: 'medium',
        showWhen: (specs) => specs.charm === 'chain' || specs.charm === 'both',
        options: [
          { id: 'short', name: 'ショート' },
          { id: 'medium', name: 'ミディアム' },
          { id: 'long', name: 'ロング' },
        ],
      },
    ],
  }),
  strap: () => ({
    id: 'strap',
    label: 'ストラップ仕様',
    icon: 'strap',
    lead: 'ストラップの幅、取付金具、長さ調整機構を選べます。',
    groups: [
      {
        key: 'strapWidth',
        label: 'ストラップ幅',
        defaultId: 'standard',
        options: [
          { id: 'narrow', name: '細め', description: '軽やかできれいめ' },
          { id: 'standard', name: '標準', description: '肩に食い込みにくい標準幅' },
          { id: 'wide', name: '太め', description: '荷物が多い日にも安心' },
        ],
      },
      {
        key: 'strapHook',
        label: '取付金具',
        options: [
          { id: 'snaphook', name: 'ナスカン', description: '着脱しやすいフック' },
          { id: 'dring', name: 'Dカン', description: 'シンプルに取付' },
          { id: 'screw', name: 'ネジ留め', description: '固定式で見た目すっきり' },
        ],
      },
      {
        key: 'strapAdjust',
        label: '長さ調整機構',
        options: [
          { id: 'fixed', name: '固定', description: '調整なし' },
          { id: 'slider', name: 'アジャスター', description: 'スライドで無段階調整' },
          { id: 'buckle', name: 'バックル穴', description: '穴位置で段階調整' },
        ],
      },
    ],
  }),
  belt: () => ({
    id: 'belt',
    label: 'ベルト仕様',
    icon: 'strap',
    lead: '本体を一周するベルトの太さと、ステッチの有無を選べます。',
    groups: [
      {
        key: 'beltWidth',
        label: 'ベルトの太さ',
        defaultId: 'standard',
        options: [
          { id: 'thin', name: '細め', description: '軽やかで繊細な印象に' },
          { id: 'standard', name: '標準', description: 'バランスのよい標準幅' },
          { id: 'thick', name: '太め', description: '存在感のあるデザインに' },
        ],
      },
      {
        key: 'beltStitch',
        label: 'ステッチ',
        defaultId: 'stitch',
        options: [
          { id: 'stitch', name: 'あり', description: 'ふちに縫い目を入れて上品に' },
          { id: 'none', name: 'なし', description: 'すっきりとした仕上がり' },
        ],
      },
    ],
  }),
  bottom: () => ({
    id: 'bottom',
    label: '底面仕様',
    icon: 'bottom',
    lead: '底板や補強など、底面の仕様をカスタマイズできます。',
    groups: [
      {
        key: 'bottomPanel',
        label: '底板',
        options: [
          { id: 'standard', name: '標準', description: '本体と同素材の底' },
          { id: 'board', name: '底板入り', description: '型崩れしにくい仕様' },
          { id: 'leather', name: '革底', description: '別素材で底を仕上げ' },
        ],
      },
      {
        key: 'reinforce',
        label: '補強',
        options: [
          { id: 'none', name: 'なし' },
          { id: 'corner', name: '角補強', description: '擦れやすい角を保護' },
          { id: 'tape', name: 'ふち補強', description: 'ふちをテープで補強' },
        ],
      },
    ],
  }),
  logo: () => ({
    id: 'logo',
    label: 'ロゴ・プレート・タグ',
    icon: 'engraving',
    lead: 'ロゴ刻印や、金属プレート・タグの製作にも対応しています。',
    groups: [
      {
        key: 'logo',
        label: 'オプション',
        defaultId: 'none',
        options: [
          { id: 'none', name: 'なし' },
          { id: 'engrave', name: 'ロゴ刻印', description: 'バッグへロゴを刻印' },
          { id: 'plate', name: '金属プレート', description: 'ブランド表示に' },
          { id: 'tag', name: 'タグ', description: 'オリジナルタグを取付' },
        ],
      },
    ],
  }),
}

/** 型ごとのステップ一覧（ロゴ・プレート・タグは共通の最終項目として別扱い） */
export function getStepsForTemplate(templateId: BagTemplateId): SpecStep[] {
  return TEMPLATE_STEPS[templateId].map((id) => STEP_BUILDERS[id](templateId))
}

export function getLogoStep(): SpecStep {
  return STEP_BUILDERS.logo('tote')
}

function allGroups(templateId: BagTemplateId): SpecGroup[] {
  return [...getStepsForTemplate(templateId), getLogoStep()].flatMap((s) => s.groups)
}

export function getDefaultSpecs(templateId: BagTemplateId): BagSpecs {
  const specs: BagSpecs = {}
  for (const group of allGroups(templateId)) {
    specs[group.key] = group.defaultId ?? group.options[0].id
  }
  return specs
}

/** 型変更時、引き継げる選択は残し、無効になった項目は既定値へ */
export function resolveSpecsForTemplate(
  templateId: BagTemplateId,
  previous: BagSpecs,
): BagSpecs {
  const next: BagSpecs = {}
  for (const group of allGroups(templateId)) {
    const prev = previous[group.key]
    const valid = prev && group.options.some((o) => o.id === prev)
    next[group.key] = valid ? prev : (group.defaultId ?? group.options[0].id)
  }
  return next
}

export function isGroupVisible(group: SpecGroup, specs: BagSpecs): boolean {
  return group.showWhen ? group.showWhen(specs) : true
}

export interface SummaryRow {
  label: string
  value: string
}

/** 選択内容の一覧（サマリー・問い合わせ文で共通利用） */
export function getSpecSummaryRows(customization: BagCustomization): SummaryRow[] {
  const { templateId, specs, size } = customization
  const rows: SummaryRow[] = [
    {
      label: '本体サイズ（標準比）',
      value: `高さ ${size.height}% / 幅 ${size.width}% / マチ ${size.gusset}%`,
    },
  ]
  const steps = [...getStepsForTemplate(templateId), getLogoStep()]
  for (const step of steps) {
    for (const group of step.groups) {
      if (!isGroupVisible(group, specs)) continue
      const option = group.options.find((o) => o.id === specs[group.key])
      if (option) rows.push({ label: group.label, value: option.name })
    }
  }
  return rows
}
