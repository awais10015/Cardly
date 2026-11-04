/* ------------------------------------------------------------------ */
/*  Cardly design model — every card is persisted as structured JSON  */
/* ------------------------------------------------------------------ */

export type CardCategory =
  | 'business'
  | 'wedding'
  | 'birthday'
  | 'greeting'
  | 'eid'
  | 'anniversary'
  | 'corporate'
  | 'thank-you'
  | 'engagement'
  | 'graduation'
  | 'ramadan'
  | 'custom'

export type CardStyle = 'modern' | 'minimal' | 'luxury' | 'creative' | 'classic' | 'playful'
export type Orientation = 'landscape' | 'portrait' | 'square'

interface ElementBase {
  id: string
  name?: string
  x: number
  y: number
  w: number
  h: number
  rotation: number
  opacity: number
  locked: boolean
  hidden: boolean
  /** role used for structured business / invitation field sync */
  role?: string
}

export interface TextElement extends ElementBase {
  type: 'text'
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  color: string
  align: 'left' | 'center' | 'right'
  italic: boolean
  underline: boolean
  uppercase: boolean
  letterSpacing: number
  lineHeight: number
}

export interface ImageElement extends ElementBase {
  type: 'image'
  src: string
  fit: 'cover' | 'contain'
  radius: number
  borderWidth: number
  borderColor: string
  circle: boolean
}

export interface ShapeElement extends ElementBase {
  type: 'shape'
  shape: 'rect' | 'ellipse' | 'line'
  fill: string // 'none' for transparent
  stroke: string
  strokeWidth: number
  radius: number
}

export interface IconElement extends ElementBase {
  type: 'icon'
  icon: string // lucide icon name
  color: string
  strokeWidth: number
}

export interface QRElement extends ElementBase {
  type: 'qr'
  data: string
  fg: string
  bg: string
}

export interface StickerElement extends ElementBase {
  type: 'sticker'
  emoji: string
}

export type CardElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | IconElement
  | QRElement
  | StickerElement

export type PatternKind = 'dots' | 'grid' | 'stripes' | 'diagonal' | 'rings' | 'confetti'

export interface Background {
  type: 'solid' | 'gradient' | 'image' | 'pattern'
  color: string
  gradient: { from: string; to: string; angle: number }
  imageUrl?: string
  imageFit?: 'cover' | 'contain'
  pattern?: PatternKind
  patternColor: string
  overlay: number // 0..1 dim overlay for image backgrounds
}

export interface CardSide {
  background: Background
  elements: CardElement[]
}

export interface CardDesign {
  width: number
  height: number
  front: CardSide
  back?: CardSide
}

export interface BusinessFields {
  fullName: string
  jobTitle: string
  company: string
  phone: string
  email: string
  website: string
  address: string
  whatsapp: string
  socials: { linkedin?: string; instagram?: string; twitter?: string }
}

export interface InvitationFields {
  eventTitle: string
  hostName: string
  dateTime: string
  venue: string
  mapsUrl: string
  rsvp: string
  dressCode: string
  extraInfo: string
}

export interface CardDoc {
  id: string
  title: string
  category: CardCategory
  slug?: string
  status: 'draft' | 'published'
  design: CardDesign
  business?: BusinessFields | null
  invitation?: InvitationFields | null
  createdAt: string
  updatedAt: string
}

/* ------------------------------- sizes ------------------------------ */

export const CARD_SIZES: Record<string, { label: string; width: number; height: number; hint: string }> = {
  business: { label: 'Business Card', width: 1050, height: 600, hint: '3.5" × 2" · 300 DPI' },
  'invitation-portrait': { label: 'Invitation · Portrait', width: 1000, height: 1400, hint: '5" × 7" · 200 DPI' },
  'invitation-landscape': { label: 'Invitation · Landscape', width: 1400, height: 1000, hint: '7" × 5" · 200 DPI' },
  'greeting-landscape': { label: 'Greeting · Landscape', width: 1050, height: 750, hint: '5.25" × 3.75"' },
  'greeting-square': { label: 'Greeting · Square', width: 1000, height: 1000, hint: '5" × 5"' },
}

/* ----------------------------- defaults ----------------------------- */

export const FONT_FAMILIES = [
  'Inter',
  'Space Grotesk',
  'Playfair Display',
  'Cormorant Garamond',
  'Great Vibes',
  'Dancing Script',
  'Bebas Neue',
  'Caveat',
]

