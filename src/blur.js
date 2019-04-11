//bind polyfill

if (!('bind' in Function.prototype)) {
    Function.prototype.bind= function(owner) {
        var that= this;
        var args= Array.prototype.slice.call(arguments, 1);
        return function() {
            return that.apply(owner,
                args.length===0? arguments : arguments.length===0? args :
                args.concat(Array.prototype.slice.call(arguments, 0))
            );
        };
    };
}

function Blur(settings) {
	this.pixelSize = settings.pixelSize;
	this.uploadedImage = null;
	this.imageData=null;
	this.blurStyle = null;
	this.mouseBlur = false;
	this.uiInited = false;
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
		this.init();
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
	}
}

Blur.prototype.init = function() {
	this.dropZone.addEventListener("dragover",this.onDragHandler, false);
	this.dropZone.addEventListener("dragleave",this.onDragHandler, false);
	this.dropZone.addEventListener("drop",this.onDrop.bind(this), false);
};

Blur.prototype.initUI = function() {
	document.getElementById("saveToimgurl").addEventListener("click",this.uploadToimgurl.bind(this),false);
	document.getElementById("saveImage").addEventListener("click",this.saveImage.bind(this),false);
	document.getElementById("blurAll").addEventListener("click",this.blurAll.bind(this),false);
	document.getElementById("revertImage").addEventListener("click",this.revertToOriginal.bind(this),false);
	document.getElementById("reset").addEventListener("click",this.reset.bind(this),false);
	document.getElementById("blurAll").style["display"] = "block";
	document.getElementById("settings").style["display"] = "block";
	this.uiInited=true;
};

Blur.prototype.reset = function(e) {
	e.preventDefault();
	this.context.clearRect(0,0,this.blurImageW,this.blurImageH);
	//this.targetCanvas.style["visibility"] = "hidden";
	this.mouseBlur = false;
	this.targetCanvas.style["display"] = "none";
	document.getElementById("blurAll").style["display"] = "none";
	document.getElementById("mouseBlur").checked = false;
	document.getElementById("scaleImage").checked = false;
	if(this.fileReaderSupport){
		this.dropZone.style["display"] = "block";
	}
	else{
		document.getElementById("uploadForm").style["display"] = "block";
	}
	setPlacement();
};

Blur.prototype.uploadToimgurl = function(e){
	e.preventDefault();
	var ref = this;
	var img;
    try {
        img = this.targetCanvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    } catch(error) {
        img = this.targetCanvas.toDataURL().split(',')[1];
    }
    var w = window.open();
    w.document.write('Uploading...');
    $.ajax({
        url: 'http://api.imgur.com/2/upload.json',
        type: 'POST',
        data: {
            type: 'base64',
            key: ref.imgurlAPIkey,
            name: 'blur.jpg',
            title: 'Image created by http://www.blur.fi',
            caption: 'Pixelate your images in your browser',
            image: img
        },
        dataType: 'json'
    }).success(function(data) {
        w.location.href = data['upload']['links']['imgur_page'];
        $.ajax( { url: "http://blur.fi/php/bridge.php?url=https://api.mongolab.com/api/1/databases/blur_fi_images/collections/gallery",
          data: JSON.stringify( { "data":data.upload } ),
          type: "POST",
          contentType: "application/json",
          success:function(){}
	});
         
    }).error(function() {
        alert('Could not reach api.imgur.com. Sorry :(');
        w.close();
    });
};

Blur.prototype.setPixelSize = function(pixelSize) {
	this.pixelSize = pixelSize;
	this.pointRegister = [];
	//this.blurAll();
};

Blur.prototype.setBlurStyle = function(blurStyle) {
	this.blurStyle = blurStyle;
	this.pointRegister = [];
	//this.blurAll();
};

Blur.prototype.scaleToFit = function(action) {
	this.scaleImageToFit = action;
	this.imgLoaded(this.uploadedImage);
};

