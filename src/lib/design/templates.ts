import {
  type BusinessFields, type CardCategory, type CardDesign, type CardElement, type CardSide,
  type IconElement, type QRElement, type ShapeElement, type StickerElement, type TextElement,
  uid,
} from './types'

/* ------------------------- element constructors ---------------------- */

const T = (text: string, x: number, y: number, w: number, h: number, o: Partial<TextElement> = {}): TextElement => ({
  id: uid('t'), type: 'text', text, x, y, w, h,
  rotation: 0, opacity: 1, locked: false, hidden: false,
  fontFamily: 'Inter', fontSize: 28, fontWeight: 400, color: '#1e293b',
  align: 'left', italic: false, underline: false, uppercase: false,
  letterSpacing: 0, lineHeight: 1.25, ...o,
})

const R = (x: number, y: number, w: number, h: number, o: Partial<ShapeElement> = {}): ShapeElement => ({
  id: uid('r'), type: 'shape', shape: 'rect', x, y, w, h,
  rotation: 0, opacity: 1, locked: false, hidden: false,
  fill: '#0f172a', stroke: 'none', strokeWidth: 0, radius: 0, ...o,
})

const E = (x: number, y: number, w: number, h: number, o: Partial<ShapeElement> = {}): ShapeElement => ({
  id: uid('e'), type: 'shape', shape: 'ellipse', x, y, w, h,
  rotation: 0, opacity: 1, locked: false, hidden: false,
  fill: 'none', stroke: '#0f172a', strokeWidth: 0, radius: 0, ...o,
})

const L = (x: number, y: number, w: number, o: Partial<ShapeElement> = {}): ShapeElement => ({
  id: uid('l'), type: 'shape', shape: 'line', x, y, w, h: 8,
  rotation: 0, opacity: 1, locked: false, hidden: false,
  fill: 'none', stroke: '#0f172a', strokeWidth: 2, radius: 0, ...o,
})

const I = (icon: string, x: number, y: number, size: number, o: Partial<IconElement> = {}): IconElement => ({
  id: uid('i'), type: 'icon', icon, x, y, w: size, h: size,
  rotation: 0, opacity: 1, locked: false, hidden: false, color: '#334155', strokeWidth: 2, ...o,
})

const S = (emoji: string, x: number, y: number, size: number, o: Partial<StickerElement> = {}): StickerElement => ({
  id: uid('s'), type: 'sticker', emoji, x, y, w: size, h: size,
  rotation: 0, opacity: 1, locked: false, hidden: false, ...o,
})

const Q = (data: string, x: number, y: number, size: number, o: Partial<QRElement> = {}): QRElement => ({
  id: uid('q'), type: 'qr', data, x, y, w: size, h: size,
  rotation: 0, opacity: 1, locked: false, hidden: false, fg: '#0f172a', bg: '#ffffff', ...o,
})

const side = (background: CardSide['background'], elements: CardElement[]): CardSide => ({ background, elements })
const solid = (color: string): CardSide['background'] => ({
  type: 'solid', color, gradient: { from: '#7c3aed', to: '#db2777', angle: 135 },
  pattern: 'dots', patternColor: '#0f172a12', overlay: 0.25,
})
const grad = (from: string, to: string, angle = 135): CardSide['background'] => ({
  type: 'gradient', color: from, gradient: { from, to, angle },
  pattern: 'dots', patternColor: '#0f172a12', overlay: 0.25,
})
const patterned = (color: string, pattern: CardSide['background']['pattern'], patternColor: string): CardSide['background'] => ({
  type: 'pattern', color, gradient: { from: '#7c3aed', to: '#db2777', angle: 135 },
  pattern, patternColor, overlay: 0.25,
})

/* ------------------------------- meta -------------------------------- */

export interface CardTemplate {
  id: string
  name: string
  category: CardCategory
  style: 'modern' | 'minimal' | 'luxury' | 'creative' | 'classic' | 'playful'
  isPro: boolean
  design: CardDesign
  business?: BusinessFields
  proTag?: string
}

export const GOLD = '#d4a853'
export const GOLD_LIGHT = '#f3e5c0'
const QR_DEMO = 'https://cardly.app/hello'

/* ------------------------- business 1050 x 600 ----------------------- */

const bizNoir: CardTemplate = {
  id: 'tpl-biz-noir', name: 'Noir Gold', category: 'business', style: 'luxury', isPro: true,
  business: {
    fullName: 'Alexandra Morgan', jobTitle: 'Creative Director', company: 'Acme Creative Studio',
    phone: '+1 (555) 210-4477', email: 'alex@acmecreative.co', website: 'acmecreative.co',
    address: '88 Galerie Ave, New York', whatsapp: '+1 555 210 4477',
    socials: { linkedin: 'linkedin.com/in/alexmorgan', instagram: '@alexmakes' },
  },
  design: {
    width: 1050, height: 600,
    front: side(solid('#0c0a09'), [
      R(90, 92, 150, 4, { fill: GOLD, radius: 2, name: 'Accent bar' }),
      T('Alexandra Morgan', 90, 128, 620, 80, { fontFamily: 'Playfair Display', fontSize: 56, fontWeight: 600, color: '#fafaf9', role: 'fullName' }),
      T('Creative Director', 93, 222, 480, 32, { fontSize: 19, fontWeight: 600, letterSpacing: 6, color: GOLD, uppercase: true, role: 'jobTitle' }),
      L(90, 428, 560, { stroke: '#292524', strokeWidth: 2 }),
      I('Phone', 90, 458, 24, { color: GOLD, strokeWidth: 1.8 }),
      T('+1 (555) 210-4477', 126, 455, 320, 30, { fontSize: 20, color: '#d6d3d1', role: 'phone' }),
      I('Mail', 90, 500, 24, { color: GOLD, strokeWidth: 1.8 }),
      T('alex@acmecreative.co', 126, 497, 340, 30, { fontSize: 20, color: '#d6d3d1', role: 'email' }),
      I('Globe', 90, 542, 24, { color: GOLD, strokeWidth: 1.8 }),
      T('acmecreative.co', 126, 539, 320, 30, { fontSize: 20, color: '#d6d3d1', role: 'website' }),
      Q(QR_DEMO, 838, 428, 122, { name: 'Contact QR' }),
      T('ACME CREATIVE STUDIO', 640, 96, 320, 28, { fontSize: 15, fontWeight: 600, letterSpacing: 4, color: '#78716c', align: 'right', role: 'company' }),
    ]),
    back: side(solid('#0c0a09'), [
      E(375, 140, 300, 300, { stroke: GOLD, strokeWidth: 2 }),
      E(391, 156, 268, 268, { stroke: '#d4a85355', strokeWidth: 1 }),
      T('AM', 375, 220, 300, 140, { fontFamily: 'Playfair Display', fontSize: 104, fontWeight: 600, color: GOLD, align: 'center' }),
      T('ACME CREATIVE STUDIO', 325, 490, 400, 30, { fontSize: 16, fontWeight: 500, letterSpacing: 6, color: '#a8a29e', align: 'center' }),
    ]),
  },
}

