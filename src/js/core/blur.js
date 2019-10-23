const blur = (settings) => {
  this.pixelSize = settings.pixelSize;
  this.uploadedImage = null;
  this.imageData=null;
  this.blurStyle = null;
  this.mouseBlur = false;
  this.uiInited = false;
  this.optimized = true;
  this.revertOnBlur = true;
  this.pointRegister = [];
  this.updatePoint = false;
  this.scaleImageToFit = true;
  this.pixelCollection = [];
  this.dropZone = document.getElementById(settings.dropAreaId);
  this.targetCanvas = document.getElementById("uploadedPic");
  this.canvasSupport = null;
  this.fileReaderSupport = null;
  this.blurImageW = null;
  this.blurImageH = null;
  this.imgurlAPIkey ="2b1e392999deaf5f7cac09a738aa3ae4";
  this.asciiCharMap = " .:-=+*#%@";
  this.asciiCharMapArr = this.asciiCharMap.split("");
  this.asciiCharMapArr.reverse();
  //simple check for canvas support
  if (this.targetCanvas.getContext){
    this.canvasSupport = true;
    this.context = this.targetCanvas.getContext('2d');
    init(this.dropZone)
  }
  else{
    this.canvasSupport = false;
    document.getElementById("warningCanvas").style["display"] = "block";
    this.dropZone.style["display"] = "none";
  }
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    this.fileReaderSupport=true;
  } 
  else {
    this.fileReaderSupport=false;
    document.getElementById("warningFileApi").style["display"] = "block";
    this.dropZone.style["display"] = "none";
    if(this.canvasSupport){
        document.getElementById("uploadForm").style["display"] = "block";
    }
  }
}

const init = (dropZone) => {
    dropZone.addEventListener("dragover", onDragHandler, false);
    dropZone.addEventListener("dragleave", onDragHandler, false);
    dropZone.addEventListener("drop", onDrop.bind(this), false);
}

const onDragHandler = (e) => {

    e.preventDefault();
    
    if(e.type==="dragover"){
        document.body.classList.add('active');
    }
    else{
        document.body.classList.remove('active');
    }
}

const onDrop = (e) => {
    var ref = this;
    e.preventDefault();
    var files = e.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {

        var reader = new FileReader();
        var f = files[i];

        reader.onload = (function(theFile) {
            return function(e) {
                var img = new Image();
                img.onload = function(){
                    imgLoaded(img);
                };
                img.src = e.target.result;
            };
        })(f);
        reader.readAsDataURL(f);
    }
}

const imgLoaded = (uploadedImage) => {
    document.body.classList.remove('active');
    this.dropZone.style["display"] = "none";
    document.getElementById("uploadForm").style["display"] = "none";

    this.uploadedImage = uploadedImage;

    this.blurImageW = this.uploadedImage.width;
    this.blurImageH = this.uploadedImage.height;
    if(this.scaleImageToFit){
        if((this.blurImageW>window.innerWidth)||(this.blurImageH>window.innerHeight)){

            var imageRatio = Math.min( window.innerWidth / this.blurImageW, window.innerHeight/ this.blurImageH );
            this.blurImageW = imageRatio * this.blurImageW;
            this.blurImageH = imageRatio * this.blurImageH;
            document.getElementById("scaleImage").disabled =false;

        }
        else{
            document.getElementById("scaleImage").disabled = true;
        }
    }
    this.targetCanvas.style["width"] = this.targetCanvas.width = this.blurImageW;
    this.targetCanvas.style["height"]  = this.targetCanvas.height = this.blurImageH;
    this.context.drawImage(uploadedImage,0,0,this.blurImageW,this.blurImageH);

    this.targetCanvas.style["display"] = "block";
    setPlacement();
    if(!this.uiInited){
        this.initUI();
    }
    else{
        document.getElementById("blurAll").style["display"] = "block";
    }
}


module.exports = blur