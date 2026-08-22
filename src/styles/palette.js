import { parse } from 'yaml'
import paletteSource from '../../og-colors.yaml?raw'

const palette = parse(paletteSource)
const colorNames = ['black1', 'black2', 'white', 'gold1', 'gold2']
const hexColorPattern = /^#[0-9a-f]{6}$/i

for (const colorName of colorNames) {
  if (!hexColorPattern.test(palette[colorName])) {
    throw new Error(`Palette color "${colorName}" must be a six-digit hex color.`)
  }
}

export const paletteVariables = Object.freeze({
  '--color-black-1': palette.black1,
  '--color-black-2': palette.black2,
  '--color-white': palette.white,
  '--color-gold-1': palette.gold1,
  '--color-gold-2': palette.gold2,
})