const bizIvory: CardTemplate = {
  id: 'tpl-biz-ivory', name: 'Ivory Minimal', category: 'business', style: 'minimal', isPro: false,
  business: {
    fullName: 'Sofia Laurent', jobTitle: 'Photographer', company: 'Laurent Studio',
    phone: '+1 (555) 977-2014', email: 'sofia@laurent.photo', website: 'laurent.photo',
    address: '12 Rue Camille, Portland', whatsapp: '+1 555 977 2014',
    socials: { instagram: '@laurent.photo' },
  },
  design: {
    width: 1050, height: 600,
    front: side(solid('#faf9f7'), [
      E(700, -90, 300, 300, { stroke: '#1c1917', strokeWidth: 1.5 }),
      E(740, -50, 220, 220, { stroke: '#d6d0c4', strokeWidth: 1 }),
      T('Sofia Laurent', 80, 112, 620, 80, { fontFamily: 'Playfair Display', fontSize: 54, fontWeight: 500, color: '#1c1917', role: 'fullName' }),
      L(84, 208, 90, { stroke: '#1c1917', strokeWidth: 2 }),
      T('Photographer', 84, 232, 400, 30, { fontSize: 17, fontWeight: 500, letterSpacing: 5, color: '#78716c', uppercase: true, role: 'jobTitle' }),
      T('LAURENT STUDIO', 84, 96, 300, 24, { fontSize: 13, fontWeight: 600, letterSpacing: 4, color: '#a8a29e', role: 'company' }),
      T('+1 (555) 977-2014', 630, 462, 340, 30, { fontSize: 19, color: '#44403c', align: 'right', role: 'phone' }),
      T('sofia@laurent.photo', 630, 502, 340, 30, { fontSize: 19, color: '#44403c', align: 'right', role: 'email' }),
      T('laurent.photo', 630, 542, 340, 30, { fontSize: 19, fontWeight: 600, color: '#1c1917', align: 'right', role: 'website' }),
    ]),
    back: side(solid('#1c1917'), [
      T('SL', 375, 190, 300, 160, { fontFamily: 'Playfair Display', fontSize: 110, fontWeight: 500, color: '#faf9f7', align: 'center' }),
      T('EVERY MOMENT, POETRY', 275, 400, 500, 30, { fontSize: 15, fontWeight: 400, letterSpacing: 7, color: '#a8a29e', align: 'center' }),
    ]),
  },
}

const bizWaves: CardTemplate = {
  id: 'tpl-biz-waves', name: 'Vivid Waves', category: 'business', style: 'creative', isPro: true,
  business: {
    fullName: 'Jonas Dahl', jobTitle: 'Freelance Developer', company: 'Dahl Digital',
    phone: '+45 55 01 33 77', email: 'hi@jonas.dev', website: 'jonas.dev',
    address: 'Remote · Copenhagen', whatsapp: '+45 55 01 33 77',
    socials: { github: '', linkedin: 'linkedin.com/in/jonasdahl', twitter: '@jonasbuilds' },
  },
  design: {
    width: 1050, height: 600,
    front: side(grad('#7c3aed', '#db2777', 135), [
      E(640, -190, 600, 600, { fill: '#ffffff14', stroke: 'none' }),
      E(-150, 400, 420, 420, { fill: '#ffffff10', stroke: 'none' }),
      E(90, 100, 130, 130, { fill: '#ffffff2e', stroke: '#ffffff88', strokeWidth: 2 }),
      T('JD', 90, 128, 130, 80, { fontFamily: 'Space Grotesk', fontSize: 52, fontWeight: 700, color: '#ffffff', align: 'center' }),
      T('Jonas Dahl', 90, 268, 520, 70, { fontFamily: 'Space Grotesk', fontSize: 52, fontWeight: 700, color: '#ffffff', role: 'fullName' }),
      T('Freelance Developer', 93, 348, 480, 30, { fontSize: 17, fontWeight: 600, letterSpacing: 4, color: '#ffffffcc', uppercase: true, role: 'jobTitle' }),
      R(90, 462, 302, 56, { fill: '#ffffff22', radius: 28 }),
      T('jonas.dev', 90, 474, 302, 32, { fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 600, color: '#ffffff', align: 'center', role: 'website' }),
      Q(QR_DEMO, 842, 452, 108, { name: 'QR' }),
      T('DAHL DIGITAL', 640, 100, 320, 26, { fontSize: 14, fontWeight: 600, letterSpacing: 5, color: '#ffffffb3', align: 'right', role: 'company' }),
    ]),
    back: side(grad('#db2777', '#7c3aed', 135), [
      E(280, 120, 490, 360, { fill: '#ffffff12', stroke: 'none' }),
      T("LET'S BUILD\nSOMETHING GREAT", 225, 190, 600, 180, { fontFamily: 'Space Grotesk', fontSize: 54, fontWeight: 700, color: '#ffffff', align: 'center', lineHeight: 1.2 }),
      T('hi@jonas.dev', 325, 400, 400, 36, { fontFamily: 'Space Grotesk', fontSize: 24, color: '#ffffffd9', align: 'center' }),
    ]),
  },
}

