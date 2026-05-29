import type { ColorOption } from '../types/bag'

export const COLORS: ColorOption[] = [
  { id: 'black', name: 'Black', hex: '#111111', category: 'basic' },
  { id: 'white', name: 'White', hex: '#f8f6f2', category: 'basic' },
  { id: 'ivory', name: 'Ivory', hex: '#f3ece0', category: 'neutral' },
  { id: 'beige', name: 'Beige', hex: '#d4c4a8', category: 'neutral' },
  { id: 'brown', name: 'Brown', hex: '#8b6f4e', category: 'neutral' },
  { id: 'dark-brown', name: 'Dark Brown', hex: '#4a3428', category: 'neutral' },
  { id: 'red', name: 'Red', hex: '#8b3a3a', category: 'accent' },
  { id: 'burgundy', name: 'Burgundy', hex: '#5c2a35', category: 'accent' },
  { id: 'navy', name: 'Navy', hex: '#1e2a3a', category: 'basic' },
  { id: 'khaki', name: 'Khaki', hex: '#9a8f6e', category: 'neutral' },
  { id: 'gray', name: 'Gray', hex: '#7a7570', category: 'neutral' },
  { id: 'pink', name: 'Pink', hex: '#c9a8a0', category: 'accent' },
  { id: 'orange', name: 'Orange', hex: '#c47850', category: 'accent' },
  { id: 'yellow', name: 'Yellow', hex: '#d4bc7a', category: 'accent' },
  { id: 'green', name: 'Green', hex: '#4a5c48', category: 'accent' },
  { id: 'blue', name: 'Blue', hex: '#4a6078', category: 'accent' },
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
