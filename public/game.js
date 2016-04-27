/*eslint-env browser */
/*globals io */
var socket = io();
		
var canvasWidth = 500;
var canvasHeight = 500;

function start() {
	
}

function Sphere(x, y, color) {
	this.x = x;
	this.y = y;
	this.color = color;
	this.radius = 15;
	this.acceleration = 1;
	this.maxSpeed = 30;
	this.xVel = 0;
	this.yVel = 0;
	this.move = function(){
		this.x += this.xVel;
		this.y += this.yVel;
		if (this.x - this.radius < 0) {
			this.xVel = -this.xVel;
			this.x = this.radius;
		} else if (this.x + this.radius > canvasWidth) {
			this.xVel = -this.xVel;
			this.x = canvasWidth - this.radius;
		}
		if (this.y - this.radius < 0) {
			this.yVel = -this.yVel;
			this.y = this.radius;
		} else if (this.y + this.radius > canvasHeight) {
			this.yVel = -this.yVel;
			this.y = canvasHeight - this.radius;
		}
	};
	this.changeXVel = function(delta){
		this.xVel += delta;
	};
	this.changeYVel = function(delta){
		this.yVel += delta;
	};
	this.getSpeed = function(){
		return Math.sqrt(this.xVel * this.xVel + this.yVel * this.yVel);
	};
	this.changeSpeed = function(delta){
		var speed = this.getSpeed();
		speed += delta;
		var factor = speed / this.getSpeed;
		this.xVel *= factor;
		this.yVel *= factor;
	};
	this.multSpeed = function(delta){
		this.xVel *= delta;
		this.yVel *= delta;
	}
	this.draw = function(){
		var canvas = document.getElementById("gameCanvas");
		var ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.arc(this.x - this.radius, this.y - this.radius, this.radius, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fillStyle = this.color;
		ctx.fill();
	};
	this.setPosition = function(x, y){
		this.x = x; this.y = y;
	};
}

function Bumper(x, y){
	this.x = x;
	this.y = y;
	this.radius = 20;
	this.color = "brown";
	this.hitTime = 20;
	this.hitTimer = 0;
	this.act = function(){
		if (this.hitTimer > 0) {
			this.color = "white";
			this.hitTimer--;
		} else {
			this.color = "brown";
		}
	};
}

var playerOne;
var playerTwo;

var inputs = [0, 0, 0, 0, 0];

var bumpers = [];

socket.on('playerOne', function(sphere){
	playerOne = sphere;
});

socket.on('playerTwo', function(sphere){
	playerTwo = sphere;
});

socket.on('bumpers', function(array){
	bumpers = array;
});

socket.on('draw', function(){
	draw();
});

socket.on('getInputs', function(){
	socket.emit('inputs', inputs);
});

socket.on('scores', function(scores){
	var text = "Player 1: " + scores[0] + "     Player 2: " + scores[1];
	document.getElementById("lblScore").innerHTML = text;
});

socket.on('info', function(string){
	document.getElementById('lblTime').innerHTML = string;
});

socket.on('clear', function(){
	clearCanvas();
});

socket.on('victory', function(message){
	var canvas = document.getElementById("gameCanvas");
	var ctx = canvas.getContext("2d");
	ctx.font = "30px Impact";
	ctx.fillStyle = "yellow";
	ctx.textAlign = "center";
	ctx.fillText(message,250, 250);
});

socket.on('debug', function(data){
	//document.getElementById("debug").innerHTML = data;
});

function draw(){
	clearCanvas();
	drawPlayer(playerOne);
	drawPlayer(playerTwo);
	drawBumpers();
}

function clearCanvas(){
	var canvas = document.getElementById("gameCanvas");
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer(player){
	var canvas = document.getElementById("gameCanvas");
	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.fillStyle = player.color;
	ctx.fill();
}

function drawBumpers(){
	for (var b = 0; b < bumpers.length; b++) {
		var canvas = document.getElementById("gameCanvas");
		var ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.arc(bumpers[b].x, bumpers[b].y, bumpers[b].radius, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fillStyle = bumpers[b].color;
		ctx.fill();
	}
}

document.onkeydown = keyDown;
document.onkeyup = keyUp;

function keyDown(event) {
	event = event || window.event;
	
	if (event.keyCode == 37) {	// Left
		document.getElementById("debug").innerHTML = "Left";
		inputs[0] = 1;
	} else if (event.keyCode == 38) {	// Up
		document.getElementById("debug").innerHTML = "Up";
		inputs[1] = 1;
	} else if (event.keyCode == 39) {	// Right
		document.getElementById("debug").innerHTML = "Right";
		inputs[2] = 1;
	} else if (event.keyCode == 40) {	// Down
		document.getElementById("debug").innerHTML = "Down";
		inputs[3] = 1;
	} else if (event.keyCode == 32) {	// Space
		inputs[4] = 1;
	}
}

function keyUp(event) {
	event = event || window.event;
	
	if (event.keyCode == 37) {	// Left
		//document.getElementById("debug").innerHTML = "LeftUp";
		inputs[0] = 0;
	} else if (event.keyCode == 38) {	// Up
		//document.getElementById("debug").innerHTML = "UpUp";
		inputs[1] = 0;
	} else if (event.keyCode == 39) {	// Right
		//document.getElementById("debug").innerHTML = "RightUp";
		inputs[2] = 0;
	} else if (event.keyCode == 40) {	// Down
		//document.getElementById("debug").innerHTML = "DownUp";
		inputs[3] = 0;
	} else if (event.keyCode == 32) {	// Space
		inputs[4] = 0;
	}
}