const bizEmerald: CardTemplate = {
  id: 'tpl-biz-emerald', name: 'Emerald Corporate', category: 'business', style: 'modern', isPro: false,
  business: {
    fullName: 'Omar Rahman', jobTitle: 'Head of Product', company: 'Northwind Labs',
    phone: '+1 (555) 442-8800', email: 'omar@northwindlabs.com', website: 'northwindlabs.com',
    address: '400 Harbor Point, Boston', whatsapp: '+1 555 442 8800',
    socials: { linkedin: 'linkedin.com/in/omarrahman' },
  },
  design: {
    width: 1050, height: 600,
    front: side(solid('#ffffff'), [
      R(760, 0, 290, 600, { fill: '#064e3b' }),
      R(748, 0, 12, 600, { fill: '#34d399' }),
      E(800, 96, 210, 210, { fill: '#065f46', stroke: '#34d399', strokeWidth: 2 }),
      T('OR', 800, 160, 210, 100, { fontFamily: 'Playfair Display', fontSize: 68, fontWeight: 600, color: '#d1fae5', align: 'center' }),
      T('Omar Rahman', 80, 118, 600, 76, { fontFamily: 'Playfair Display', fontSize: 52, fontWeight: 600, color: '#0f172a', role: 'fullName' }),
      T('Head of Product', 83, 206, 480, 30, { fontSize: 17, fontWeight: 600, letterSpacing: 4, color: '#059669', uppercase: true, role: 'jobTitle' }),
      T('NORTHWIND LABS', 83, 248, 480, 28, { fontSize: 19, fontWeight: 700, letterSpacing: 2, color: '#334155', role: 'company' }),
      I('Phone', 80, 442, 24, { color: '#059669' }),
      T('+1 (555) 442-8800', 116, 440, 380, 28, { fontSize: 19, color: '#475569', role: 'phone' }),
      I('Mail', 80, 486, 24, { color: '#059669' }),
      T('omar@northwindlabs.com', 116, 484, 420, 28, { fontSize: 19, color: '#475569', role: 'email' }),
      I('MapPin', 80, 530, 24, { color: '#059669' }),
      T('400 Harbor Point, Boston', 116, 528, 420, 28, { fontSize: 19, color: '#475569', role: 'address' }),
    ]),
    back: side(solid('#064e3b'), [
      E(470, 175, 160, 160, { stroke: '#34d399', strokeWidth: 2 }),
      T('N', 470, 205, 160, 110, { fontFamily: 'Playfair Display', fontSize: 74, fontWeight: 600, color: '#d1fae5', align: 'center' }),
      T('northwindlabs.com', 225, 430, 650, 50, { fontFamily: 'Space Grotesk', fontSize: 38, fontWeight: 500, color: '#d1fae5', align: 'center' }),
      T('BUILDING TOMORROW, TODAY', 250, 496, 600, 26, { fontSize: 13, fontWeight: 500, letterSpacing: 6, color: '#6ee7b7', align: 'center' }),
    ]),
  },
}

const bizSunset: CardTemplate = {
  id: 'tpl-biz-sunset', name: 'Sunset Studio', category: 'business', style: 'creative', isPro: false,
  business: {
    fullName: 'Lina Novak', jobTitle: 'Illustrator & Art Director', company: 'Lina Studio',
    phone: '+1 (555) 308-2210', email: 'hello@lina.studio', website: 'lina.studio',
    address: 'Lisbon · worldwide', whatsapp: '+1 555 308 2210',
    socials: { instagram: '@lina.draws' },
  },
  design: {
    width: 1050, height: 600,
    front: side(grad('#fb923c', '#db2777', 120), [
      E(80, 88, 150, 150, { fill: '#ffffff33', stroke: '#ffffff', strokeWidth: 2.5 }),
      T('LN', 80, 120, 150, 90, { fontFamily: 'Space Grotesk', fontSize: 56, fontWeight: 700, color: '#ffffff', align: 'center' }),
      T('Lina Novak', 80, 268, 560, 110, { fontFamily: 'Dancing Script', fontSize: 82, fontWeight: 700, color: '#ffffff', role: 'fullName' }),
      T('Illustrator & Art Director', 85, 388, 520, 30, { fontSize: 16, fontWeight: 600, letterSpacing: 3, color: '#ffffffd9', uppercase: true, role: 'jobTitle' }),
      R(80, 452, 470, 58, { fill: '#00000026', radius: 29 }),
      T('hello@lina.studio  ·  +1 555 308 2210', 80, 465, 470, 34, { fontSize: 19, fontWeight: 500, color: '#ffffff', align: 'center' }),
      S('🎨', 770, 110, 170, { rotation: 8 }),
      Q(QR_DEMO, 845, 450, 108, { name: 'QR' }),
    ]),
    back: side(grad('#db2777', '#fb923c', 120), [
      T('LINA STUDIO', 225, 160, 600, 90, { fontFamily: 'Bebas Neue', fontSize: 76, color: '#ffffff', align: 'center', letterSpacing: 8 }),
      T('bringing stories to life, one sketch at a time', 175, 280, 700, 40, { fontFamily: 'Caveat', fontSize: 36, color: '#ffffffe6', align: 'center' }),
      I('Instagram', 400, 380, 40, { color: '#ffffff' }),
      I('Globe', 480, 380, 40, { color: '#ffffff' }),
      I('Mail', 560, 380, 40, { color: '#ffffff' }),
      T('lina.studio', 325, 460, 400, 40, { fontFamily: 'Space Grotesk', fontSize: 26, fontWeight: 600, color: '#ffffff', align: 'center' }),
    ]),
  },
}

/* ------------------------- wedding 1000 x 1400 ----------------------- */

const wedBlush: CardTemplate = {
  id: 'tpl-wed-blush', name: 'Blush Promise', category: 'wedding', style: 'classic', isPro: true,
  design: {
    width: 1000, height: 1400,
    front: side(solid('#fdf6f1'), [
      R(60, 60, 880, 1280, { fill: 'none', stroke: '#c9a96a', strokeWidth: 2, radius: 4 }),
      R(78, 78, 844, 1244, { fill: 'none', stroke: '#c9a96a66', strokeWidth: 1, radius: 2 }),
      I('Flower2', 470, 150, 60, { color: '#c9a96a', strokeWidth: 1.4 }),
      T('TOGETHER WITH THEIR FAMILIES', 150, 262, 700, 30, { fontSize: 20, fontWeight: 500, letterSpacing: 6, color: '#9a8f83', align: 'center' }),
      T('Amara & Zahid', 100, 330, 800, 180, { fontFamily: 'Great Vibes', fontSize: 120, color: '#a34a5c', align: 'center', role: 'hostName' }),
      T('SATURDAY · JUNE 14TH · 2026', 150, 556, 700, 36, { fontFamily: 'Playfair Display', fontSize: 29, fontWeight: 600, letterSpacing: 4, color: '#6b5d52', align: 'center', role: 'dateTime' }),
      L(340, 626, 110, { stroke: '#c9a96a', strokeWidth: 1.5 }),
      R(482, 612, 20, 20, { fill: '#c9a96a', rotation: 45, radius: 2 }),
      L(550, 626, 110, { stroke: '#c9a96a', strokeWidth: 1.5 }),
      T('request the pleasure of your company\nat the celebration of their marriage', 190, 668, 620, 110, { fontFamily: 'Cormorant Garamond', fontSize: 34, italic: true, color: '#6b5d52', align: 'center', lineHeight: 1.45 }),
      T('AT HALF PAST SIX IN THE EVENING', 200, 812, 600, 28, { fontSize: 17, fontWeight: 500, letterSpacing: 4, color: '#9a8f83', align: 'center' }),
      T('The Grand Pavilion\n12 Lakeside Avenue, San Francisco', 150, 900, 700, 110, { fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 600, color: '#57504a', align: 'center', lineHeight: 1.4, role: 'venue' }),
      T('dinner & dancing to follow', 200, 1058, 600, 40, { fontFamily: 'Cormorant Garamond', fontSize: 30, italic: true, color: '#8c7f74', align: 'center' }),
      T('KINDLY RESPOND BY MAY THE FIRST', 200, 1178, 600, 26, { fontSize: 16, fontWeight: 500, letterSpacing: 3, color: '#9a8f83', align: 'center', role: 'rsvp' }),
      I('Flower2', 470, 1236, 60, { color: '#c9a96a', strokeWidth: 1.4, rotation: 180 }),
    ]),
  },
}

