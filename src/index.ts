import {blur, BlurSource} from './modules/blur'

const canvas = <HTMLCanvasElement>document.getElementById('blurCanvas')
const ctx = <CanvasRenderingContext2D>canvas.getContext('2d')

const img = new Image()

img.addEventListener('load', () => {
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, img.width, img.height)
  const source: BlurSource = {
    imageData,
    pixelSize: 10
  }

  blur(source) 



}, false)

img.src = `http://localhost:1234/img/david-hasselhoff.jpg?${new Date().getTime()}`