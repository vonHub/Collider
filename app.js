/*eslint-env node, browser*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com

/* // Original code here
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
*/

var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
var express = require('express');
var app = express();	app.use(express.static(__dirname + '/public'));
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(appEnv.port, function(){
	console.log('Listening on ' + appEnv.port);
});

var canvasWidth = 500;
var canvasHeight = 500;

var timeRemaining = 60;

function Sphere(x, y, color) {
	this.x = x;
	this.y = y;
	this.color = color;
	this.radius = 15;
	this.acceleration = .2;
	this.maxSpeed = 30;
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
			this.changeSpeed(-.3);
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

function Bumper(x, y){
	this.x = x;
	this.y = y;
	this.radius = 15;
}

var playerOne = new Sphere(15, 15, "green");
var playerTwo = new Sphere(485, 485, "blue");
var playerOneScore = 0;
var playerTwoScore = 0;

var bumpers = [];
var bumperOne = new Bumper(canvasWidth*1/3, canvasHeight*1/3);
var bumperTwo = new Bumper(canvasWidth*1/3, canvasHeight*2/3);
var bumperThree = new Bumper(canvasWidth*2/3, canvasHeight*1/3);
var bumperFour = new Bumper(canvasWidth*2/3, canvasHeight*2/3);
//var bumpers = [bumperOne, bumperTwo, bumperThree, bumperFour];
bumpers.push(bumperOne);
bumpers.push(bumperTwo);
bumpers.push(bumperThree);
bumpers.push(bumperFour);

// console.log("Executed app.js");

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
};

function checkBumperCollision(player) {
	for (var i = 0; i < 4; i++) {
		var b = bumpers[i];
		var distance = (b.x - player.x) * (b.x - player.x);
		distance += (b.y - player.y) * (b.y - player.y);
		distance = Math.sqrt(distance);
		if (distance < b.radius + player.radius){	// Collided with bumper
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
		}
	}
}

function checkPlayerCollision(){
	var diffY = playerOne.y - playerTwo.y;
	var diffX = playerOne.x - playerTwo.x;
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
		if (phi < 0) phi += Math.PI;
		var playerOneAngle;
		if (playerOne.xVel == 0) {
			playerOneAngle = Math.PI/2;
		} else {
			playerOneAngle = Math.atan(playerOne.yVel/playerOne.xVel);
		}
		if (playerOne.xVel < 0) playerOneAngle += Math.PI;
		var playerTwoAngle;
		if (playerTwo.xVel == 0) {
			playerTwoAngle = Math.PI/2;
		} else {
			playerTwoAngle = Math.atan(playerTwo.yVel/playerTwo.xVel);
		}
		if (playerTwo.xVel < 0) playerTwoAngle += Math.PI;
		var playerOneSpeed = playerOne.getSpeed();
		var playerTwoSpeed = playerTwo.getSpeed();
		
		playerOneAngle -= phi;
		playerTwoAngle -= phi;
		
		playerOne.xVel = playerTwoSpeed * Math.cos(playerTwoAngle);
		playerOne.yVel = playerOneSpeed * Math.sin(playerOneAngle);
		playerTwo.xVel = playerOneSpeed * Math.cos(playerOneAngle);
		playerTwo.yVel = playerTwoSpeed * Math.sin(playerTwoAngle);
		
		playerOneSpeed = playerOne.getSpeed();
		playerTwoSpeed = playerTwo.getSpeed();
		
		playerOneAngle += phi;
		playerTwoAngle += phi;
		
		playerOne.xVel = playerOneSpeed * Math.cos(playerOneAngle);
		playerOne.yVel = playerOneSpeed * Math.sin(playerOneAngle);
		playerTwo.xVel = playerTwoSpeed * Math.cos(playerTwoAngle);
		playerTwo.yVel = playerTwoSpeed * Math.sin(playerTwoAngle);
	}
}

var clients = [];
var advanceGame;

io.sockets.on('connection', function(socket){
	
    console.log('a user connected');
	
	socket.on('disconnect', function(){
		var index = clients.indexOf(socket.id);
		if (index >= 0) clients.splice(index, 1);
  		console.log('a user disconnected');
	});
	
	if (clients.length < 2 && clients.indexOf(socket.id) < 0) {
		clients.push(socket.id);		
	}
	
	if (clients.length == 2) {
		playerOne.id = clients[0];
		playerTwo.id = clients[1];
		io.emit('playerOne', playerOne);
		io.emit('playerTwo', playerTwo);
		io.emit('bumpers', bumpers);
	}
	
	advanceGame = setInterval(function(){
		
		io.emit('getInputs');
		
		checkBumperCollision(playerOne);
		checkBumperCollision(playerTwo);
		checkPlayerCollision();
		
		playerOne.move();
		playerTwo.move();
		
		io.emit('playerOne', playerOne);
		io.emit('playerTwo', playerTwo);
		io.emit('scores', [playerOneScore, playerTwoScore]);
		
		io.emit('draw');
		
	}, 30);
	
	socket.on('inputs', function(inputs){
		
		console.log("Inputs received");
		if (playerOne.id == socket.id) {
			processInputs(playerOne, inputs);
			console.log("Player one input: " + inputs[0] + " " + inputs[1] + " " + inputs[2] + " " + inputs[3]);
		} else if (playerTwo.id == socket.id) {
			processInputs(playerTwo, inputs);
			console.log("Player two input: " + inputs[0] + " " + inputs[1] + " " + inputs[2] + " " + inputs[3]);
		}
		
	});
});