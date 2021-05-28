import {blur, BlurSource} from './modules/blur'
import palettes = require('./modules/palettes.json')

const canvasInput = <HTMLCanvasElement>document.getElementById('blurCanvas')
const canvasOutput = <HTMLCanvasElement>document.getElementById('blurOutput')
const ctx = <CanvasRenderingContext2D>canvasInput.getContext('2d')

const changeHandler = (img:HTMLImageElement) => {
  const imageData = ctx.getImageData(0, 0, img.width, img.height)
  const source: BlurSource = {
    imageData,
    pixelSize: Number(pixelsize.value),
    palette: palette.value,
    outputCanvasId: 'blurOutput'
  }
  blur(source) 
}

const downloadImage = (e:Event) => {
  const current: HTMLLinkElement = e.currentTarget as HTMLLinkElement
  
  if(e) {
    const imageData = canvasOutput.toDataURL("image/png")
    
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
    ctx.clearRect(0, 0, canvasInput.width, canvasInput.height);
    const img: HTMLImageElement = new Image()

    img.onload = function(){
      console.log(img.width)
      const hRatio = canvasInput.width / img.width
      const vRatio = canvasInput.height / img.height
      const ratio  = Math.min ( hRatio, vRatio )
      setCanvasSize(img.width*ratio, img.height*ratio)
      ctx.drawImage(img, 0,0, img.width, img.height, 0,0,img.width*ratio, img.height*ratio)
      changeHandler(img)
    }
    img.src = reader.result as string
  }
}


// click, change handlers
const palette = <HTMLSelectElement>document.getElementById("palette")
palette.addEventListener('change', changeHandler)

const blurUpload = <HTMLFormElement>document.getElementById('blurUpload')
blurUpload.addEventListener('change', uploadImage)

const blurDownload = <HTMLElement>document.getElementById('blurDownload')
blurDownload.addEventListener('click', downloadImage)

const pixelsize = <HTMLSelectElement>document.getElementById("pixelsize")
pixelsize.addEventListener('change', changeHandler)

//populate palette-dropdown
const paletteNames: string[] = Object.keys(palettes)
paletteNames.map(paletteName => {
  palette[palette.options.length] = new Option(paletteName, paletteName)
})

const setCanvasSize = (imgWidth: number, imgHeight: number) => {
  const canvasWidth = Math.min(imgWidth, window.innerWidth)
  const canvasHeight = Math.min(imgHeight, window.innerWidth * imgHeight /imgWidth)
  canvasInput.width = canvasWidth
  canvasInput.height = canvasHeight
  canvasOutput.width = canvasWidth
  canvasOutput.height = canvasHeight
  return {
    'canvasWidth': canvasWidth,
    'canvasHeight': canvasHeight
  }
}


const img = new Image()

img.addEventListener('load', () => {

  const {canvasWidth, canvasHeight} = setCanvasSize(img.width, img.height)
  ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight )
  changeHandler()
}, false)

img.src = '/img/david-hasselhoff.jpg'