const wedEmerald: CardTemplate = {
  id: 'tpl-wed-emerald', name: 'Emerald Royale', category: 'wedding', style: 'luxury', isPro: true,
  design: {
    width: 1000, height: 1400,
    front: side(solid('#064e3b'), [
      R(56, 56, 888, 1288, { fill: 'none', stroke: GOLD, strokeWidth: 2, radius: 2 }),
      R(74, 74, 852, 1252, { fill: 'none', stroke: '#d4af3780', strokeWidth: 1 }),
      R(42, 42, 28, 28, { fill: GOLD, rotation: 45, radius: 2 }),
      R(930, 42, 28, 28, { fill: GOLD, rotation: 45, radius: 2 }),
      R(42, 1330, 28, 28, { fill: GOLD, rotation: 45, radius: 2 }),
      R(930, 1330, 28, 28, { fill: GOLD, rotation: 45, radius: 2 }),
      E(425, 140, 150, 150, { stroke: GOLD, strokeWidth: 1.8 }),
      T('A · Z', 425, 178, 150, 80, { fontFamily: 'Cormorant Garamond', fontSize: 52, fontWeight: 600, color: GOLD, align: 'center' }),
      T('TOGETHER WITH THEIR FAMILIES', 150, 342, 700, 28, { fontSize: 18, fontWeight: 400, letterSpacing: 5, color: '#cbbf9a', align: 'center' }),
      T('Amara & Zahid', 100, 400, 800, 170, { fontFamily: 'Cormorant Garamond', fontSize: 104, fontWeight: 600, color: GOLD_LIGHT, align: 'center', role: 'hostName' }),
      L(360, 596, 100, { stroke: '#d4af3780', strokeWidth: 1 }),
      T('24 · 06 · 2026', 300, 622, 400, 44, { fontFamily: 'Cormorant Garamond', fontSize: 38, fontWeight: 600, letterSpacing: 8, color: GOLD, align: 'center', role: 'dateTime' }),
      L(540, 596, 100, { stroke: '#d4af3780', strokeWidth: 1 }),
      T('request the honour of your presence\nat the celebration of their union', 200, 712, 600, 100, { fontFamily: 'Cormorant Garamond', fontSize: 33, italic: true, color: '#d9cdb4', align: 'center', lineHeight: 1.5 }),
      T('AT HALF PAST SIX IN THE EVENING', 200, 838, 600, 26, { fontSize: 15, fontWeight: 400, letterSpacing: 4, color: '#cbbf9a', align: 'center' }),
      T('The Grand Ballroom\nRosewood Hotel, Charleston', 150, 916, 700, 106, { fontFamily: 'Playfair Display', fontSize: 36, fontWeight: 500, color: GOLD_LIGHT, align: 'center', lineHeight: 1.45, role: 'venue' }),
      L(420, 1064, 160, { stroke: '#d4af3755', strokeWidth: 1 }),
      T('BLACK TIE', 380, 1094, 240, 26, { fontSize: 15, fontWeight: 500, letterSpacing: 6, color: GOLD, align: 'center', role: 'dressCode' }),
      T('RSVP · +1 (555) 010 2030', 250, 1180, 500, 28, { fontSize: 17, fontWeight: 400, letterSpacing: 3, color: '#cbbf9a', align: 'center', role: 'rsvp' }),
      I('MoonStar', 462, 1250, 76, { color: GOLD, strokeWidth: 1.4 }),
    ]),
  },
}

const wedArch: CardTemplate = {
  id: 'tpl-wed-arch', name: 'Modern Arch', category: 'wedding', style: 'modern', isPro: false,
  design: {
    width: 1000, height: 1400,
    front: side(solid('#f4f1ec'), [
      E(300, 190, 400, 640, { fill: '#9caf88', stroke: 'none' }),
      R(300, 512, 400, 322, { fill: '#9caf88' }),
      T('TOGETHER WITH THEIR FAMILIES', 150, 96, 700, 28, { fontSize: 19, fontWeight: 500, letterSpacing: 6, color: '#6b7259', align: 'center' }),
      I('Leaf', 240, 150, 44, { color: '#8a9a75', rotation: -30 }),
      I('Leaf', 716, 150, 44, { color: '#8a9a75', rotation: 30 }),
      T('Amara & Zahid', 310, 400, 380, 150, { fontFamily: 'Playfair Display', fontSize: 62, fontWeight: 600, color: '#ffffff', align: 'center', lineHeight: 1.15, role: 'hostName' }),
      T('ARE GETTING MARRIED', 310, 570, 380, 26, { fontSize: 15, fontWeight: 500, letterSpacing: 4, color: '#f4f1ec', align: 'center' }),
      T('SATURDAY · JUNE 14 · 2026 · 6 PM', 150, 916, 700, 30, { fontSize: 21, fontWeight: 600, letterSpacing: 3, color: '#3f4a3c', align: 'center', role: 'dateTime' }),
      T('The Olive Terrace\nSonoma Valley, California', 150, 986, 700, 96, { fontFamily: 'Playfair Display', fontSize: 33, fontWeight: 500, color: '#4a544a', align: 'center', lineHeight: 1.4, role: 'venue' }),
      T('dinner under the stars to follow', 200, 1120, 600, 40, { fontFamily: 'Cormorant Garamond', fontSize: 29, italic: true, color: '#6b7259', align: 'center' }),
      L(400, 1196, 200, { stroke: '#9caf88', strokeWidth: 1.5 }),
      T('RSVP BY MAY 1 · AMARA-ZAHID.COM', 150, 1236, 700, 26, { fontSize: 16, fontWeight: 500, letterSpacing: 3, color: '#3f4a3c', align: 'center', role: 'rsvp' }),
    ]),
  },
}

