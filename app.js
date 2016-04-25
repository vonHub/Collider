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
			this.changeSpeed(-.2);
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
		var factor = speed / getSpeed;
		this.xVel *= factor;
		this.yVel *= factor;
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
};

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
		
		playerOne.move();
		playerTwo.move();
		console.log("Player one x: " + playerOne.x);
		console.log("Player two x: " + playerTwo.x);
		
		io.emit('playerOne', playerOne);
		io.emit('playerTwo', playerTwo);
		
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