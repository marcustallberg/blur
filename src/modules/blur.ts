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
  blue: number,
  alpha: number
}

export const blur = (imageData: ImageData, imageWidth: number, imageHeight: number, pixelSizeLocal: number) => {
  const pixels = imageData.data
  const averagedPixelArray = []
  const cols = imageWidth / pixelSizeLocal
  const rows = imageHeight / pixelSizeLocal
  let pixelIndex = 0
  for (let col=0;col<cols;col++){
    for (let row=0;row<rows;row++){
      let rgba: Color = {red:0, green:0, blue:0, alpha:0}
      
      const blockHeight = Math.min(imageHeight-row * pixelSizeLocal,pixelSizeLocal)
      const blockWidth = Math.min(imageWidth-col * pixelSizeLocal, pixelSizeLocal)

      for (let h=0;h<blockHeight;h++){
        
        for (let w=0;w<blockWidth;w++){
          pixelIndex = ((pixelSizeLocal*(row)+h) * imageWidth + (pixelSizeLocal * (col)+w)) * 4
          rgba.red += pixels[pixelIndex]
          rgba.green +=pixels[pixelIndex+1]
          rgba.blue +=pixels[pixelIndex+2]
        }
      }
      const pixel: Pixel = {
        rgba,
        height: blockHeight, 
        width: blockWidth,
        y: pixelSizeLocal*row,
        x: pixelSizeLocal*col,
      }
      averagedPixelArray[averagedPixelArray.length] = pixel
    }
  }
  blurFill(averagedPixelArray)
}

const getRgbValue = (pixel: Pixel) => {
  const {rgba} = pixel
  const loopAmount = pixel.height*pixel.width*4

  const rgb = {
    r: Math.round(rgba.red/(loopAmount >> 2)),
    g: Math.round(rgba.green/(loopAmount >> 2)),
    b: Math.round(rgba.blue/(loopAmount >> 2))
  }
  return rgb
}

const blurFill = (averagedPixelArray: Pixel[]) => {
  const outputCanvas = <HTMLCanvasElement>document.getElementById('blurOutput')
  const outputContext = <CanvasRenderingContext2D>outputCanvas.getContext('2d')
  const len = averagedPixelArray.length
  console.log("B LEN", len)
  for(var i = 0;i<len;i++){
    const pixel:Pixel = averagedPixelArray[i]
    const rgbValue = getRgbValue(pixel)
    outputContext.fillStyle = "rgba("+rgbValue.r+", "+rgbValue.g+", "+rgbValue.b+", 1)"
    outputContext.fillRect(pixel.x, pixel.y, pixel.width, pixel.height)
  }
}