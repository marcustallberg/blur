import {blur} from './modules/blur'


const canvas = <HTMLCanvasElement>document.getElementById('blurCanvas')
const ctx = <CanvasRenderingContext2D>canvas.getContext('2d')

const img = new Image()

img.addEventListener('load', () => {
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, img.width, img.height)

  blur(imageData, img.width, img.height, Math.floor(Math.random()*50))

}, false)

img.src = `http://localhost:1234/img/david-hasselhoff.jpg?${new Date().getTime()}`