Blur.prototype.blurWithMouse = function(action) {
	this.mouseBlur = action;
	if(this.mouseBlur){
		this.targetCanvas.classList.add("mouseblur");
	}
	else{
		this.targetCanvas.classList.remove("mouseblur");
	}
	this.targetCanvas.addEventListener("mousedown",this.mousepresshandler.bind(this),false);
	window.addEventListener("mouseup",this.mousepresshandler.bind(this),false);
	this.targetCanvas.addEventListener("mousemove",this.mousemovehandler.bind(this),false);
};

Blur.prototype.onDragHandler = function(e){

	e.preventDefault();
	
	if(e.type==="dragover"){
		document.body.classList.add('active');
	}
	else{
		document.body.classList.remove('active');
	}
};

Blur.prototype.onDrop = function(e) {
	var ref = this;
	e.preventDefault();
	var files = e.dataTransfer.files;
	for (var i = 0; i < files.length; i++) {

		var reader = new FileReader();
        var f = files[i];

        reader.onload = (function() {
			return function(e) {
				var img = new Image();
				img.onload = function(){
					ref.imgLoaded(img);
				};
				img.src = e.target.result;
			};
		})(f);
		reader.readAsDataURL(f);
	}
	
};

Blur.prototype.revertToOriginal = function(e) {
	if(e){
		e.preventDefault();
	}
	this.context.clearRect(0,0,this.blurImageW,this.blurImageH);
	this.context.drawImage(this.uploadedImage,0,0,this.blurImageW,this.blurImageH);
};

Blur.prototype.mousepresshandler = function(e){
	e.preventDefault();
	this.targetCanvas.style.cursor = e.type==="mousedown" ? "pointer":"default";
	this.updatePoint = e.type==="mousedown" ? true:false;
};

Blur.prototype.mousemovehandler = function(e){
	
	if(this.updatePoint){
		this.blurCoords(e.pageX,e.pageY);
	}
	if(this.pixelCollection.length>0){
		this.blurBlock();
	}
	if((!this.updatePoint)&&(this.pixelCollection.length===0)){
		this.targetCanvas.removeEventListener("mousemove",this.mousemovehandler.bind(this),false);
	}
};

Blur.prototype.imgLoaded = function(uploadedImage) {
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
};

Blur.prototype.saveImage = function(e) {
	e.preventDefault();
	var strDataURI = this.context.canvas.toDataURL("image/png");
	var imageW = 175;
	var imageH = Math.floor(imageW*(this.targetCanvas.height/this.targetCanvas.width));
	$("#savedImage").html("<h5>RIGHT CLICK ON WINDOWS OR CTRL-CLICK ON MAC TO SAVE IMAGE. ON CHROME YOU CAN ALSO DRAG YOUR IMAGE TO YOUR DESKTOP</h5><br/><img width="+imageW+" height="+imageH+" title='Save image' draggable='true' src='"+strDataURI+"'/>");
	$("#savedImage").slideDown(200);
};

