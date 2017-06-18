// Generate a random position on the canvas
function randomPosition(canvas) {
	var can = canvas || document.getElementById("canvas");
	var x, y;
	// x value
	x = can.width * Math.random();
	// y value
	y = can.height * Math.random();
	return {x: x, y: y};
}
// Generate rgba values in preformatted string
function genRGBA(pR, pG, pB, pA) {
	var r = pR || Math.floor(Math.random() * 256);
	var g = pG || Math.floor(Math.random() * 256);
	var b = pB || Math.floor(Math.random() * 256);
	var a = pA || Math.random();
	return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}
// convert window coords to canvas coords
function windowToCanvas(canvas, x, y) {
	var can = canvas || document.getElementById("canvas");
	var bbox = can.getBoundingClientRect();
	
	return { x: Math.floor(x - bbox.left * (can.width / bbox.width)),
			 y: Math.floor(y - bbox.top * (can.height / bbox.height))
	};
}
// Clear the given canvas with the given fill or white if none is provided
function clearCanvas(canvas, fill) {
	var can = canvas || document.getElementById("canvas");
	ctx.fillStyle = fill || "rgba(255,255,255,1)";
	ctx.fillRect(0,0,can.width, can.height);
	ctx.beginPath();
}