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

let counterTiles = [new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image(),new Image()];
counterTiles[0].src = './img/0num.png';
counterTiles[1].src = './img/1num.png';
counterTiles[2].src = './img/2num.png';
counterTiles[3].src = './img/3num.png';
counterTiles[4].src = './img/4num.png';
counterTiles[5].src = './img/5num.png';
counterTiles[6].src = './img/6num.png';
counterTiles[7].src = './img/7num.png';
counterTiles[8].src = './img/8num.png';
counterTiles[9].src = './img/9num.png';
counterTiles[10].src = './img/minus.png';

//canvas setup
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let topCanvas = document.getElementById("topZone");
let topCtx = topCanvas.getContext("2d");

//buttons
let easyButton = document.getElementById("easy");
let normalButton = document.getElementById("normal");
let hardButton = document.getElementById("hard");
let expertButton = document.getElementById("expert");
let restartButton = document.getElementById("reset");

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
topCanvas.width = TILESIZE*boardWidth;
topCanvas.height = TILESIZE*2;

let mousePosx = 0;
let mousePosy = 0;

let lastClickX = -1;
let lastClickY = -1;
let lastPress = -1;

let gameActive = true;
let result = false;
let firstClick = true;
let timer = 0;

canvas.addEventListener('mousemove', e=>{
	if(gameActive){
		mousePosx = e.offsetX;
		mousePosy = e.offsetY;
	}
	draw();
});
function clickSpace(i,j){
	//game logic
	if(board[i][j].bomb == 1){
		//game over
		gameActive = false;
	}
	else{
		if(board[i][j].value == 0 && board[i][j].bomb == 0){
			revealEmpty(i, j);
		}
		//chord
		if(board[i][j].hidden == 0 && board[i][j].value > 0){
			chord(i,j);
		}
	}
	board[i][j].hidden = 0;
	checkVictory();
}
canvas.addEventListener('mouseup', e => {
	if(gameActive){
		let currentX = Math.floor(e.offsetX/TILESIZE);
		let currentY = Math.floor(e.offsetY/TILESIZE);
		if(firstClick){
			while(board[currentX][currentY].value != 0){
				createBoard(boardLength, boardWidth, bombs);
			}
			firstClick = false;
		}
		if(currentX == lastClickX && currentY == lastClickY){
			board[currentX][currentY].clickHeld = 0;
			if(lastPress == 0 && board[currentX][currentY].flag == 0){
				clickSpace(currentX, currentY);
			}
		}
		else{
			board[lastClickX][lastClickY].clickHeld = 0;
		}
		resetClicked();
	}
	draw();
});

canvas.addEventListener('mousedown', e => {
	if(gameActive){
		lastClickX = Math.floor(e.offsetX/TILESIZE);
		lastClickY = Math.floor(e.offsetY/TILESIZE);
		lastPress = e.button;
		if(e.button == 2){
			//right click place flag
			if(board[lastClickX][lastClickY].hidden == 1){
				board[lastClickX][lastClickY].flag = (board[lastClickX][lastClickY].flag + 1) % 2;
				if(board[lastClickX][lastClickY].flag == 0){
					bombsLeft++;
				}
				else{
					bombsLeft--;
				}
			}
		}
		else if(e.button == 0){
			//left click
			if(board[lastClickX][lastClickY].hidden == 1){
				board[lastClickX][lastClickY].clickHeld = 1;
			}
			else{
				markSurrounding(lastClickX,lastClickY);
			}
		}
	}
	draw();
});