Blur.prototype.blurAll = function(e) {

	e.preventDefault();
	if(this.revertOnBlur){
		this.revertToOriginal();
	}
	var loopAmount, startDate, pixels, imgd, h, w, col, row, ref,pixelSizeLocal,startTime;
	ref = this;
	startDate = new Date();
	pixelSizeLocal = ref.pixelSize;
	var imageHeight = ref.targetCanvas.height;
	var imageWidth = ref.targetCanvas.width;
	var pixel = {};
	pixel.w = pixel.h = pixelSizeLocal;
	//var context = this.context;
	loopAmount = ref.pixelSize * ref.pixelSize * 4;	
	//cache image data
	if(ref.imageData!==null ){
		pixels = ref.imageData;
	}
	else{
		imgd = ref.context.getImageData(0,0,imageWidth,imageHeight);
		pixels = ref.imageData = imgd.data;	
	}
    var cols = imageWidth / pixelSizeLocal;
    var rows = imageHeight / pixelSizeLocal;

	var averagedPixelArray = []; 

	var pixelIndex = null;
	for (col=0;col<cols;col++){
        for (row=0;row<rows;row++){
			pixel.h = Math.min(imageHeight-row*pixelSizeLocal,pixelSizeLocal);
            var redCh = 0;
            var greenCh = 0;
            var blueCh = 0;
                for (h=0;h<pixel.h;h++){
					pixel.w = Math.min(imageWidth-col*pixelSizeLocal,pixelSizeLocal);
						for (w=0;w<pixel.w;w++){
							pixelIndex = ((pixelSizeLocal*(row)+h) * imageWidth + (pixelSizeLocal*(col)+w)) * 4;
							redCh +=pixels[pixelIndex];
							greenCh +=pixels[pixelIndex+1];
							blueCh +=pixels[pixelIndex+2];
						}
				}
		loopAmount = pixel.h*pixel.w*4;
averagedPixelArray[averagedPixelArray.length]={
				"r":redCh,
				"g":greenCh,
				"b":blueCh,
				"y":pixelSizeLocal*row,
				"x":pixelSizeLocal*col,
				"pixelW":pixel.w,
				"pixelH":pixel.h,
				"loopAmount":loopAmount
			};
		}
	}
	
	
	this.drawPixels(averagedPixelArray);
	var endDate = new Date();
	startTime = startDate.getTime(); 
	var runningTime = endDate.getTime()-startTime;
	if (location.search ==="?debug") { alert(runningTime); }

  _gaq.push(['_trackEvent', 'BlurRuntime', runningTime+" ms"]);
  _gaq.push(['_trackEvent', 'BlurImageSize',imageWidth+"x"+imageHeight]);
  _gaq.push(['_trackEvent', 'BlurPixelSize', pixelSizeLocal+" px"]);
  _gaq.push(['_trackEvent', 'BlurPixelStyle', 'pixelStyle',this.blurStyle]);
  return false;
};
Blur.prototype.drawPixels = function (pixelArr){
	this.blurFillOnePass(pixelArr);
};

Blur.prototype.setPixel = function(imageData, x, y, r, g, b, a) {
    var index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
};

Blur.prototype.blurFillOnePass = function(pixelArr) {

	var i = 0;
	var len=pixelArr.length;

	switch(this.blurStyle){
		case "ascii":
			this.context.fillStyle = "rgba(255,255,255, 1)";
			this.context.fillRect(0,0,this.targetCanvas.width,this.targetCanvas.height);
			this.context.fillStyle = "rgba(0,0,0,1)";
			this.context.font = this.pixelSize+"px Courier";
		
		break;

		case "crossStich": 
			this.context.fillStyle = "rgba(0,0,0,1)";
			this.context.fillRect(0,0,this.targetCanvas.width,this.targetCanvas.height);
		break;

		case "circular":
			this.context.fillStyle = "rgba(20,20,20, 1)";
			this.context.fillRect(0,0,this.targetCanvas.width,this.targetCanvas.height);
		break;

		case "rastered":
			this.context.fillStyle = "rgba(255,255,255, 1)";
			this.context.fillRect(0,0,this.targetCanvas.width,this.targetCanvas.height);
		break;
	}
	for(i = 0;i<len;i++){
		this.blurFill(pixelArr[i],true);
	}
};

