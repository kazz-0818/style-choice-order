import type { ColorOption } from '../types/bag'

export const COLORS: ColorOption[] = [
  { id: 'black', name: 'Black', hex: '#111111', category: 'basic' },
  { id: 'white', name: 'White', hex: '#f8f6f2', category: 'basic' },
  { id: 'ivory', name: 'Ivory', hex: '#f3ece0', category: 'neutral' },
  { id: 'beige', name: 'Beige', hex: '#d4c4a8', category: 'neutral' },
  { id: 'greige', name: 'Greige', hex: '#b7a99a', category: 'neutral' },
  { id: 'brown', name: 'Brown', hex: '#8b6f4e', category: 'neutral' },
  { id: 'dark-brown', name: 'Dark Brown', hex: '#4a3428', category: 'neutral' },
  { id: 'red', name: 'Red', hex: '#ee0b1a', category: 'accent' },
  { id: 'burgundy', name: 'Burgundy', hex: '#b40d32', category: 'accent' },
  { id: 'navy', name: 'Navy', hex: '#1e2a3a', category: 'basic' },
  { id: 'indigo', name: 'Indigo', hex: '#163a75', category: 'basic' },
  { id: 'khaki', name: 'Khaki', hex: '#9a8f6e', category: 'neutral' },
  { id: 'gray', name: 'Gray', hex: '#7a7570', category: 'neutral' },
  { id: 'pink', name: 'Pink', hex: '#ff2f7a', category: 'accent' },
  { id: 'orange', name: 'Orange', hex: '#ff4d00', category: 'accent' },
  { id: 'yellow', name: 'Yellow', hex: '#ffc400', category: 'accent' },
  { id: 'green', name: 'Green', hex: '#00b53c', category: 'accent' },
  { id: 'dark-green', name: 'Dark Green', hex: '#0f5c38', category: 'accent' },
  { id: 'blue', name: 'Blue', hex: '#0054e6', category: 'accent' },
  { id: 'sky', name: 'Sky Blue', hex: '#00b4f0', category: 'accent' },
  { id: 'purple', name: 'Purple', hex: '#7a1aff', category: 'accent' },
  { id: 'gold', name: 'Gold', hex: '#b8956a', category: 'accent' },
]

export const colorMap = Object.fromEntries(
  COLORS.map((c) => [c.id, c]),
) as Record<string, ColorOption>

export function getColorHex(colorId: string): string {
  return colorMap[colorId]?.hex ?? '#111111'
}

export function getColorName(colorId: string): string {
  return colorMap[colorId]?.name ?? colorId
}