/* ------------------------- birthday 1000 x 1400 ---------------------- */

const bdayConfetti: CardTemplate = {
  id: 'tpl-bday-confetti', name: 'Confetti Bash', category: 'birthday', style: 'playful', isPro: false,
  design: {
    width: 1000, height: 1400,
    front: side(patterned('#fef3c7', 'confetti', '#f59e0b55'), [
      S('🎈', 130, 110, 150, { rotation: -10 }),
      S('🎈', 730, 130, 160, { rotation: 12 }),
      S('🎉', 430, 90, 130),
      T("YOU'RE INVITED!", 100, 300, 800, 150, { fontFamily: 'Bebas Neue', fontSize: 128, color: '#ea580c', align: 'center', letterSpacing: 2 }),
      T("to Maya's 8th Birthday Party!", 100, 470, 800, 110, { fontFamily: 'Caveat', fontSize: 68, fontWeight: 700, color: '#92400e', align: 'center', role: 'eventTitle' }),
      R(120, 640, 760, 470, { fill: '#ffffff', stroke: '#fde68a', strokeWidth: 3, radius: 32 }),
      I('CalendarDays', 190, 706, 42, { color: '#f59e0b' }),
      T('SATURDAY · MAY 16 · 2:00 PM', 262, 712, 570, 34, { fontSize: 27, fontWeight: 600, color: '#78350f', role: 'dateTime' }),
      I('MapPin', 190, 792, 42, { color: '#f59e0b' }),
      T('Sunshine Park, 45 Meadow Rd', 262, 798, 570, 34, { fontSize: 26, fontWeight: 500, color: '#78350f', role: 'venue' }),
      I('Cake', 190, 878, 42, { color: '#f59e0b' }),
      T('Cake, games & a bouncy castle!', 262, 884, 570, 34, { fontSize: 26, fontWeight: 500, color: '#78350f', role: 'extraInfo' }),
      I('MessageCircle', 190, 964, 42, { color: '#f59e0b' }),
      T('RSVP · Ayesha · 555-0134', 262, 970, 570, 34, { fontSize: 26, fontWeight: 500, color: '#78350f', role: 'rsvp' }),
      S('🎂', 430, 1140, 150),
      T('hosted by the Alam family', 250, 1312, 500, 56, { fontFamily: 'Caveat', fontSize: 42, fontWeight: 700, color: '#92400e', align: 'center', role: 'hostName' }),
    ]),
  },
}

const bdayGlow: CardTemplate = {
  id: 'tpl-bday-glow', name: 'Neon Glow', category: 'birthday', style: 'playful', isPro: true,
  design: {
    width: 1000, height: 1400,
    front: side(solid('#1e1033'), [
      E(680, 70, 280, 280, { stroke: '#a855f7', strokeWidth: 2 }),
      E(40, 880, 230, 230, { fill: '#7c3aed33', stroke: 'none' }),
      I('Sparkles', 160, 200, 44, { color: '#f0abfc' }),
      I('Sparkles', 800, 480, 56, { color: '#fbbf24' }),
      I('Sparkles', 120, 620, 36, { color: '#c4b5fd' }),
      T('MAYA IS TURNING', 150, 240, 700, 32, { fontSize: 22, fontWeight: 500, letterSpacing: 10, color: '#e9d5ff', align: 'center' }),
      T('21', 300, 290, 400, 310, { fontFamily: 'Bebas Neue', fontSize: 270, color: '#f0abfc', align: 'center' }),
      T('join the neon night party', 150, 640, 700, 90, { fontFamily: 'Caveat', fontSize: 64, fontWeight: 700, color: '#c4b5fd', align: 'center', role: 'eventTitle' }),
      I('CalendarDays', 210, 800, 38, { color: '#a855f7' }),
      T('FRI · JUNE 20 · 9 PM', 278, 804, 520, 32, { fontFamily: 'Space Grotesk', fontSize: 27, fontWeight: 600, color: '#ffffff', role: 'dateTime' }),
      I('MapPin', 210, 868, 38, { color: '#a855f7' }),
      T('Skyline Rooftop, Downtown', 278, 872, 520, 32, { fontFamily: 'Space Grotesk', fontSize: 26, fontWeight: 500, color: '#ffffffd9', role: 'venue' }),
      I('Sparkles', 210, 936, 38, { color: '#a855f7' }),
      T('Glow sticks provided · neon dress', 278, 940, 520, 32, { fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 500, color: '#ffffffd9', role: 'dressCode' }),
      T('RSVP · 555 010 2030', 278, 1008, 520, 30, { fontFamily: 'Space Grotesk', fontSize: 23, fontWeight: 500, color: '#a855f7', role: 'rsvp' }),
      S('🪩', 430, 1090, 150),
    ]),
  },
}

/* ------------------------- engagement 1000 x 1400 -------------------- */

const engRose: CardTemplate = {
  id: 'tpl-eng-rose', name: 'Rose Quartz', category: 'engagement', style: 'classic', isPro: true,
  design: {
    width: 1000, height: 1400,
    front: side(grad('#fecdd3', '#fda4af', 130), [
      R(110, 110, 780, 1180, { fill: '#ffffffd9', radius: 28 }),
      S('💍', 440, 180, 120),
      T('SHE SAID YES!', 150, 330, 700, 30, { fontSize: 22, fontWeight: 700, letterSpacing: 9, color: '#be185d', align: 'center' }),
      T('Isabella & Marco', 130, 390, 740, 170, { fontFamily: 'Great Vibes', fontSize: 106, color: '#9d174d', align: 'center', role: 'hostName' }),
      T('are getting engaged!', 200, 592, 600, 60, { fontFamily: 'Cormorant Garamond', fontSize: 40, italic: true, color: '#9f1239', align: 'center' }),
      L(380, 694, 90, { stroke: '#be185d88', strokeWidth: 1.5 }),
      I('Heart', 478, 682, 30, { color: '#be185d' }),
      L(530, 694, 90, { stroke: '#be185d88', strokeWidth: 1.5 }),
      T('SATURDAY · JULY 5 · 2026', 200, 738, 600, 30, { fontSize: 23, fontWeight: 600, letterSpacing: 3, color: '#9f1239', align: 'center', role: 'dateTime' }),
      T('COCKTAILS AT SIX · DINNER AT EIGHT', 150, 790, 700, 26, { fontSize: 17, fontWeight: 500, letterSpacing: 3, color: '#b4536f', align: 'center' }),
      T('The Rose Garden Estate', 150, 866, 700, 60, { fontFamily: 'Playfair Display', fontSize: 40, fontWeight: 600, color: '#831843', align: 'center', role: 'venue' }),
      T('18 Cypress Lane, Napa Valley', 200, 936, 600, 30, { fontSize: 22, fontWeight: 500, color: '#9f5368', align: 'center' }),
      I('Flower2', 210, 1030, 52, { color: '#e11d68aa' }),
      T('RSVP · Isabella · 555 010 9876', 200, 1044, 600, 30, { fontSize: 22, fontWeight: 500, color: '#9f1239', align: 'center', role: 'rsvp' }),
      I('Flower2', 738, 1030, 52, { color: '#e11d68aa' }),
      T('garden party attire', 300, 1150, 400, 40, { fontFamily: 'Caveat', fontSize: 36, fontWeight: 700, color: '#be5773', align: 'center', role: 'dressCode' }),
    ]),
  },
}