Blur.prototype.blurFill = function(pixelObj,onepass) {	
	var r= pixelObj.r;
	var g= pixelObj.g;
	var b= pixelObj.b;
	var x =pixelObj.x;
	var y =pixelObj.y;
	var pixelW = pixelObj.pixelW;
	var pixelH = pixelObj.pixelH;
	var loopAmount = pixelObj.loopAmount;
	var rgbValue = this.getRgbValue(r,g,b,loopAmount);
	var rgbValueInverted;
	switch(this.blurStyle){
	
		case "softblur":
			//var rgbValue = this.getRgbValue(redCh,greenCh,blueCh,loopAmount);
			this.setPixel(this.collPixels, x/this.pixelSize, y/this.pixelSize, r, g, b, 0xff); // 0xff opaque
		break;

		case "circular":
			if(!onepass){
				this.context.fillStyle = "rgba(20,20,20, 1)";
				this.context.fillRect(x,y,pixelW,pixelH);
			}
			
			this.context.fillStyle = "rgba("+rgbValue.r+", "+rgbValue.g+", "+rgbValue.b+", 0.7)";
			this.context.beginPath();
			this.context.arc(x+this.pixelSize/2,y+this.pixelSize/2,this.pixelSize/2,0,Math.PI*2,true);
			this.context.closePath();
			this.context.fill();
		break;
		case "circularNegative":
			this.context.fillStyle = "rgba("+Math.round(r/(loopAmount >> 2))+", "+Math.round(g/(loopAmount >> 2))+", "+Math.round(b/(loopAmount >> 2))+", 1)";
			this.context.fillRect(x,y,pixelW,pixelH);
			this.context.fillStyle = "rgba(20,20,20, 1)";
			this.context.beginPath();
			this.context.arc(x+this.pixelSize/2,y+this.pixelSize/2,this.pixelSize/4,0,Math.PI*2,true);
			this.context.closePath();
			this.context.fill();
		break;

		case "invertedBackdrop":
			rgbValueInverted = this.getRgbValue(r,g,b,loopAmount,true);
			this.context.fillStyle = "rgba("+rgbValue.r+", "+rgbValue.g+", "+rgbValue.b+", 1)";
			this.context.fillRect(x,y,pixelW,pixelH);
			this.context.fillStyle = "rgba("+rgbValueInverted.r+", "+rgbValueInverted.g+", "+rgbValueInverted.b+", 1)";
			this.context.beginPath();
			this.context.arc(x+this.pixelSize/2,y+this.pixelSize/2,this.pixelSize/4,0,Math.PI*2,true);
			this.context.closePath();
			this.context.fill();
		break;	

		case "invert":
			rgbValueInverted = this.getRgbValue(r,g,b,loopAmount,true);
			this.context.fillStyle = "rgba("+rgbValueInverted.r+", "+rgbValueInverted.g+", "+rgbValueInverted.b+", 1)";
			this.context.fillRect(x,y,pixelW,pixelH);
		break;

		case "desaturated": 
			rgbValue = this.getRgbValue(r,g,b,loopAmount,false,true);
			this.context.fillStyle = "rgba("+rgbValue.r+", "+rgbValue.g+", "+rgbValue.b+", 1)";
			this.context.fillRect(x,y,pixelW,pixelH);
		break;

		case "crossStich": 
			if(!onepass){
				this.context.fillStyle = "rgba(0,0,0, 1)";
				this.context.fillRect(x,y,pixelW,pixelH);
			}
			this.context.beginPath();
			this.context.fillStyle = "rgba("+rgbValue.r+", "+rgbValue.g+", "+rgbValue.b+", 1)";
			this.context.strokeStyle = "rgba("+rgbValue.r+", "+rgbValue.g+", "+rgbValue.b+", 1)";
			this.context.lineWidth   = Math.round(this.pixelSize/4);
			this.context.moveTo(x, y); 
			this.context.lineTo(x+this.pixelSize, y+this.pixelSize);
			this.context.moveTo(x+this.pixelSize, y); 
			this.context.lineTo(x, y+this.pixelSize);
			this.context.lineCap = "square";
			this.context.stroke();
			this.context.closePath();
		break;


		case "gradient":
			var x1 = Math.round(x+this.pixelSize/2);
			var y1 = Math.round(y+this.pixelSize/2);
			var r1 = this.pixelSize/5;

			var x2 = x1; 
			var y2 = y1; 
			var r2 = this.pixelSize/1.3;

			var radialGradient1 =this.context.createRadialGradient(x1, y1, r1, x2, y2, r2);
			radialGradient1.addColorStop(0, 'rgb('+Math.round(r/(loopAmount >> 2))+','+Math.round(g/(loopAmount >> 2))+', '+Math.round(b/(loopAmount >> 2))+')');
			
			radialGradient1.addColorStop(0.7, 'rgb(0, 0, 0)');

			this.context.fillStyle = radialGradient1;
			this.context.fillRect(x,y,pixelW,pixelH);
		break;

		case "lineArt": 
			this.context.fillStyle = "rgba(0,0,0, 1)";
			this.context.fillRect(x,y,pixelW,pixelH);
			this.context.beginPath();
			rgbValue = this.getRgbValue(r,g,b,loopAmount,false,false);
			this.context.fillStyle = "rgba("+rgbValue.r+", "+rgbValue.g+", "+rgbValue.b+", 1)";
			this.context.strokeStyle = "rgba("+rgbValue.r+", "+rgbValue.g+", "+rgbValue.b+", 1)";
			this.context.lineWidth   = Math.round(this.pixelSize/4);
			this.context.moveTo(x+this.pixelSize, y); 
			this.context.lineTo(x+this.pixelSize, y+this.pixelSize);
			this.context.lineCap = "square";
			this.context.stroke();
			this.context.closePath();
		break;

		case "desaturatedCircle":
			this.context.fillStyle = "rgba(255,255,255, 1)";
			this.context.fillRect(x,y,pixelW,pixelH);
			rgbValue = this.getRgbValue(r,g,b,loopAmount,false,true);
			this.context.fillStyle = "rgba("+rgbValue.r+", "+rgbValue.g+", "+rgbValue.b+", 1)";
			this.context.beginPath();
			this.context.arc(x+this.pixelSize/2,y+this.pixelSize/2,this.pixelSize/2,0,Math.PI*2,true);
			this.context.closePath();
			this.context.fill();
		break;

		case "ascii":
			if(!onepass){
				this.context.fillStyle = "rgba(255,255,255, 1)";
				this.context.fillRect(x,y,pixelW,pixelH);
				this.context.fillStyle = "rgba(0,0,0,1)";
				this.context.font = this.pixelSize+"px Courier";
			}
			rgbValue = this.getRgbValue(r,g,b,loopAmount,false,true);
			var asciiCharPos = Math.max(0, Math.min(this.asciiCharMapArr.length, Math.floor((rgbValue.r-1)/(255/this.asciiCharMapArr.length))));
			this.context.fillText(this.asciiCharMapArr[asciiCharPos], x,y);
			
		break;

		case "bw":
			rgbValue = this.getRgbValue(r,g,b,loopAmount,false,true);
			var colorValue = rgbValue.r <128 ? 0 : 255;
			this.context.fillStyle = "rgba("+colorValue+", "+colorValue+", "+colorValue+", 1)";
			this.context.fillRect(x,y,pixelW,pixelH);
			
		break;

		case "rastered":
			if(!onepass){
				this.context.fillStyle = "rgba(255,255,255, 1)";
				this.context.fillRect(x,y,pixelW,pixelH);
			}	
			rgbValue = this.getRgbValue(r,g,b,loopAmount,false,true);
			this.context.fillStyle = "rgba(0,0,0,1)";
			this.context.beginPath();
			var percentage = rgbValue.r/255;
			this.context.arc(x+this.pixelSize/2,y+this.pixelSize/2,Math.round(this.pixelSize/2-((this.pixelSize/2)*percentage)),0,Math.PI*2,true);
			this.context.closePath();
			this.context.fill();
		break;

		default: 
			this.context.fillStyle = "rgba("+rgbValue.r+", "+rgbValue.g+", "+rgbValue.b+", 1)";
			this.context.fillRect(x,y,pixelW,pixelH);
		break;
	}
};

