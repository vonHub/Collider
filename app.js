/*eslint-env node, browser*/

// Written by Chris Von Hoene for CS 252 final project.

// Set up initial environment variables
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
var express = require('express');
var app = express();	app.use(express.static(__dirname + '/public'));
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(appEnv.port, function(){
	console.log('Listening on ' + appEnv.port);
});

// Canvas dimensions
var canvasWidth = 500;
var canvasHeight = 500;

// Player object
function Sphere(x, y, color) {
	this.x = x;
	this.y = y;
	this.color = color;
	this.radius = 15;
	this.acceleration = .15;
	this.maxSpeed = 5;
	this.xVel = 0;
	this.yVel = 0;
	this.id = 0;
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
		if (this.getSpeed() > this.maxSpeed) {
			this.xVel = this.xVel * .95;
			this.yVel = this.yVel * .95;
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
		var speed = getSpeed();
		speed += delta;
		if (speed < 0) speed = 0;
		if (getSpeed() != 0) {
			var factor = speed / getSpeed();
			this.xVel *= factor;
			this.yVel *= factor;
		}

	};
	this.setPosition = function(x, y){
		this.x = x; this.y = y;
	};
}

// Bumper object
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

// Init players
var playerOne = new Sphere(15, 15, "green");
var playerTwo = new Sphere(485, 485, "blue");
var playerOneScore = 0;
var playerTwoScore = 0;
var clients = [];

function initPlayers(){
	playerOne.x = 15;
	playerOne.y = 15;
	playerTwo.x = 485;
	playerTwo.y = 485;
	playerOne.xVel = 0;
	playerTwo.xVel = 0;
	playerOne.yVel = 0;
	playerTwo.yVel = 0;
	playerOneScore = 0;
	playerTwoScore = 0;
}

// Init bumpers
var bumpers = [];
var bumperOne = new Bumper(canvasWidth*1/4, canvasHeight*3/4);
var bumperTwo = new Bumper(canvasWidth*3/4, canvasHeight*1/4);
bumpers.push(bumperOne);
bumpers.push(bumperTwo);

// Take inputs and move players accordingly
function processInputs(player, inputs){
	if (inputs[0] == 1){	// Left
		player.changeXVel(-player.acceleration);
	}	
	if (inputs[1] == 1){	// Up
		player.changeYVel(-player.acceleration);
	}
	if (inputs[2] == 1){	// Right
		player.changeXVel(player.acceleration);
	}
	if (inputs[3] == 1){	// Down
		player.changeYVel(player.acceleration);
	}
	if (inputs[4] == 1){	// Brake
		player.changeYVel(-player.acceleration);
	}
}

// Check for player collision with bumpers
function checkBumperCollision(player) {
	for (var i = 0; i < bumpers.length; i++) {
		var b = bumpers[i];
		var distance = (b.x - player.x) * (b.x - player.x);
		distance += (b.y - player.y) * (b.y - player.y);
		distance = Math.sqrt(distance);
		if (distance < b.radius + player.radius){	// Collided with bumper
		
			b.hitTimer = b.hitTime;
		
			if (player == playerOne) {
				playerTwoScore++;
			} else if (player == playerTwo) {
				playerOneScore++;
			}
			// So the velocity of the player needs to be
			// reflected over the line between the bumper
			// and the player.
			var yDiff = b.y - player.y;
			var xDiff = b.x - player.x;
			
			// Sophisticated, but buggy implementation
			/*
			if (xDiff == 0) {	// Hit exact top of bumper
				player.yVel = -player.yVel;
			} else {
				var slope = yDiff / xDiff;
				var phi;
				if (player.xVel == 0) {	// Heading straight down
					phi = Math.PI/2;
				} else {
					var playerSlope = player.yVel / player.xVel;
					phi = Math.atan(playerSlope);
				}
				var theta = Math.atan(slope);
				phi = theta + (theta - phi);
				var speed = player.getSpeed();
				if (player.x > b.x) {
					player.xVel = Math.cos(phi) * speed;
					player.yVel = Math.sin(phi) * speed;
				} else {
					player.xVel = -Math.cos(phi) * speed;
					player.yVel = -Math.sin(phi) * speed;
				}
			}
			// Now move to the edge of the bumper
			while (distance < b.radius + player.radius) {
				player.x += player.xVel * .01;
				player.y += player.yVel * .01;
				distance = (b.x - player.x) * (b.x - player.x);
				distance += (b.y - player.y) * (b.y - player.y);
				distance = Math.sqrt(distance);
			}
			*/
			
			// Simple, robust implementation
			// Good enough
			var mag = xDiff * xDiff + yDiff * yDiff;
			mag = Math.sqrt(mag);
			xDiff /= mag;
			yDiff /= mag;
			player.xVel = player.maxSpeed * -xDiff;
			player.yVel = player.maxSpeed * -yDiff;
		}
	}
}