/* ------------------------- corporate 1000 x 1400 --------------------- */

const corpSummit: CardTemplate = {
  id: 'tpl-corp-summit', name: 'Summit 2026', category: 'corporate', style: 'modern', isPro: true,
  design: {
    width: 1000, height: 1400,
    front: side(solid('#0f172a'), [
      R(100, 118, 92, 8, { fill: '#22d3ee', radius: 4 }),
      T('PRODUCT\nSUMMIT', 100, 168, 800, 230, { fontFamily: 'Space Grotesk', fontSize: 92, fontWeight: 700, color: '#ffffff', lineHeight: 1.12 }),
      T('2026', 100, 408, 800, 140, { fontFamily: 'Space Grotesk', fontSize: 120, fontWeight: 700, color: '#22d3ee' }),
      T('WHERE PRODUCT LEADERS SHAPE TOMORROW', 100, 580, 760, 28, { fontSize: 19, fontWeight: 400, letterSpacing: 2, color: '#94a3b8' }),
      R(100, 672, 800, 310, { fill: '#1e293b', radius: 20 }),
      I('CalendarDays', 150, 716, 36, { color: '#22d3ee' }),
      T('MARCH 12–13, 2026', 214, 720, 600, 30, { fontFamily: 'Space Grotesk', fontSize: 26, fontWeight: 500, color: '#f1f5f9', role: 'dateTime' }),
      I('MapPin', 150, 788, 36, { color: '#22d3ee' }),
      T('Moscone Center, San Francisco', 214, 792, 600, 30, { fontFamily: 'Space Grotesk', fontSize: 25, fontWeight: 500, color: '#f1f5f9', role: 'venue' }),
      I('Clock', 150, 860, 36, { color: '#22d3ee' }),
      T('Doors 8:30 AM · Keynote 10:00 AM', 214, 864, 600, 30, { fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 500, color: '#f1f5f9' }),
      T('40+ SPEAKERS · WORKSHOPS · NETWORKING', 100, 1030, 800, 30, { fontSize: 20, fontWeight: 500, letterSpacing: 1, color: '#22d3ee' }),
      T('register at summit.example', 100, 1096, 520, 30, { fontSize: 22, fontWeight: 500, color: '#e2e8f0', role: 'rsvp' }),
      T('Early-bird tickets until January 31', 100, 1142, 520, 26, { fontSize: 19, fontWeight: 400, color: '#94a3b8', role: 'extraInfo' }),
      Q('https://summit.example/register', 730, 1090, 170, { name: 'Register QR' }),
      T('SCAN TO REGISTER', 665, 1288, 300, 24, { fontSize: 14, fontWeight: 500, letterSpacing: 3, color: '#94a3b8', align: 'center' }),
    ]),
  },
}

/* ------------------------- graduation 1000 x 1400 -------------------- */

const gradGold: CardTemplate = {
  id: 'tpl-grad-gold', name: 'Class of Gold', category: 'graduation', style: 'modern', isPro: false,
  design: {
    width: 1000, height: 1400,
    front: side(solid('#2e1065'), [
      R(70, 70, 860, 1260, { fill: 'none', stroke: '#d4af3790', strokeWidth: 1.5 }),
      S('🎓', 430, 150, 140),
      T('CLASS OF', 200, 320, 600, 110, { fontFamily: 'Bebas Neue', fontSize: 84, letterSpacing: 12, color: '#fbbf24', align: 'center' }),
      T('2026', 200, 420, 600, 260, { fontFamily: 'Bebas Neue', fontSize: 230, color: '#fbbf24', align: 'center' }),
      T('Alexandra J. Morgan', 100, 726, 800, 90, { fontFamily: 'Playfair Display', fontSize: 62, fontWeight: 600, color: '#ffffff', align: 'center', role: 'hostName' }),
      T('BACHELOR OF SCIENCE · COMPUTER SCIENCE', 100, 838, 800, 28, { fontSize: 18, fontWeight: 500, letterSpacing: 3, color: '#c4b5fd', align: 'center' }),
      L(340, 916, 110, { stroke: '#d4af3780', strokeWidth: 1 }),
      R(482, 902, 20, 20, { fill: '#d4af37', rotation: 45, radius: 2 }),
      L(550, 916, 110, { stroke: '#d4af3780', strokeWidth: 1 }),
      T('CEREMONY · JUNE 21 · 2 PM', 200, 962, 600, 28, { fontSize: 19, fontWeight: 500, letterSpacing: 3, color: '#fbbf24', align: 'center', role: 'dateTime' }),
      T('Zellerbach Hall, Berkeley', 200, 1020, 600, 56, { fontFamily: 'Playfair Display', fontSize: 34, fontWeight: 500, color: '#f3e8ff', align: 'center', role: 'venue' }),
      T('celebrate with us afterwards!', 250, 1120, 500, 52, { fontFamily: 'Caveat', fontSize: 40, fontWeight: 700, color: '#c4b5fd', align: 'center', role: 'extraInfo' }),
      I('Sparkles', 150, 118, 48, { color: '#fbbf24' }),
      I('Sparkles', 800, 118, 48, { color: '#fbbf24' }),
      T('UNIVERSITY OF CALIFORNIA', 250, 1250, 500, 26, { fontSize: 15, fontWeight: 500, letterSpacing: 5, color: '#a78bfa', align: 'center' }),
    ]),
  },
}

/* ------------------------- anniversary 1000 x 1400 ------------------- */

