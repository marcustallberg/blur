const defaultPalette: string[] = [
  '#000000',
  '#FFFFFF',
  '#68372B',
  '#70A4B2',
  '#6F3D86',
  '#588D43',
  '#352879',
  '#B8C76F',
  '#6F4F25',
  '#433900',
  '#9A6759',
  '#444444',
  '#6C6C6C',
  '#9AD284',
  '#6C5EB5',
  '#959595'
]

export type RGB = {
  r: number,
  g: number,
  b: number
}

const hexToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return {
    r: parseInt(result![1], 16),
    g: parseInt(result![2], 16),
    b: parseInt(result![3], 16)
  }
}

export const nearestColor = (needle: RGB, palette: string[] = defaultPalette): string => {
  const {r, g, b} = needle
  let newColor: string = ''
  let minDistanceSq = Infinity
  for (var i = 0; i < palette.length; ++i) {
    const paletteRgb = hexToRgb(palette[i])
    const distanceSq = (
      Math.pow(r - paletteRgb.r, 2) +
      Math.pow(g - paletteRgb.g, 2) +
      Math.pow(b - paletteRgb.b, 2)
    )

    if (distanceSq < minDistanceSq) {
      minDistanceSq = distanceSq;
      newColor = palette[i]
    }
  }

  return newColor
}