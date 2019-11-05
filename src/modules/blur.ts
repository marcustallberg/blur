import {nearestColor, RGB} from './nearestColor'
// HEX codes originate from here: http://unusedino.de/ec64/technical/misc/vic656x/colors/ and here https://lospec.com/palette-list/
import palettes = require('./palettes.json')
export type Palettes = keyof typeof palettes
export type Effects = keyof typeof effects

const verifyPalette = (s: string): s is Palettes => palettes[s as Palettes] !== undefined
const verifyEffect = (s: String): s is Effects => effects[s as Effects] !== undefined 

export interface BlurSource {
  imageData: ImageData,
  pixelSize: number,
  palette: string,
  outputCanvasId: string
}

interface Pixel {
  rgb: RGB,
  height: number,
  width: number,
  x: number,
  y: number
}



export const blur = (blurSource: BlurSource) => {
  const {imageData, pixelSize, palette, outputCanvasId} = blurSource
  const {width, height, data} = imageData
  const averagedPixelArray = []
  const cols = width / pixelSize
  const rows = height / pixelSize
  let pixelIndex = 0
  for (let col=0; col<cols; col++){
    const blockWidth = Math.min(width-col * pixelSize, pixelSize)

    for (let row=0; row<rows; row++){
      const colorArr: number[] = [0,0,0]

      const blockHeight = Math.min(height-row * pixelSize, pixelSize)
      
      for (let h=0;h<blockHeight;h++){
        
        for (let w=0;w<blockWidth;w++){
          pixelIndex = ((pixelSize*(row)+h) * width + (pixelSize * (col)+w)) * 4
          for (let c=0; c<colorArr.length; c++) {
            colorArr[c] += data[pixelIndex + c]
          }
        }
      }
      const pixel: Pixel = {
        rgb: {
          r: colorArr[0], 
          g: colorArr[1], 
          b: colorArr[2]
        },
        height: blockHeight, 
        width: blockWidth,
        y: pixelSize * row,
        x: pixelSize * col
      }
      averagedPixelArray[averagedPixelArray.length] = pixel
    }
  }

  blurFill(averagedPixelArray, palette, outputCanvasId)
}


const effects = {
  'desaturate' : function(colorArr: number[], palette: string){
    const desaturated = Math.round( colorArr[0] * 0.3 + colorArr[1] * 0.59 + colorArr[2] * 0.11)
    return `rgb(${desaturated}, ${desaturated}, ${desaturated})`
  },
  'invert' : function(colorArr: number[], palette: string) {
    const _colorArr = [...colorArr]
    _colorArr[0] = Math.abs(_colorArr[0]-255)
    _colorArr[1] = Math.abs(_colorArr[1]-255)
    _colorArr[2] = Math.abs(_colorArr[2]-255)
    return `rgb(${_colorArr.join(',')})`
  },
  'palette' : function(colorArr: number[], palette: string) {
    if(verifyPalette(palette)) {
      const _palette = palettes[palette]
      const _clr: RGB = {r: colorArr[0], g: colorArr[1], b: colorArr[2] }
      return nearestColor(_clr, _palette)
    } else {
      return ''
    }
  }
}

const getColor = (pixel: Pixel, palette: string = 'default') => {

  const {rgb} = pixel
  const {r, g, b} = rgb
  const loopAmount = pixel.height * pixel.width * 4
  const colorArr: number[] = [0,0,0]
  colorArr[0] = Math.round(r/(loopAmount >> 2))
  colorArr[1] = Math.round(g/(loopAmount >> 2))
  colorArr[2] = Math.round(b/(loopAmount >> 2))

  if(verifyPalette(palette)) {
    return effects['palette'](colorArr, palette)
  } else if (verifyEffect(palette)) {
    return effects[palette](colorArr, palette)
  }

  return `rgb(${colorArr.join(',')})`
}

const blurFill = (averagedPixelArray: Pixel[], palette: string, outputCanvasId: string) => {
  const outputCanvas = <HTMLCanvasElement>document.getElementById(outputCanvasId)
  const outputContext = <CanvasRenderingContext2D>outputCanvas.getContext('2d')
  averagedPixelArray.forEach(function(pixel){
    const {x, y, width, height} =  pixel
    outputContext.fillStyle = getColor(pixel, palette)
    outputContext.fillRect(x, y, width, height)
  })
}