const annGold: CardTemplate = {
  id: 'tpl-ann-gold', name: 'Golden Fifty', category: 'anniversary', style: 'luxury', isPro: true,
  design: {
    width: 1000, height: 1400,
    front: side(solid('#17130e'), [
      R(60, 60, 880, 1280, { fill: 'none', stroke: GOLD, strokeWidth: 2 }),
      R(80, 80, 840, 1240, { fill: 'none', stroke: '#d4af3760', strokeWidth: 1 }),
      T('50', 250, 190, 500, 340, { fontFamily: 'Playfair Display', fontSize: 250, fontWeight: 700, color: GOLD, align: 'center' }),
      T('YEARS OF LOVE & LAUGHTER', 150, 566, 700, 30, { fontSize: 21, fontWeight: 400, letterSpacing: 7, color: '#a8956f', align: 'center' }),
      T('Elena & Viktor', 100, 650, 800, 170, { fontFamily: 'Great Vibes', fontSize: 104, color: GOLD_LIGHT, align: 'center', role: 'hostName' }),
      T('renew their vows & celebrate', 200, 856, 600, 52, { fontFamily: 'Cormorant Garamond', fontSize: 35, italic: true, color: '#b3a07c', align: 'center' }),
      L(360, 948, 100, { stroke: '#d4af3780', strokeWidth: 1 }),
      I('Heart', 470, 932, 34, { color: GOLD }),
      L(540, 948, 100, { stroke: '#d4af3780', strokeWidth: 1 }),
      T('SATURDAY · OCTOBER 3 · 7 PM', 200, 992, 600, 28, { fontSize: 20, fontWeight: 500, letterSpacing: 4, color: GOLD, align: 'center', role: 'dateTime' }),
      T('Villa Serena, Lake Como', 150, 1054, 700, 60, { fontFamily: 'Playfair Display', fontSize: 40, fontWeight: 500, color: GOLD_LIGHT, align: 'center', role: 'venue' }),
      T('RSVP · +39 555 018 2266', 250, 1180, 500, 28, { fontSize: 18, fontWeight: 400, letterSpacing: 2, color: '#a8956f', align: 'center', role: 'rsvp' }),
      S('✨', 160, 150, 80),
      S('✨', 780, 150, 80),
      S('✨', 790, 1180, 72),
      S('✨', 150, 1180, 72),
    ]),
  },
}

/* ------------------------- eid / ramadan ----------------------------- */

const eidCard: CardTemplate = {
  id: 'tpl-eid-emerald', name: 'Eid Mubarak', category: 'eid', style: 'classic', isPro: false,
  design: {
    width: 1000, height: 1400,
    front: side(patterned('#065f46', 'rings', '#d4af3722'), [
      I('MoonStar', 430, 150, 140, { color: '#fbbf24', strokeWidth: 1.4 }),
      T('Eid Mubarak', 100, 330, 800, 200, { fontFamily: 'Great Vibes', fontSize: 126, color: '#fbbf24', align: 'center' }),
      T('May Allah accept your fasts,\nprayers & good deeds', 150, 580, 700, 110, { fontFamily: 'Cormorant Garamond', fontSize: 37, italic: true, color: '#d1fae5', align: 'center', lineHeight: 1.45, role: 'extraInfo' }),
      L(340, 726, 100, { stroke: '#d4af3780', strokeWidth: 1 }),
      I('Star', 474, 706, 42, { color: '#fbbf24', strokeWidth: 1.6 }),
      L(560, 726, 100, { stroke: '#d4af3780', strokeWidth: 1 }),
      T('from our family to yours', 200, 770, 600, 70, { fontFamily: 'Caveat', fontSize: 52, fontWeight: 700, color: '#a7f3d0', align: 'center', role: 'hostName' }),
      T('The Rahman Family', 150, 868, 700, 70, { fontFamily: 'Playfair Display', fontSize: 50, fontWeight: 600, color: '#ffffff', align: 'center' }),
      S('🕌', 430, 990, 140),
      T('EID AL-FITR · 1447 AH', 250, 1190, 500, 28, { fontSize: 19, fontWeight: 500, letterSpacing: 5, color: '#fbbf24', align: 'center' }),
      I('Star', 180, 420, 34, { color: '#fbbf24', strokeWidth: 1.4 }),
      I('Star', 800, 460, 34, { color: '#fbbf24', strokeWidth: 1.4 }),
      I('Star', 130, 900, 30, { color: '#fbbf24', strokeWidth: 1.4 }),
      I('Star', 850, 930, 30, { color: '#fbbf24', strokeWidth: 1.4 }),
    ]),
  },
}

const ramadanCard: CardTemplate = {
  id: 'tpl-ramadan-lantern', name: 'Ramadan Kareem', category: 'ramadan', style: 'luxury', isPro: false,
  design: {
    width: 1000, height: 1400,
    front: side(patterned('#3b0764', 'diagonal', '#d4af3715'), [
      S('🏮', 140, 150, 130, { rotation: -8 }),
      S('🏮', 720, 130, 140, { rotation: 7 }),
      I('Moon', 430, 190, 140, { color: '#fcd34d', strokeWidth: 1.4 }),
      T('RAMADAN', 100, 400, 800, 170, { fontFamily: 'Bebas Neue', fontSize: 140, letterSpacing: 6, color: '#fcd34d', align: 'center' }),
      T('KAREEM', 100, 566, 800, 170, { fontFamily: 'Bebas Neue', fontSize: 140, letterSpacing: 14, color: '#fbbf24', align: 'center' }),
      T('a month of mercy, fasting & reflection', 150, 780, 700, 60, { fontFamily: 'Cormorant Garamond', fontSize: 38, italic: true, color: '#e9d5ff', align: 'center', role: 'extraInfo' }),
      L(340, 886, 100, { stroke: '#fbbf2466', strokeWidth: 1 }),
      I('Star', 474, 866, 42, { color: '#fcd34d', strokeWidth: 1.6 }),
      L(560, 886, 100, { stroke: '#fbbf2466', strokeWidth: 1 }),
      T('RAMADAN MUBARAK · 1447 AH', 150, 932, 700, 28, { fontSize: 19, fontWeight: 500, letterSpacing: 5, color: '#fbbf24', align: 'center' }),
      T('May your supplications be answered', 200, 1010, 600, 64, { fontFamily: 'Caveat', fontSize: 46, fontWeight: 700, color: '#fde68a', align: 'center', role: 'hostName' }),
      S('🤲', 430, 1110, 120),
      I('Star', 170, 320, 32, { color: '#fcd34d', strokeWidth: 1.4 }),
      I('Star', 820, 350, 32, { color: '#fcd34d', strokeWidth: 1.4 }),
      I('Star', 130, 700, 30, { color: '#fcd34d', strokeWidth: 1.4 }),
      I('Star', 850, 730, 30, { color: '#fcd34d', strokeWidth: 1.4 }),
    ]),
  },
}

/* ------------------------- greetings --------------------------------- */