easyButton.onclick = function(){
	resetting = 1;
	boardLength = 9;
	boardWidth = 9;
	bombs = 10;
	bombsLeft = 10;
	canvas.width = TILESIZE*boardLength;
	canvas.height = TILESIZE*boardWidth;
	topCanvas.width = TILESIZE*boardWidth;
	createBoard(boardLength, boardWidth, bombs);
};
normalButton.onclick = function(){
	boardLength = 16;
	boardWidth = 16;
	bombs = 40;
	bombsLeft = 40;
	canvas.width = TILESIZE*boardLength;
	canvas.height = TILESIZE*boardWidth;
	topCanvas.width = TILESIZE*boardWidth;
	createBoard(boardLength, boardWidth, bombs);
};
hardButton.onclick = function(){
	boardLength = 30;
	boardWidth = 16;
	bombs = 99;
	bombsLeft = 99;
	canvas.width = TILESIZE*boardLength;
	canvas.height = TILESIZE*boardWidth;
	topCanvas.width = TILESIZE*boardLength;
	createBoard(boardLength, boardWidth, bombs);
};
expertButton.onclick = function(){
	boardLength = 50;
	boardWidth = 30;
	bombs = 250;
	bombsLeft = 250;
	canvas.width = TILESIZE*boardLength;
	canvas.height = TILESIZE*boardWidth;
	topCanvas.width = TILESIZE*boardLength;
	createBoard(boardLength, boardWidth, bombs);
};
restartButton.onclick = function(){
	createBoard(boardLength, boardWidth, bombs);
};
let lastTime = Date.now();
async function runClock(){
	if(!firstClick && gameActive){
		if(Date.now() - lastTime >= 1000){
			timer++;
			lastTime = Date.now();
		}
	}
	draw();
}
function createBoard(length, width, bombCount){
	gameActive = true;
	firstClick = true;
	result = false;
	timer = 0;
	bombsLeft = bombs;
	board = new Array(length);
	for(let i=0;i<length;i++){
		board[i] = new Array(width);
		for(let j=0;j<width;j++){
			board[i][j] = {'bomb':0,'flag':0,'value':0,'hidden':1,'clickHeld':0};
			if(Math.random() <= 0.1 && bombCount != 0){
				//place bomb on  that tile
				board[i][j].bomb = 1;
				board[i][j].value = -1;
				bombCount--;
			}
		}
	}
	//place remaining bombs
	while(bombCount != 0){
		let randomX = Math.floor(Math.random() * length);
		let randomY = Math.floor(Math.random() * width);
		if(board[randomX][randomY].bomb == 1){
			
		}
		else{
			//place new bomb
			board[randomX][randomY].bomb = 1;
			board[randomX][randomY].value = -1;
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
			}catch(error){}
			
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
	//top zone
	topCtx.fillStyle = '#eee';
	topCtx.fillRect(0,0,TILESIZE*boardLength,TILESIZE*boardWidth);
	//bombs
	let currentBombs = bombsLeft;
	let oneDigit = currentBombs%10;
	currentBombs = Math.floor(currentBombs/10);
	let tenDigit = currentBombs%10;
	currentBombs = Math.floor(currentBombs/10);
	let hunDigit = currentBombs%10;
	currentBombs = Math.floor(currentBombs/10);
	
	if(bombsLeft < 0){
		hunDigit = 10;
	}
	topCtx.drawImage(counterTiles[hunDigit],2,10,13,23);
	topCtx.drawImage(counterTiles[tenDigit],15,10,13,23);
	topCtx.drawImage(counterTiles[oneDigit],28,10,13,23);
	//timer
	currentBombs = timer;
	oneDigit = currentBombs%10;
	currentBombs = Math.floor(currentBombs/10);
	tenDigit = currentBombs%10;
	currentBombs = Math.floor(currentBombs/10);
	hunDigit = currentBombs%10;
	currentBombs = Math.floor(currentBombs/10);

	topCtx.drawImage(counterTiles[hunDigit],topCanvas.width-41,10,13,23);
	topCtx.drawImage(counterTiles[tenDigit],topCanvas.width-28,10,13,23);
	topCtx.drawImage(counterTiles[oneDigit],topCanvas.width-15,10,13,23);
	//mine field
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
	if(gameActive){
		ctx.fillStyle = 'rgba(230,220,80,0.5)';
		ctx.fillRect(Math.floor(mousePosx/TILESIZE)*TILESIZE,Math.floor(mousePosy/TILESIZE)*TILESIZE,TILESIZE,TILESIZE);
	}
	else{
		if(result){
			//winner!
			ctx.fillStyle = 'rgba(0,255,0,0.5)';
			ctx.fillRect(0,0,TILESIZE*boardLength,TILESIZE*boardWidth);
			
			ctx.fillStyle = 'black';
			ctx.font = `${boardLength*(TILESIZE/8)}px Lucida Console`;
			let text = 'You Win!';
			ctx.textAlign = 'center';
			ctx.fillText(text,(TILESIZE*boardLength)/2,(TILESIZE*boardWidth)/2);
		}
		else{
			//loss
			ctx.fillStyle = 'rgba(255,0,0,0.5)';
			ctx.fillRect(0,0,TILESIZE*boardLength,TILESIZE*boardWidth);
			
			ctx.fillStyle = 'black';
			ctx.font = `${boardLength*(TILESIZE/8)}px Lucida Console`;
			let text = 'Game Over!';
			ctx.textAlign = 'center';
			ctx.fillText(text,(TILESIZE*boardLength)/2,(TILESIZE*boardWidth)/2);
		}
	}
}

function revealEmpty(i, j){
	board[i][j].hidden = 0;
	if(board[i][j].value == 0){
		try{
			if(board[i-1][j-1].value == 0 && board[i-1][j-1].hidden == 1){
				revealEmpty(i-1,j-1);
			}
			board[i-1][j-1].hidden = 0;
		}catch(error){}
		
		try{
			if(board[i][j-1].value == 0 && board[i][j-1].hidden == 1){
				revealEmpty(i,j-1);
			}
			board[i][j-1].hidden = 0;
		}catch(error){}
		
		try{
			if(board[i+1][j-1].value == 0 && board[i+1][j-1].hidden == 1){
				revealEmpty(i+1,j-1);
			}
			board[i+1][j-1].hidden = 0;
		}catch(error){}
		
		try{
			if(board[i-1][j].value == 0 && board[i-1][j].hidden == 1){
				revealEmpty(i-1,j);
			}
			board[i-1][j].hidden = 0;
		}catch(error){}
		
		try{
			if(board[i+1][j].value == 0 && board[i+1][j].hidden == 1){
				revealEmpty(i+1,j);
			}
			board[i+1][j].hidden = 0;
		}catch(error){}
		
		try{
			if(board[i-1][j+1].value == 0 && board[i-1][j+1].hidden == 1){
				revealEmpty(i-1,j+1);
			}
			board[i-1][j+1].hidden = 0;
		}catch(error){}
		
		try{
			if(board[i][j+1].value == 0 && board[i][j+1].hidden == 1){
				revealEmpty(i,j+1);
			}
			board[i][j+1].hidden = 0;
		}catch(error){}
		
		try{
			if(board[i+1][j+1].value == 0 && board[i+1][j+1].hidden == 1){
				revealEmpty(i+1,j+1);
			}
			board[i+1][j+1].hidden = 0;
		}catch(error){}
	}
}
function checkVictory(){
	for(let i=0;i<boardLength;i++){
		for(let j=0;j<boardWidth;j++){
			if(board[i][j].value >= 0 && board[i][j].hidden == 1 && board[i][j].bomb == 0){
				return;
			}
		}
	}
	result = true;
	gameActive = false;
	return;
}
function resetClicked(){
	for(let i=0;i<boardLength;i++){
		for(let j=0;j<boardWidth;j++){
			board[i][j].clickHeld = 0;
		}
	}
}
function markSurrounding(i,j){
	try{
		if(board[i-1][j-1].hidden == 1)
			board[i-1][j-1].clickHeld = 1;
	}catch(error){}
	
	try{
		if(board[i][j-1].hidden == 1)
			board[i][j-1].clickHeld = 1;
	}catch(error){}
	
	try{
		if(board[i+1][j-1].hidden == 1)
			board[i+1][j-1].clickHeld = 1;
	}catch(error){}
	
	try{
		if(board[i-1][j].hidden == 1)
			board[i-1][j].clickHeld = 1;
	}catch(error){}
	
	try{
		if(board[i+1][j].hidden == 1)
			board[i+1][j].clickHeld = 1;
	}catch(error){}
	
	try{
		if(board[i-1][j+1].hidden == 1)
			board[i-1][j+1].clickHeld = 1;
	}catch(error){}
	
	try{
		if(board[i][j+1].hidden == 1)
			board[i][j+1].clickHeld = 1;
	}catch(error){}
	
	try{
		if(board[i+1][j+1].hidden == 1)
			board[i+1][j+1].clickHeld = 1;
	}catch(error){}
}
function chord(i,j){
	let value = 0;
	try{
		if(board[i-1][j-1].flag == 1){
			value++;
		}
	}catch(error){}
	
	try{
		if(board[i][j-1].flag == 1){
			value++;
		}
	}catch(error){}
	
	try{
		if(board[i+1][j-1].flag == 1){
			value++;
		}
	}catch(error){}
	
	try{
		if(board[i-1][j].flag == 1){
			value++;
		}
	}catch(error){}
	
	try{
		if(board[i+1][j].flag == 1){
			value++;
		}
	}catch(error){}
	
	try{
		if(board[i-1][j+1].flag == 1){
			value++;
		}
	}catch(error){}
	
	try{
		if(board[i][j+1].flag == 1){
			value++;
		}
	}catch(error){}
	
	try{
		if(board[i+1][j+1].flag == 1){
			value++;
		}
	}catch(error){}
	
	if(value == board[i][j].value){
		try{
			if(board[i-1][j-1].hidden == 1 && board[i-1][j-1].flag == 0){
				clickSpace(i-1,j-1);
			}
		}catch(error){}
		
		try{
			if(board[i][j-1].hidden == 1 && board[i][j-1].flag == 0){
				clickSpace(i,j-1);
			}
		}catch(error){}
		
		try{
			if(board[i+1][j-1].hidden == 1 && board[i+1][j-1].flag == 0){
				clickSpace(i+1,j-1);
			}
		}catch(error){}
		
		try{
			if(board[i-1][j].hidden == 1 && board[i-1][j].flag == 0){
				clickSpace(i-1,j);
			}
		}catch(error){}
		
		try{
			if(board[i+1][j].hidden == 1 && board[i+1][j].flag == 0){
				clickSpace(i+1,j);
			}
		}catch(error){}
		
		try{
			if(board[i-1][j+1].hidden == 1 && board[i-1][j+1].flag == 0){
				clickSpace(i-1,j+1);
			}
		}catch(error){}
		
		try{
			if(board[i][j+1].hidden == 1 && board[i][j+1].flag == 0){
				clickSpace(i,j+1);
			}
		}catch(error){}
		
		try{
			if(board[i+1][j+1].hidden == 1 && board[i+1][j+1].flag == 0){
				clickSpace(i+1,j+1);
			}
		}catch(error){}
	}
}

let interval = setInterval(runClock, 1000);