// Check if players hit each other
function checkPlayerCollision(){
	var diffY = playerTwo.y - playerOne.y;
	var diffX = playerTwo.x - playerOne.x;
	//[diffX, diffY] is now a vector pointing from playerOne to playerTwo
	var distance = diffX * diffX;
	distance += diffY * diffY;
	distance = Math.sqrt(distance);
	if (distance < playerOne.radius + playerTwo.radius){	// Collided with each other
		// I want this to be a perfectly elastic collision.
		// How to calculate...
		var phi;
		if (diffX == 0) {
			phi = Math.PI/2;
		} else {
			phi = Math.atan(diffY/diffX);
		}
		
		// Very simple bouncing physics
		diffX = diffX / distance * playerOne.maxSpeed;
		diffY = diffY / distance * playerOne.maxSpeed;
		playerTwo.xVel = diffX;
		playerTwo.yVel = diffY;
		playerOne.xVel = -diffX;
		playerOne.yVel = -diffY;
	}
}

// Advance bumper timers
function processBumpers(){
	for (var i = 0; i < bumpers.length; i++) {
		bumpers[i].act();
	}
}

function prepareArena(){
	initPlayers();
}

// Clear arena and display victory message
function finishGame(){
	io.emit('clear');
	var victor;
	if (playerOneScore > playerTwoScore) {
		victor = "PLAYER 1 WINS!";
	} else if (playerTwoScore > playerOneScore) {
		victor = "PLAYER 2 WINS!";
	} else {
		victor = "TIE!";
	}
	io.emit('victory', victor);
}

// Set up time variables
var timeBetween = 5000;	// 4 seconds
var betweenGames = 0;
var gameDuration = 60000;
var gameTime = 0;	// 60 seconds
var frameTime = 15;	// 15 milliseconds

function initTimers(){
	betweenGames = timeBetween;
	gameTime = 0;
}

var info;

var advanceGame;

io.sockets.on('connection', function(socket){
	
    console.log('a user connected');
	
	// Remove from array and stop game
	socket.on('disconnect', function(){
		var index = clients.indexOf(socket.id);
		if (index >= 0) clients.splice(index, 1);
  		console.log('a user disconnected');
  		if (clients.length == 1) {	// Player quit the game
  			clearInterval(advanceGame);
  			finishGame();
  			initTimers();
  			io.emit('info', "Waiting for player 2");
  		}
	});
	
	// React to inputs from clients
	socket.on('inputs', function(inputs){
		
		//console.log("Inputs received");
		if (playerOne.id == socket.id) {
			processInputs(playerOne, inputs);
			//io.emit('debug', "Received");
			//console.log("Player one input: " + inputs[0] + " " + inputs[1] + " " + inputs[2] + " " + inputs[3]);
		} else if (playerTwo.id == socket.id) {
			processInputs(playerTwo, inputs);
			//console.log("Player two input: " + inputs[0] + " " + inputs[1] + " " + inputs[2] + " " + inputs[3]);
		} else {
			//io.emit('debug', "Wrong socket id");
		}
		
	});
	
	// Add client if 0 or 1 players already connected
	if (clients.length < 2 && clients.indexOf(socket.id) < 0) {
		clients.push(socket.id);		
	}
	
	// Start game if two players are connected
	if (clients.length == 2) {
		playerOne.id = clients[0];
		playerTwo.id = clients[1];
		betweenGames = timeBetween;
		io.emit('playerOne', playerOne);
		io.emit('playerTwo', playerTwo);
		io.emit('bumpers', bumpers);		
		
	
		advanceGame = setInterval(function(){
			
			if (betweenGames > 0) {
				
				betweenGames -= frameTime;
				if (betweenGames <= 0) {
					betweenGames = 0;
					gameTime = gameDuration;
					prepareArena();
				}
				var seconds = Math.ceil(betweenGames / 1000);
				info = "Match starts in " + seconds;
				io.emit('info', info);
				
			} else if (betweenGames <= 0) {
			
				io.emit('getInputs');
				
				checkBumperCollision(playerOne);
				checkBumperCollision(playerTwo);
				checkPlayerCollision();
				
				playerOne.move();
				playerTwo.move();
				processBumpers();
				
				io.emit('playerOne', playerOne);
				io.emit('playerTwo', playerTwo);
				io.emit('scores', [playerOneScore, playerTwoScore]);
				io.emit('bumpers', bumpers);
				
				io.emit('draw');
				
				gameTime -= frameTime;
				if (gameTime <= 0) {
					gameTime = 0;
					betweenGames = timeBetween;
					finishGame();
				}
				
				var timeRemaining = Math.ceil(gameTime / 1000);
				info = "Time remaining: " + timeRemaining;
				io.emit('info', info);
			}
			
		}, frameTime);
	}
});