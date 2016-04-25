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

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
  	var index = clients.indexOf(socket.id);
  	clients.slice(index, 1);
  	console.log('a user disconnected');
  });
  
  clients.push(socket.id);
});

var canvasWidth = 500;
var canvasHeight = 500;

var timeRemaining = 60;

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

console.log("Executed app.js");

var clients = [];

io.sockets.on('connection', function(socket){
	socket.on('disconnect', function(){
		
	});
	io.emit('test', new Sphere(30, 30, "yellow"));
	console.log("Server received connection");
});