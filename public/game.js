var socket = io();

function start() {
	
}

document.onkeydown = keyDown;

function keyDown(event) {
	// document.getElementById("lblTime").innerHTML = "Hey, it worked!";
	event = event || window.event;
	
	if (event.keyCode == 37) {	// Left
		document.getElementById("lblTime").innerHTML = "Left";
	} else if (event.keyCode == 38) {	// Up
		document.getElementById("lblTime").innerHTML = "Up";
	} else if (event.keyCode == 39) {	// Right
		document.getElementById("lblTime").innerHTML = "Right";
	} else if (event.keyCode == 40) {	// Down
		document.getElementById("lblTime").innerHTML = "Down";
	}
}