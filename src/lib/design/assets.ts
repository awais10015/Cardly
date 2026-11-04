/* Curated lucide icons + emoji sticker sets for the editor panels */

export const PICKER_ICONS: { name: string; group: string }[] = [
  // celebration & occasions
  { name: 'Heart', group: 'Occasions' },
  { name: 'HeartHandshake', group: 'Occasions' },
  { name: 'Sparkles', group: 'Occasions' },
  { name: 'Star', group: 'Occasions' },
  { name: 'Cake', group: 'Occasions' },
  { name: 'Gift', group: 'Occasions' },
  { name: 'PartyPopper', group: 'Occasions' },
  { name: 'Gem', group: 'Occasions' },
  { name: 'Crown', group: 'Occasions' },
  { name: 'Trophy', group: 'Occasions' },
  { name: 'Award', group: 'Occasions' },
  { name: 'GraduationCap', group: 'Occasions' },
  { name: 'CircleDot', group: 'Occasions' },
  // nature & deco
  { name: 'Flower2', group: 'Decor' },
  { name: 'Leaf', group: 'Decor' },
  { name: 'Sun', group: 'Decor' },
  { name: 'Moon', group: 'Decor' },
  { name: 'MoonStar', group: 'Decor' },
  { name: 'CloudSun', group: 'Decor' },
  { name: 'Snowflake', group: 'Decor' },
  { name: 'Feather', group: 'Decor' },
  { name: 'Cherry', group: 'Decor' },
  { name: 'Bird', group: 'Decor' },
  { name: 'Rocket', group: 'Decor' },
  { name: 'Flame', group: 'Decor' },
  { name: 'Diamond', group: 'Decor' },
  { name: 'Music', group: 'Decor' },
  { name: 'Camera', group: 'Decor' },
  { name: 'Bell', group: 'Decor' },
  { name: 'Ticket', group: 'Decor' },
  { name: 'Palmtree', group: 'Decor' },
  // business & contact
  { name: 'Briefcase', group: 'Business' },
  { name: 'Building2', group: 'Business' },
  { name: 'Phone', group: 'Business' },
  { name: 'Smartphone', group: 'Business' },
  { name: 'Mail', group: 'Business' },
  { name: 'Globe', group: 'Business' },
  { name: 'MapPin', group: 'Business' },
  { name: 'Clock', group: 'Business' },
  { name: 'CalendarDays', group: 'Business' },
  { name: 'Users', group: 'Business' },
  { name: 'User', group: 'Business' },
  { name: 'MessageCircle', group: 'Business' },
  { name: 'Wifi', group: 'Business' },
  { name: 'QrCode', group: 'Business' },
  { name: 'Link', group: 'Business' },
  { name: 'AtSign', group: 'Business' },
  { name: 'Send', group: 'Business' },
  { name: 'Mic', group: 'Business' },
  { name: 'UtensilsCrossed', group: 'Business' },
  { name: 'Coffee', group: 'Business' },
  { name: 'Car', group: 'Business' },
  { name: 'Plane', group: 'Business' },
  // social
  { name: 'Instagram', group: 'Social' },
  { name: 'Facebook', group: 'Social' },
  { name: 'Twitter', group: 'Social' },
  { name: 'Linkedin', group: 'Social' },
  { name: 'Github', group: 'Social' },
  { name: 'Youtube', group: 'Social' },
  { name: 'Twitch', group: 'Social' },
  { name: 'Slack', group: 'Social' },
]