const thanksBlush: CardTemplate = {
  id: 'tpl-thanks-blush', name: 'Grateful Heart', category: 'thank-you', style: 'minimal', isPro: false,
  design: {
    width: 1050, height: 750,
    front: side(solid('#fff1f2'), [
      I('Flower2', 62, 62, 64, { color: '#fb7185', strokeWidth: 1.4 }),
      I('Flower2', 924, 62, 64, { color: '#fb7185', strokeWidth: 1.4, rotation: 20 }),
      I('Flower2', 62, 624, 64, { color: '#fb7185', strokeWidth: 1.4, rotation: -20 }),
      I('Flower2', 924, 624, 64, { color: '#fb7185', strokeWidth: 1.4 }),
      T('Thank You', 75, 120, 900, 210, { fontFamily: 'Great Vibes', fontSize: 140, color: '#be185d', align: 'center' }),
      T('for your kindness, generosity & love', 150, 372, 750, 60, { fontFamily: 'Cormorant Garamond', fontSize: 40, italic: true, color: '#9f1239', align: 'center', role: 'extraInfo' }),
      L(400, 470, 100, { stroke: '#fb718588', strokeWidth: 1.5 }),
      S('💗', 472, 452, 110),
      L(550, 470, 100, { stroke: '#fb718588', strokeWidth: 1.5 }),
      T("— Amara's family", 620, 600, 380, 60, { fontFamily: 'Caveat', fontSize: 44, fontWeight: 700, color: '#9f1239', role: 'hostName' }),
    ]),
  },
}

const bdayWish: CardTemplate = {
  id: 'tpl-bday-wish', name: 'Mint Birthday Wish', category: 'birthday', style: 'playful', isPro: false,
  design: {
    width: 1050, height: 750,
    front: side(patterned('#ecfdf5', 'dots', '#10b98133'), [
      T('Happy Birthday!', 75, 120, 900, 160, { fontFamily: 'Dancing Script', fontSize: 104, fontWeight: 700, color: '#047857', align: 'center' }),
      T('Wishing you a day filled with love,\ncake & laughter', 150, 300, 750, 110, { fontSize: 30, fontWeight: 500, color: '#065f46', align: 'center', lineHeight: 1.45, role: 'extraInfo' }),
      S('🎂', 150, 430, 190),
      S('🎈', 430, 410, 160, { rotation: -6 }),
      S('🎁', 700, 430, 180, { rotation: 6 }),
      T('— with love, the Khans', 580, 640, 420, 60, { fontFamily: 'Caveat', fontSize: 44, fontWeight: 700, color: '#047857', role: 'hostName' }),
    ]),
  },
}

const congratsLaurel: CardTemplate = {
  id: 'tpl-congrats-laurel', name: 'Congratulations', category: 'greeting', style: 'classic', isPro: false,
  design: {
    width: 1050, height: 750,
    front: side(solid('#fefce8'), [
      S('🏆', 455, 90, 140),
      T('Congratulations!', 75, 260, 900, 140, { fontFamily: 'Playfair Display', fontSize: 96, fontWeight: 700, color: '#a16207', align: 'center' }),
      T('on your well-deserved success', 175, 430, 700, 44, { fontSize: 29, fontWeight: 500, color: '#713f12', align: 'center', role: 'extraInfo' }),
      L(390, 516, 90, { stroke: '#d4a85399', strokeWidth: 1.5 }),
      I('Star', 492, 500, 34, { color: '#d4a853' }),
      L(570, 516, 90, { stroke: '#d4a85399', strokeWidth: 1.5 }),
      T('— the whole team is proud of you', 300, 570, 550, 56, { fontFamily: 'Caveat', fontSize: 42, fontWeight: 700, color: '#854d0e', align: 'center', role: 'hostName' }),
      I('Sparkles', 120, 120, 44, { color: '#d4a853' }),
      I('Sparkles', 886, 120, 44, { color: '#d4a853' }),
    ]),
  },
}

const greetSpring: CardTemplate = {
  id: 'tpl-greet-spring', name: 'Hello Spring', category: 'greeting', style: 'creative', isPro: false,
  design: {
    width: 1000, height: 1000,
    front: side(patterned('#f0fdf4', 'dots', '#22c55e2e'), [
      S('🌷', 140, 120, 140, { rotation: -6 }),
      S('🌼', 740, 130, 130, { rotation: 8 }),
      S('🦋', 760, 640, 140, { rotation: 10 }),
      T('Hello, Spring!', 100, 300, 800, 160, { fontFamily: 'Playfair Display', fontSize: 106, fontWeight: 600, color: '#166534', align: 'center' }),
      T('bloom where you are planted', 150, 490, 700, 84, { fontFamily: 'Caveat', fontSize: 62, fontWeight: 700, color: '#3f6212', align: 'center', role: 'extraInfo' }),
      I('Flower2', 302, 620, 48, { color: '#22c55e' }),
      I('Flower2', 476, 620, 48, { color: '#22c55e' }),
      I('Flower2', 650, 620, 48, { color: '#22c55e' }),
      T('With warmth, Cardly Studio', 250, 780, 500, 44, { fontSize: 23, fontWeight: 400, color: '#4d7c0f', align: 'center', role: 'hostName' }),
    ]),
  },
}

/* ------------------------------ registry ----------------------------- */

export const TEMPLATES: CardTemplate[] = [
  bizNoir, bizIvory, bizWaves, bizEmerald, bizSunset,
  wedBlush, wedEmerald, wedArch,
  bdayConfetti, bdayGlow, bdayWish,
  engRose, corpSummit, gradGold, annGold,
  eidCard, ramadanCard,
  thanksBlush, congratsLaurel, greetSpring,
]

export function getTemplate(id: string): CardTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

/** Deep-clone a template design and give every element a fresh id. */
export function instantiateTemplate(tpl: CardTemplate): { design: CardDesign; business?: BusinessFields } {
  const cloneSide = (s?: CardSide): CardSide | undefined => {
    if (!s) return undefined
    return { background: JSON.parse(JSON.stringify(s.background)), elements: s.elements.map((el) => ({ ...el, id: uid(el.type[0]) })) }
  }
  return {
    design: {
      width: tpl.design.width,
      height: tpl.design.height,
      front: cloneSide(tpl.design.front) as CardSide,
      back: cloneSide(tpl.design.back),
    },
    business: tpl.business ? JSON.parse(JSON.stringify(tpl.business)) : undefined,
  }
}

export function templateOrientation(tpl: CardTemplate): 'landscape' | 'portrait' | 'square' {
  const { width, height } = tpl.design
  if (Math.abs(width - height) < 40) return 'square'
  return width > height ? 'landscape' : 'portrait'
}
