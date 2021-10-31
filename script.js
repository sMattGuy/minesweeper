window.addEventListener('load', function () {
  init();
});

let tileValues = [new Image(), new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),];
tileValues[0].src = './img/empty.png';
tileValues[1].src = './img/1.png'
tileValues[2].src = './img/2.png'
tileValues[3].src = './img/3.png'
tileValues[4].src = './img/4.png'
tileValues[5].src = './img/5.png'
tileValues[6].src = './img/6.png'
tileValues[7].src = './img/7.png'
tileValues[8].src = './img/8.png'

let bombTile = new Image();
bombTile.src = './img/bomb.png';
let flagTile = new Image();
flagTile.src = './img/flag.png';
let tile = new Image();
tile.src = './img/unclicked.png';

//canvas setup
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

//buttons
let easyButton = document.getElementById("easy");
let normalButton = document.getElementById("normal");
let hardButton = document.getElementById("hard");
let expertButton = document.getElementById("expert");

//tile size
let TILESIZE = 20;

//board
let board = new Array();
let boardLength = 9;
let boardWidth = 9;
let bombs = 10;
let bombsLeft = 10;

//adjust canvas
canvas.width = TILESIZE*boardWidth;
canvas.height = TILESIZE*boardLength;

let mousePosx = 0;
let mousePosy = 0;

let lastClickX = -1;
let lastClickY = -1;
let lastPress = -1;

canvas.addEventListener('mousemove', e=>{
	mousePosx = e.offsetX;
	mousePosy = e.offsetY;
	draw();
});
canvas.addEventListener('mouseup', e => {
	let currentX = Math.floor(e.offsetX/TILESIZE);
	let currentY = Math.floor(e.offsetY/TILESIZE);
	if(currentX == lastClickX && currentY == lastClickY){
		board[currentX][currentY].clickHeld = 0;
		if(lastPress == 0){
			board[currentX][currentY].hidden = 0;
			//game logic
			
		}
	}
	else{
		board[lastClickX][lastClickY].clickHeld = 0;
	}
	draw();
});

canvas.addEventListener('mousedown', e => {
	lastClickX = Math.floor(e.offsetX/TILESIZE);
	lastClickY = Math.floor(e.offsetY/TILESIZE);
	lastPress = e.button;
	if(e.button == 2){
		//right click place flag
		board[lastClickX][lastClickY].flag = (board[lastClickX][lastClickY].flag + 1) % 2;
	}
	else if(e.button == 0){
		//left click
		board[lastClickX][lastClickY].clickHeld = 1;
	}
	draw();
});

easyButton.onclick = function(){
	resetting = 1;
	boardLength = 9;
	boardWidth = 9;
	bombs = 10;
	bombsLeft = 10;
	canvas.width = TILESIZE*boardWidth;
	canvas.height = TILESIZE*boardLength;
	createBoard(boardLength, boardWidth, bombs);
};
normalButton.onclick = function(){
	boardLength = 16;
	boardWidth = 16;
	bombs = 40;
	bombsLeft = 40;
	canvas.width = TILESIZE*boardWidth;
	canvas.height = TILESIZE*boardLength;
	createBoard(boardLength, boardWidth, bombs);
};
hardButton.onclick = function(){
	boardLength = 30;
	boardWidth = 16;
	bombs = 99;
	bombsLeft = 99;
	canvas.width = TILESIZE*boardLength;
	canvas.height = TILESIZE*boardWidth;
	createBoard(boardLength, boardWidth, bombs);
};
expertButton.onclick = function(){
	boardLength = 50;
	boardWidth = 30;
	bombs = 250;
	bombsLeft = 250;
	canvas.width = TILESIZE*boardLength;
	canvas.height = TILESIZE*boardWidth;
	createBoard(boardLength, boardWidth, bombs);
};

function createBoard(length, width, bombCount){
	board = new Array(length);
	for(let i=0;i<length;i++){
		board[i] = new Array(width);
		for(let j=0;j<width;j++){
			board[i][j] = {'bomb':0,'flag':0,'value':0,'hidden':1,'clickHeld':0};
			if(Math.random() <= 0.1 && bombCount != 0){
				//place bomb on  that tile
				board[i][j].bomb = 1;
			}
		}
	}
	//place remaining bombs
	while(bombCount != 0){
		let randomX = Math.floor(Math.random() * length);
		let randomY = Math.floor(Math.random() * width);
		if(board[randomX][randomY].bomb == 1){
			continue;
		}
		else{
			//place new bomb
			board[randomX][randomY].bomb = 1;
			bombCount--;
		}
	}
	//assign tile values
	let value = 0;
	for(let i=0;i<length;i++){
		for(let j=0;j<width;j++){
			try{
				if(board[i-1][j-1].bomb == 1){
					value++;
				}
			}catch(error){}
			
			try{
				if(board[i][j-1].bomb == 1){
					value++;
				}
			}catch(error){}
			
			try{
				if(board[i+1][j-1].bomb == 1){
					value++;
				}
			}catch(error){}
			
			try{
				if(board[i-1][j].bomb == 1){
					value++;
				}
			}
			catch(error){
				
			}
			
			try{
				if(board[i+1][j].bomb == 1){
					value++;
				}
			}catch(error){}
			
			try{
				if(board[i-1][j+1].bomb == 1){
					value++;
				}
			}catch(error){}
			
			try{
				if(board[i][j+1].bomb == 1){
					value++;
				}
			}catch(error){}
			
			try{
				if(board[i+1][j+1].bomb == 1){
					value++;
				}
			}catch(error){}
			board[i][j].value = value;
			value = 0;
		}
	}
	draw();
}

function init(){
	createBoard(boardLength, boardWidth, bombs);
}

function draw(){
	ctx.fillStyle = '#eee';
	ctx.fillRect(0,0,TILESIZE*boardLength,TILESIZE*boardWidth);
	//draw array
	for(let i=0;i<boardLength;i++){
		for(let j=0;j<boardWidth;j++){
			if(board[i][j].flag == 1){
				ctx.drawImage(flagTile,i*TILESIZE,j*TILESIZE,TILESIZE,TILESIZE);
			}
			else if(board[i][j].clickHeld == 1){
				ctx.drawImage(tileValues[0],i*TILESIZE,j*TILESIZE,TILESIZE,TILESIZE);
			}
			else if(board[i][j].hidden == 1){
				ctx.drawImage(tile,i*TILESIZE,j*TILESIZE,TILESIZE,TILESIZE);
			}
			else if(board[i][j].bomb == 1){
				ctx.drawImage(bombTile,i*TILESIZE,j*TILESIZE,TILESIZE,TILESIZE);
			}
			else{
				ctx.drawImage(tileValues[board[i][j].value],i*TILESIZE,j*TILESIZE,TILESIZE,TILESIZE);
			}
		}
	}
	ctx.fillStyle = 'rgba(230,220,80,0.5)';
	ctx.fillRect(Math.floor(mousePosx/TILESIZE)*TILESIZE,Math.floor(mousePosy/TILESIZE)*TILESIZE,TILESIZE,TILESIZE);
}