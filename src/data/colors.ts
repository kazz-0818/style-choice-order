import type { ColorOption } from '../types/bag'

export const COLORS: ColorOption[] = [
  { id: 'black', name: 'Black', hex: '#111111', category: 'basic' },
  { id: 'white', name: 'White', hex: '#f8f6f2', category: 'basic' },
  { id: 'ivory', name: 'Ivory', hex: '#f3ece0', category: 'neutral' },
  { id: 'beige', name: 'Beige', hex: '#d4c4a8', category: 'neutral' },
  { id: 'brown', name: 'Brown', hex: '#8b6f4e', category: 'neutral' },
  { id: 'dark-brown', name: 'Dark Brown', hex: '#4a3428', category: 'neutral' },
  { id: 'red', name: 'Red', hex: '#d3202b', category: 'accent' },
  { id: 'burgundy', name: 'Burgundy', hex: '#8c1730', category: 'accent' },
  { id: 'navy', name: 'Navy', hex: '#1e2a3a', category: 'basic' },
  { id: 'khaki', name: 'Khaki', hex: '#9a8f6e', category: 'neutral' },
  { id: 'gray', name: 'Gray', hex: '#7a7570', category: 'neutral' },
  { id: 'pink', name: 'Pink', hex: '#ee6aa7', category: 'accent' },
  { id: 'orange', name: 'Orange', hex: '#f28a1c', category: 'accent' },
  { id: 'yellow', name: 'Yellow', hex: '#f8cf1f', category: 'accent' },
  { id: 'green', name: 'Green', hex: '#1f9a52', category: 'accent' },
  { id: 'blue', name: 'Blue', hex: '#1f5fc0', category: 'accent' },
  { id: 'sky', name: 'Sky Blue', hex: '#3ea8e5', category: 'accent' },
  { id: 'purple', name: 'Purple', hex: '#6a3fb8', category: 'accent' },
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