Blur.prototype.getRgbValue = function(r,g,b,loopAmount,inverted,desaturated) {
	var rgb = {
		r:Math.round(r/(loopAmount >> 2)),
		g:Math.round(g/(loopAmount >> 2)),
		b:Math.round(b/(loopAmount >> 2))
	};

	if(inverted){
		rgb.r = Math.abs(rgb.r-255);
		rgb.g = Math.abs(rgb.g-255);
		rgb.b = Math.abs(rgb.b-255);
	}

	if(desaturated){
		rgb.r = rgb.g = rgb.b = Math.round( rgb.r*0.3 + rgb.g*0.59 + rgb.b* 0.11);
	}
	return rgb;
};

Blur.prototype.blurBlock = function() {
	if(this.pixelCollection.length>0){
		var point = this.pixelCollection.shift();
		var redCh, blueCh, greenCh, pixels,imgd;
		var pixel = {};
		pixel.w = pixel.h = null;
		pixel.h = point.y+this.pixelSize<this.targetCanvas.height ? this.pixelSize:this.targetCanvas.height-point.y;
		pixel.w = point.x+this.pixelSize<this.targetCanvas.width ? this.pixelSize:this.targetCanvas.width-point.x;
		var loopAmount = pixel.w * pixel.h *4;
		if(loopAmount===0){
			return false;
		}
		imgd = this.context.getImageData(Math.min(point.x,this.targetCanvas.width),Math.min(point.y,this.targetCanvas.height),pixel.w,pixel.h);
		pixels = imgd.data;
		redCh = blueCh = greenCh = 0;
		var i = 0;
		while(i<loopAmount){
				redCh +=pixels[i];
				greenCh +=pixels[++i];
				blueCh +=pixels[++i];
				i+=2;
			}
		this.blurFill({
				"r":redCh,
				"g":greenCh,
				"b":blueCh,
				"y":point.y,
				"x":point.x,
				"pixelW":pixel.w,
				"pixelH":pixel.h,
				"loopAmount":loopAmount
			});
	}
};