export function uid(prefix = 'el'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

export function defaultBackground(color = '#ffffff'): Background {
  return {
    type: 'solid',
    color,
    gradient: { from: '#7c3aed', to: '#db2777', angle: 135 },
    pattern: 'dots',
    patternColor: '#0f172a18',
    overlay: 0.25,
  }
}

export function backgroundCss(bg: Background): React.CSSProperties {
  switch (bg.type) {
    case 'solid':
      return { background: bg.color }
    case 'gradient':
      return { background: `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})` }
    case 'image':
      return {
        backgroundImage: bg.imageUrl ? `url(${bg.imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    case 'pattern':
      return { background: bg.color }
  }
}

export function emptySide(color = '#ffffff'): CardSide {
  return { background: defaultBackground(color), elements: [] }
}

export function blankDesign(size: keyof typeof CARD_SIZES | string, withBack = false): CardDesign {
  const s = CARD_SIZES[size] ?? CARD_SIZES['greeting-landscape']
  const colors: Record<string, string> = {
    business: '#0f172a',
    'invitation-portrait': '#fdf8f3',
    'invitation-landscape': '#fdf8f3',
    'greeting-landscape': '#fefce8',
    'greeting-square': '#faf5ff',
  }
  return {
    width: s.width,
    height: s.height,
    front: emptySide(colors[size] ?? '#ffffff'),
    back: withBack ? emptySide(colors[size] ?? '#ffffff') : undefined,
  }
}

export const DEFAULT_BUSINESS: BusinessFields = {
  fullName: 'Your Name',
  jobTitle: 'Product Designer',
  company: 'Acme Studio',
  phone: '+1 (555) 012-3456',
  email: 'hello@acme.studio',
  website: 'acme.studio',
  address: '221B Market Street, San Francisco',
  whatsapp: '+1 555 012 3456',
  socials: { linkedin: 'linkedin.com/in/you', instagram: '@yourstudio' },
}

export const DEFAULT_INVITATION: InvitationFields = {
  eventTitle: 'You are invited',
  hostName: 'Hosted by the Alam family',
  dateTime: 'Saturday, June 14th · 6:30 PM',
  venue: 'The Grand Pavilion, 12 Lakeside Ave',
  mapsUrl: 'https://maps.google.com/?q=The+Grand+Pavilion',
  rsvp: 'RSVP · Sara · +1 555 010 2030',
  dressCode: 'Dress code · Formal',
  extraInfo: 'Dinner and drinks to follow the ceremony.',
}

/* ------------------------- category metadata ------------------------ */

export const CATEGORY_META: Record<
  CardCategory,
  { label: string; plural: string; description: string; icon: string; gradient: string }
> = {
  business: {
    label: 'Business Card',
    plural: 'Business Cards',
    description: 'Professional digital visiting cards with QR code and vCard download.',
    icon: 'Briefcase',
    gradient: 'from-slate-800 to-slate-600',
  },
  wedding: {
    label: 'Wedding Invitation',
    plural: 'Wedding Invitations',
    description: 'Elegant invites for your big day, with venue, maps and RSVP.',
    icon: 'Heart',
    gradient: 'from-rose-400 to-pink-600',
  },
  birthday: {
    label: 'Birthday',
    plural: 'Birthday Cards',
    description: 'Playful invites & wishes that make birthdays unforgettable.',
    icon: 'Cake',
    gradient: 'from-amber-400 to-orange-500',
  },
  greeting: {
    label: 'Greeting',
    plural: 'Greeting Cards',
    description: 'Say it beautifully — congratulations, thanks and holidays.',
    icon: 'Sparkles',
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  eid: {
    label: 'Eid',
    plural: 'Eid Cards',
    description: 'Eid Mubarak greetings with crescents, stars and gold accents.',
    icon: 'MoonStar',
    gradient: 'from-emerald-500 to-teal-600',
  },
  anniversary: {
    label: 'Anniversary',
    plural: 'Anniversary Cards',
    description: 'Celebrate milestones with timeless gold & elegant serif.',
    icon: 'Gem',
    gradient: 'from-yellow-500 to-amber-700',
  },
  corporate: {
    label: 'Corporate Event',
    plural: 'Corporate Invitations',
    description: 'Conferences, summits and company events, polished to impress.',
    icon: 'Building2',
    gradient: 'from-cyan-600 to-slate-700',
  },
  'thank-you': {
    label: 'Thank You',
    plural: 'Thank You Cards',
    description: 'Warm, personal notes of gratitude for every occasion.',
    icon: 'Flower2',
    gradient: 'from-pink-400 to-rose-500',
  },
  engagement: {
    label: 'Engagement',
    plural: 'Engagement Invitations',
    description: 'Romantic engagement party invites with rings and roses.',
    icon: 'HeartHandshake',
    gradient: 'from-rose-300 to-fuchsia-500',
  },
  graduation: {
    label: 'Graduation',
    plural: 'Graduation Cards',
    description: 'Class of 2026 — celebrate achievements in style.',
    icon: 'GraduationCap',
    gradient: 'from-indigo-400 to-violet-600',
  },
  ramadan: {
    label: 'Ramadan',
    plural: 'Ramadan Cards',
    description: 'Ramadan Kareem greetings with lanterns and crescent moons.',
    icon: 'Moon',
    gradient: 'from-teal-600 to-emerald-800',
  },
  custom: {
    label: 'Custom',
    plural: 'Custom Cards',
    description: 'Start from a blank canvas and build anything you imagine.',
    icon: 'Palette',
    gradient: 'from-slate-500 to-slate-700',
  },
}

export const CATEGORY_ORDER: CardCategory[] = [
  'business',
  'wedding',
  'birthday',
  'greeting',
  'eid',
  'anniversary',
  'corporate',
  'thank-you',
  'engagement',
  'graduation',
  'ramadan',
  'custom',
]

export function designStats(design: CardDesign) {
  const sides = [design.front, design.back].filter(Boolean) as CardSide[]
  const elements = sides.reduce((n, s) => n + s.elements.length, 0)
  return { sides: sides.length, elements }
}
