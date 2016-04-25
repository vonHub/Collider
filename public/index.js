/*eslint-env browser */
var xmlhttp = new XMLHttpRequest();
var url = "../app.js";

xmlhttp.open("GET", url, true);
xmlhttp.send();
console.log("Executed index.js");

function openGame() {
	window.open("game.html", '_self');	// Replace current page	
}

socket.on('test', function(){
	document.getElementById("debug").innerHTML = "test received";
	socket.emit('received');
});