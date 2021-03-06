//Let's take all we've learned and really make something out of it.

//http://localhost:8000/jslix.html

// ImageLibrary Stuff
var view;
var lx = 0;
var ly = 0;

//These are arrays that store multiple images
var viewArray = [];
var locxArray = [];
var locyArray = [];
var imgQueue = [];
var busy = 0;

// Drastically decrease copy times
var imgcanvas;
var imgctx;
var imgnum = -1;
var imgsData;
var imgview;
var i;

// JSlix stuff
var interval = null;
var lastTime = new Date();
var frame = 0;
var count = 0;
var fps = 0;
var sec = 16;
var cx = 0;
var cy = 0;

//animation stuff
var step = 0;

// getImage stuff
var newImg = new Image();
var tempImg = new Image();
newImgReady = -1;

function init(){
	addImage("AWDS_INFT.png");
	addImage("MinuteWars.png");
	addImage("CWT_MECH.png");
	
}

function runGame(){

	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	
	ctx.clearRect(0, 0, c.width, c.height);
	
	step++;
	if( step == 3 ) step = 0;
	
	ctx.drawImage(image, 0, 0, c.width, c.height);
	//ctx.drawImage(canvasImage(1), 0, 0, c.width, c.height);
	//for(var i = 0; i < 20; i++){
	//	ctx.drawImage(newImg, step*32, 0, 32, 32, 10*i, 10, 32, 32);
	//}
	for(var i = 0; i < 20; i++){
		ctx.drawImage(canvasImg(0), step*32, 0, 32, 32, 10*i, 10, 32, 32);
	}
	for(var i = 0; i < 20; i++)
		ctx.drawImage(canvasImg(1), step*32, 0, 32, 32, 10*i, 10+16, 32, 32);
	for(var i = 0; i < 20; i++)
		ctx.drawImage(getImg(0), step*32, 0, 32, 32, 10*i, 10+32, 32, 32);
	/*for(var i = 0; i < 100; i++)
		ctx.drawImage(canvasImg(1), step*32, 0, 32, 32, 10*i, 10+48, 32, 32);
	for(var i = 0; i < 100; i++)
		ctx.drawImage(canvasImg(0), step*32, 0, 32, 32, 10*i, 10+64, 32, 32);//*/
	
	var nowTime = new Date();
	var diffTime = nowTime.getTime() - lastTime.getTime();
	frame += diffTime;
	count++;
	if(frame > 1000){
		frame -= 1000;
		fps = count;
		count = 0;
	}
	ctx.fillStyle = '#000000';
	ctx.font = 'bold 10px sans-serif';
	ctx.fillText('FPS: ' + fps , 4, 10);
	
	lastTime = new Date();
}

// This is the game test itself
function run(sec){
	if(interval == null)
		init();
	else
		clearInterval(interval);
	var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	var imgStorage = document.getElementById("myCanvas");
	if(imgStorage == null){
		imgStorage = document.createElement("canvas");
		document.body.appendChild(imgStorage);
	}
	imgStorage.setAttribute("id", "myCanvas");
	imgStorage.setAttribute("width", w);
	imgStorage.setAttribute("height", h);
	imgStorage.innerHTML = "Your browser does not support the HTML5 canvas tag.";
	interval = setInterval(runGame, sec);
}

// ---------------------------------
// ImageLibrary starts here
// ---------------------------------

// This function adds an image from text.
function addImage(text){

	//This will combine both queue and addImage.
	if(busy == 1){
		imgQueue.push(text);
		return;
	}
	
	busy = 1;
	//This grabs an image and temporarily stores it in memory
	var imgStorage = document.getElementById("image");
	if(imgStorage == null){
		imgStorage = document.createElement("img");
		document.body.appendChild(imgStorage);
	}
	imgStorage.setAttribute("id", "image");
	imgStorage.setAttribute("src", text);
	imgStorage.setAttribute("onload", "storeImage()");
	imgStorage.setAttribute("style", "display:none");
}

// This function is literally a callback function to actually store the image
function storeImage(){
	
	var imgStorage = document.getElementById("image");
	if(imgStorage == null){
		imgStorage = document.createElement("img");
		document.body.appendChild(imgStorage);
	}
	imgStorage.setAttribute("id", "image");
	
	var canvas = document.getElementById("store");
	if(canvas == null){
		canvas = document.createElement("canvas");
		document.body.appendChild(canvas);
	}
	canvas.setAttribute("id", "store");
	canvas.setAttribute("width", imgStorage.width);
	canvas.setAttribute("height", imgStorage.height);
	canvas.setAttribute("style", "display:none");

	console.log("("+imgStorage.width+","+imgStorage.height+")");

	var ctx = canvas.getContext("2d");
	ctx.drawImage(imgStorage, 0, 0);
	var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	
	//This pushes the images into an array
	viewArray.push(new Uint8ClampedArray(imgData.data));
	locxArray.push(imgStorage.width);
	locyArray.push(imgStorage.height);
	
	busy = 0;
	if(imgQueue.length > 0){
		addImage(imgQueue.pop());
	}
	
	run(sec);
}

//Canvas Image with a speed mechanic included
function canvasImg(num){

	if(num == imgnum){
		return imgcanvas;
	}
	
	var change = 0;

	if(num >= 0 && num < viewArray.length){
		view = viewArray[num];
		if(lx != locxArray[num] || ly != locyArray[num]){
			lx = locxArray[num];
			ly = locyArray[num];
			change = 1;
		}
	}else{
		view = null;
		if(lx != 100 || ly != 100){
			lx = 100;
			ly = 100;
			change = 1;
		}
	}

	//This makes a canvas storage module for the image
	if(change == 1){
		imgcanvas = document.getElementById("store");
		if(imgcanvas == null){
			imgcanvas = document.createElement("canvas");
			document.body.appendChild(imgcanvas);
		}
		imgcanvas.setAttribute("id", "store");
		imgcanvas.setAttribute("width", lx);
		imgcanvas.setAttribute("height", ly);
		imgcanvas.setAttribute("style", "display:none");
		imgctx = imgcanvas.getContext("2d");
		imgsData = imgctx.createImageData(lx,ly);
	}else{
		imgctx.clearRect(0, 0, lx, ly);
	}
		
	if(view == null){
		for (i = 0; i < imgsData.data.length; i += 4){
			imgsData.data[i+0]=255;
			imgsData.data[i+1]=0;
			imgsData.data[i+2]=0;
			imgsData.data[i+3]=100;
		}
	}else{
		for (i = 0; i < imgsData.data.length; i+=8){
			imgsData.data[i]=view[i];
			imgsData.data[i+1]=view[i+1];
			imgsData.data[i+2]=view[i+2];
			imgsData.data[i+3]=view[i+3];
			imgsData.data[i+4]=view[i+4];
			imgsData.data[i+5]=view[i+5];
			imgsData.data[i+6]=view[i+6];
			imgsData.data[i+7]=view[i+7];
		}//*/
	}
	//Draws the image
	imgctx.putImageData(imgsData,0,0);
	
	imgnum = num;
	
	return imgcanvas;
}

// The getImage stuff - to get rid of the slow time of Internet Explorer
function getImg(num){
	if(newImgReady != num){
		console.log("Goes here "+newImgReady);
		addLoadEvent(loadImage(num));
	}

	return newImg;
}

function loadImage(num){
	tempImg = new Image();
	tempImg.onload = function(){
		newImg.src = this.src;
		if(this.height == locyArray[num] && this.width == locxArray[num]){
			newImgReady = num;
		}	
	};
	tempImg.src = canvasImg(num).toDataURL();
}

// Code by Simon Willison
function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}