export const STICKER_SETS: { name: string; emojis: string[] }[] = [
  { name: 'Celebration', emojis: ['🎉', '🥳', '🎈', '🎊', '🎁', '🎂', '🪅', '🎇', '✨', '🍾'] },
  { name: 'Love & Wedding', emojis: ['💍', '💐', '🌹', '🤵', '👰', '🤍', '💗', '🦋', '🕊️', '🥂'] },
  { name: 'Eid & Ramadan', emojis: ['🌙', '⭐', '🕌', '🤲', '📿', '🏮', '☪️', '💫', '✨', '🌟'] },
  { name: 'Faces', emojis: ['😊', '🥰', '😍', '🤩', '😂', '😎', '🤗', '😇', '🫶', '👋'] },
  { name: 'Nature', emojis: ['🌸', '🌼', '🌻', '🍃', '🌈', '☀️', '🌙', '🌊', '🦄', '🐝'] },
  { name: 'Food & Fun', emojis: ['🍰', '🧁', '☕', '🍫', '🍪', '🍕', '🎸', '⚽', '🎯', '🚀'] },
]

export const TEXT_PRESETS: {
  name: string
  preview: React.CSSProperties
  style: Partial<{
    fontFamily: string
    fontSize: number
    fontWeight: number
    letterSpacing: number
    uppercase: boolean
    italic: boolean
  }>
}[] = [
  {
    name: 'Heading',
    preview: { fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15 },
    style: { fontFamily: 'Playfair Display', fontSize: 64, fontWeight: 700, letterSpacing: 0 },
  },
  {
    name: 'Elegant Script',
    preview: { fontFamily: "'Great Vibes', cursive", fontSize: 16 },
    style: { fontFamily: 'Great Vibes', fontSize: 72, fontWeight: 400, letterSpacing: 0 },
  },
  {
    name: 'Subheading',
    preview: { fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
    style: { fontFamily: 'Inter', fontSize: 30, fontWeight: 600, letterSpacing: 4, uppercase: true },
  },
  {
    name: 'Display',
    preview: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1 },
    style: { fontFamily: 'Bebas Neue', fontSize: 90, fontWeight: 400, letterSpacing: 2 },
  },
  {
    name: 'Handwritten',
    preview: { fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: 14 },
    style: { fontFamily: 'Caveat', fontSize: 54, fontWeight: 700, letterSpacing: 0 },
  },
  {
    name: 'Body',
    preview: { fontFamily: "'Inter', sans-serif", fontSize: 10 },
    style: { fontFamily: 'Inter', fontSize: 24, fontWeight: 400, letterSpacing: 0 },
  },
]

export const GRADIENT_PRESETS: { from: string; to: string; angle: number; name: string }[] = [
  { name: 'Violet Dream', from: '#7c3aed', to: '#db2777', angle: 135 },
  { name: 'Sunset', from: '#f97316', to: '#ec4899', angle: 120 },
  { name: 'Emerald', from: '#059669', to: '#0f766e', angle: 150 },
  { name: 'Golden', from: '#f59e0b', to: '#b45309', angle: 130 },
  { name: 'Midnight', from: '#0f172a', to: '#334155', angle: 160 },
  { name: 'Rose Quartz', from: '#fecdd3', to: '#fda4af', angle: 110 },
  { name: 'Ocean', from: '#0ea5e9', to: '#6366f1', angle: 135 },
  { name: 'Royal', from: '#312e81', to: '#7c3aed', angle: 140 },
  { name: 'Mint', from: '#a7f3d0', to: '#34d399', angle: 120 },
  { name: 'Peach', from: '#fde68a', to: '#fca5a5', angle: 115 },
  { name: 'Plum', from: '#4c1d95', to: '#831843', angle: 145 },
  { name: 'Champagne', from: '#f5f0e6', to: '#e7d8c9', angle: 130 },
]

export const SOLID_PRESETS = [
  '#ffffff', '#faf7f2', '#fdf2f8', '#fefce8', '#f0fdf4', '#ecfeff', '#f5f3ff', '#fff7ed',
  '#0f172a', '#1e1b4b', '#134e4a', '#3b0764', '#4c0519', '#422006', '#052e16', '#082f49',
  '#7c3aed', '#db2777', '#e11d48', '#ea580c', '#16a34a', '#0891b2', '#f59e0b', '#64748b',
]
