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
	this.radius = 15;
}

var playerOne;
var playerTwo;
var bumpers = [];

socket.on('playerOne', function(sphere){
	playerOne = sphere;
});

socket.on('playerTwo', function(sphere){
	playerTwo = sphere;
});

socket.on('bumpers', function(array){
	bumpers = array;
	draw();
});

socket.on('debug', function(data){
	document.getElementById("debug").innerHTML = data;
});

function draw(){
	drawPlayer(playerOne);
	drawPlayer(playerTwo);
	drawBumpers();
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
	for (var bumper in bumpers) {
		var canvas = document.getElementById("gameCanvas");
		var ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.arc(200, 200, 15, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fillStyle = "brown";
		ctx.fill();
	}
}

document.onkeydown = keyDown;
document.onkeyup = keyUp;

function keyDown(event) {
	event = event || window.event;
	
	if (event.keyCode == 37) {	// Left
		document.getElementById("debug").innerHTML = "Left";
	} else if (event.keyCode == 38) {	// Up
		document.getElementById("debug").innerHTML = "Up";
	} else if (event.keyCode == 39) {	// Right
		document.getElementById("debug").innerHTML = "Right";
		playerOne.x = playerOne.x + 1;
		draw(playerOne);
	} else if (event.keyCode == 40) {	// Down
		document.getElementById("debug").innerHTML = "Down";
	}
}

function keyUp(event) {
	event = event || window.event;
	
	if (event.keyCode == 37) {	// Left
		document.getElementById("debug").innerHTML = "LeftUp";
	} else if (event.keyCode == 38) {	// Up
		document.getElementById("debug").innerHTML = "UpUp";
	} else if (event.keyCode == 39) {	// Right
		document.getElementById("debug").innerHTML = "RightUp";
	} else if (event.keyCode == 40) {	// Down
		document.getElementById("debug").innerHTML = "DownUp";
	}
}