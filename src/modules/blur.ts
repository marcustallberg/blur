export interface BlurSource {
  imageData: ImageData,
  pixelSize: number
}

interface Pixel {
  rgba: Color,
  height: number,
  width: number,
  x: number,
  y: number
}

interface Color {
  red: number,
  green: number,
  blue: number
}

export const blur = (blurSource: BlurSource) => {
  const {imageData, pixelSize} = blurSource
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
        rgba: {red: colorArr[0], green: colorArr[1], blue: colorArr[2]},
        height: blockHeight, 
        width: blockWidth,
        y: pixelSize * row,
        x: pixelSize * col
      }
      averagedPixelArray[averagedPixelArray.length] = pixel
    }
  }
  blurFill(averagedPixelArray)
}

const getRgbValue = (pixel: Pixel, effect: string = 'default') => {
  const {rgba} = pixel
  const {red, green, blue} = rgba
  const loopAmount = pixel.height * pixel.width * 4
  const colorArr: number[] = [0,0,0]
  if(effect === 'default') {
    colorArr[0] = Math.round(red/(loopAmount >> 2))
    colorArr[1] = Math.round(green/(loopAmount >> 2))
    colorArr[2] = Math.round(blue/(loopAmount >> 2))
  }

  return `rgba(${colorArr.join(',')}, 1)`
}

const shader = (pixel: Pixel) => {
  const outputCanvas = <HTMLCanvasElement>document.getElementById('blurOutput')
  const outputContext = <CanvasRenderingContext2D>outputCanvas.getContext('2d')
  const {x, y, width, height} =  pixel 
  outputContext.fillStyle = getRgbValue(pixel)
  outputContext.fillRect(x, y, width, height)
}

const blurFill = (averagedPixelArray: Pixel[]) => averagedPixelArray.forEach(shader)