Blur.prototype.blurCoords = function(mouseX,mouseY){
	if(this.mouseBlur){
		var mouseposX = this.snapCoord(mouseX-this.targetCanvas.offsetLeft);
		var mouseposY = this.snapCoord(mouseY-this.targetCanvas.offsetTop);
		if(this.pointRegister[mouseposX+"x"+mouseposY]===undefined){
			this.pixelCollection.push({x:mouseposX,y:mouseposY});
			this.pointRegister[mouseposX+"x"+mouseposY]= true;
		}
	}
};

Blur.prototype.snapCoord = function(coord) {
	var updatedCoord = 0;
	updatedCoord = coord<this.pixelSize ? 0: (Math.floor(coord/this.pixelSize))*this.pixelSize;
	return updatedCoord;
};
var blurApp = new Blur({pixelSize:15,dropAreaId:"dropArea"});

$(".sizeSelector").click(
	function(e){	
		e.preventDefault();
		blurApp.setPixelSize($(e.currentTarget).data("pixel-size"));
});
$(".styleSelector").click(
	function(e){	
		e.preventDefault();
		$(".styleSelector").removeClass("active");
		$(e.currentTarget).addClass("active");
		$("#displayBlurStyle").text("blurstyle: "+$(e.currentTarget).attr("title"));
		blurApp.setBlurStyle($(e.currentTarget).data("blur-style"));
});



function setPlacement(){
	$("footer").css({"width":$("#settings").width()});
	
	if($(blurApp.targetCanvas).is(":hidden")){
		var newH = $(window).height();
		newH -= $("header").outerHeight()+10;
		newH -= $("footer").height();

		$("#main").height(newH);
		var dropAreaTopMargin = Math.floor((($(window).height()-$("header").outerHeight()-$("footer").height())-$("#dropArea").height())/2);

		$("#dropArea").addClass("active");
		$("#dropArea").css({"padding-top":dropAreaTopMargin+"px"});
	}
	else{
		$("#main").css({"height":""});
	}
}

$(window).resize(function(){setPlacement();});

$(document).ready(function(){
	setPlacement();
});

$("#mouseBlur, #scaleImage").change(
	function(e) {
		e.preventDefault();
		if($(e.currentTarget).attr("id")==="mouseBlur"){
			blurApp.blurWithMouse($(e.currentTarget).is(':checked'));
		}
		else{
			blurApp.scaleToFit($(e.currentTarget).is(':checked'));
		}
	}
);


$('#slider').slider({
	max:50,
	min:3,
	value:10,
	step:1,
	slide: function( event, ui ) {
		$("#displayPixelSize").text("Pixelsize: "+ui.value);
	},
	stop: function( event, ui ) {
		blurApp.setPixelSize(ui.value);
	}
});

$('#uploadForm a').click(
	function(e){
		e.preventDefault();
		var imgURL = $("#uploadURL").val();
		$.getImageData({
				url: imgURL,
				success: function(image){
					blurApp.imgLoaded(image);
				},
				error: function(){
					$("#uploadURL").val("Doh, something went wrong, try again later.");
				}
			});
	}
);

if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i))) {
	$('#mouseBlur').hide();
}