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

const downloadImage = (e:Event) => {
  const current: HTMLLinkElement = e.currentTarget as HTMLLinkElement
  
  if(e) {
    const canvas = <HTMLCanvasElement>document.getElementById('blurOutput')
    const imageData = canvas.toDataURL("image/png")
    
    current.href = imageData
    current.setAttribute('download', 'blur_image.png')
  }
}

const uploadImage = (e:Event) => {
  e.preventDefault()
  const reader: FileReader = new FileReader()
  const target = e.target as HTMLInputElement
  if(target.files) {
    const files: FileList = target.files
    reader.readAsDataURL(files[0])
  }
  
  reader.onload = function(event: Event){

    var img: HTMLImageElement = new Image()
    img.onload = function(){
      ctx.drawImage(img, 0, 0, 300, 300 * img.height /img.width )
    }
    img.src = reader.result as string
  }
}

const palette = <HTMLSelectElement>document.getElementById("palette")
palette.addEventListener('change', changeHandler)


const blurUpload = <HTMLFormElement>document.getElementById('blurUpload')
blurUpload.addEventListener('change', uploadImage)

const blurDownload = <HTMLElement>document.getElementById('blurDownload')
blurDownload.addEventListener('click', downloadImage)

const paletteNames: string[] = Object.keys(palettes)
paletteNames.map(paletteName => {
  palette[palette.options.length] = new Option(paletteName, paletteName)
})

const pixelsize = <HTMLSelectElement>document.getElementById("pixelsize")
pixelsize.addEventListener('change', changeHandler)

const img = new Image()

img.addEventListener('load', () => {

  ctx.drawImage(img, 0, 0, 300, 300 * img.height /img.width )
  changeHandler()
}, false)

img.src = '/img/david-hasselhoff.jpg'