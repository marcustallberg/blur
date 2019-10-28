import {blur, BlurSource} from './modules/blur'
import palettes = require('./modules/palettes.json')

const canvas = <HTMLCanvasElement>document.getElementById('blurCanvas')
const ctx = <CanvasRenderingContext2D>canvas.getContext('2d')

const changeHandler = () => {
  const imageData = ctx.getImageData(0, 0, img.width, img.height)
  const source: BlurSource = {
    imageData,
    pixelSize: Number(pixelsize.value),
    palette: palette.value
  }
  blur(source) 
}

const palette = <HTMLSelectElement>document.getElementById("palette")
palette.addEventListener('change', changeHandler)

const paletteNames: string[] = Object.keys(palettes)
paletteNames.map(paletteName => {
  palette[palette.options.length] = new Option(paletteName, paletteName)
})

const pixelsize = <HTMLSelectElement>document.getElementById("pixelsize")
pixelsize.addEventListener('change', changeHandler)

const img = new Image()

img.addEventListener('load', () => {
  ctx.drawImage(img, 0, 0)
  changeHandler()
}, false)

img.src = `http://localhost:1234/img/david-hasselhoff.jpg?${new Date().getTime()}`