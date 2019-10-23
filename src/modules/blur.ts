const pixelSizeLocal = 10
const loopAmount = pixelSizeLocal * pixelSizeLocal * 4

interface Pixel {
  height: number,
  width: number
}

export const blur = (imageData: ImageData, imageWidth: number, imageHeight: number) => {
  const pixels = imageData.data
  console.log("PL",pixels.length)
  console.log(pixels[100])
  const averagedPixelArray = []
  const cols = imageWidth / pixelSizeLocal;
  const rows = imageHeight / pixelSizeLocal;

  let pixelIndex = 0
  for (let col=0;col<cols;col++){
    for (let row=0;row<rows;row++){
      let pixel: Pixel = {height: 0, width: 0}
      pixel.height = Math.min(imageHeight-row*pixelSizeLocal,pixelSizeLocal)

      let redCh = 0 
      let greenCh = 0
      let blueCh = 0
      
      for (let h=0;h<pixel.height;h++){
        pixel.width = Math.min(imageWidth-col*pixelSizeLocal, pixelSizeLocal)
        for (let w=0;w<pixel.width;w++){
          pixelIndex = ((pixelSizeLocal*(row)+h) * imageWidth + (pixelSizeLocal * (col)+w)) * 4
          redCh += pixels[pixelIndex]
          greenCh +=pixels[pixelIndex+1]
          blueCh +=pixels[pixelIndex+2]
        }
      }
        const loopAmount = pixel.height*pixel.width*4
        averagedPixelArray[averagedPixelArray.length]={
                        "r":redCh,
                        "g":greenCh,
                        "b":blueCh,
                        "y":pixelSizeLocal*row,
                        "x":pixelSizeLocal*col,
                        "pixelW":pixel.width,
                        "pixelH":pixel.height,
                        "loopAmount":loopAmount
                    }
                
    }
  }
  blurFill(averagedPixelArray)
}

const getRgbValue = (averagedPixelArray) => {
  const {r,g,b,loopAmount} = averagedPixelArray
  const rgb = {
    r: Math.round(r/(loopAmount >> 2)),
    g: Math.round(g/(loopAmount >> 2)),
    b: Math.round(b/(loopAmount >> 2))
  }
  return rgb
}

const blurFill = (averagedPixelArray) => {
  console.log("blurFill")
  const outputCanvas = <HTMLCanvasElement> document.getElementById('blurOutput')
  const outputContext = outputCanvas.getContext('2d')
  const len = averagedPixelArray.length
  console.log(averagedPixelArray[10])
  for(var i = 0;i<len;i++){
    const {r,g,b,y,x,pixelW, pixelH, loopAmount} = averagedPixelArray[i]
    const rgbValue = getRgbValue(averagedPixelArray[i])
    outputContext.fillStyle = "rgba("+rgbValue.r+", "+rgbValue.g+", "+rgbValue.b+", 1)"
    outputContext.fillRect(x,y,pixelW,pixelH)
  }

  
  //outputContext.fillStyle = "rgba(100, 100, 100, 1)"
  //outputContext.fillRect(0,0,10,10)
  //this.context.fillStyle = "rgba("+rgbValue.r+", "+rgbValue.g+", "+rgbValue.b+", 1)";
  //          this.context.fillRect(x,y,pixelW,pixelH);
}