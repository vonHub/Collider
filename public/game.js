/*eslint-env browser */
/*globals io */

// Written by Chris Von Hoene

// Client has two main jobs: relay player inputs and display the arena.

var socket = io();

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

// Relay player inputs to server
socket.on('getInputs', function(){
	socket.emit('inputs', inputs);
	socket.emit('test', "data");
	document.getElementById('debug').innerHTML = "Inputs: " + inputs[0] + " " + inputs[1] + " " + inputs[2] + " " + inputs[3];
});

socket.on('scores', function(scores){
	var text = "Player 1: " + scores[0] + "         Player 2: " + scores[1];
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

// Debug element is commented out of game.html
// Needs to be put back in for this to work
socket.on('debug', function(data){
	//document.getElementById("debug").innerHTML = data;
});

// Draws the arena
function draw(){
	clearCanvas();
	drawPlayer(playerOne);
	drawPlayer(playerTwo);
	drawBumpers();
}

// Clears the arena
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

// Get inputs from keyboard

document.onkeydown = keyDown;
document.onkeyup = keyUp;

function keyDown(event) {
	event = event || window.event;
	
	if (event.keyCode == 37) {	// Left
		//document.getElementById("debug").innerHTML = "Left";
		inputs[0] = 1;
	} else if (event.keyCode == 38) {	// Up
		//document.getElementById("debug").innerHTML = "Up";
		inputs[1] = 1;
	} else if (event.keyCode == 39) {	// Right
		//document.getElementById("debug").innerHTML = "Right";
		inputs[2] = 1;
	} else if (event.keyCode == 40) {	// Down
		//document.getElementById("debug").innerHTML = "Down";
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