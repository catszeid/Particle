/*
Author: Keith Maitland
Notes: Use a starting particles amount that is low to avoid overworking the browser and freezing it
*/
function $(id) {
	return document.getElementById(id);
}

// canvas being drawn on
var canvas;
// context to the canvas
var ctx;
// Array of particles on the canvas
var particles;
// is the game running currently?
var running = false;
// size of normal particles
var particleSize;
// Colors to be used with particles
var colors;
// shapes that a particle can be
var shapes;
// rate at which the simulation will update
var updateSpeed;
// number of particles to generate when starting a new simulation
var startingParticles;
// Number of frames that have passed in this simulation
var frames;

// When window ready and loaded
window.onload = function() {
	canvas = $("canvas");
	// set context of the canvas
	ctx = canvas.getContext("2d");
	
	// Initalize variables
	initialize();
	
	// Listeners for input
	$("start").addEventListener("click",start);
	$("stop").addEventListener("click",stop);
	$("reload").addEventListener("click",newSim);
	
	// Canvas click listener
	$("canvas").addEventListener("click", function(e) { canvasClick(e)});
	
	// Start new sim
	newSim();
}

// Simulation controllers
// Start calling updates
function start() {
	if (!running) {
		console.log("Starting simulation...");
		// start updating again
		running = true;
		// call update
		update();
	}
	// otherwise do nothing
}
// Stop calling updates
function stop() {
	if (running) {
		console.log("Stopping simulation...")
		// stop updating
		running = false;
	}
	// otherwise do nothing
}
// Update to the next frame
function update() {
	if (running) {
		frames++;
		updateFramesCount();
		// check for collisions
		checkCollision(particles);
		// update positions
		for (var i = 0, len = particles.length; i < len; i++) {
			particles[i].position = particles[i].projected();
		}
		clearCanvas(canvas);
		// repaint particles
		drawParticles(particles);
		// call next update
		getUpdateSpeed();
		//setTimeout(update, 1000 / updateSpeed);
		setTimeout(function() {
			requestAnimationFrame(update);
		}, 1000 / updateSpeed);
	}
}
// Create a new simulation
function newSim() {
	console.log("Generating new simulation...");
	// clear canvas
	clearCanvas(canvas);
	// refresh option values
	getUpdateSpeed();
	getStartingParticles();
	getParticleSize();
	particles = [];
	// Generate new particles
	generateParticles();
	frames = 0;
	// Draw initialized particles
	drawParticles(particles);
	console.log("Simulation generated! Starting it now!")
	// reset running and started
	start();
	
}
// canvas clicked
function canvasClick(e) {
	var click = windowToCanvas(canvas, e.clientX, e.clientY);
	//var pos = new Position(click.x,click.y);
	//particles.push(new Particle(pos, new Velocity(),particleSize,"square",genRGBA()));
	// get index of clicked particle
	var count = 0;
	/*var part = new Particle(new Position(click.x,click.y), new Velocity(), 1, "square", "#000");
	while (count < particles.length && !detectParticleCollsion(particles[count]),part) {
		count++
	}*/
	while (count < particles.length && particles[count].position.x != click.x && particles[count].position.y != click.y) {
		count++;
	}
	if(count < particles.length) {
		console.log(count);
	}
}

// Collision
// wrapper that runs the collision detection methods
function checkCollision(particles) {
	// if the particles overlap in position there is a collision
	//var collisions = [];
	var result;
	for (var i = 0, len = particles.length; i < len; i++) {
		for (var j = 0; j < len; j++) {
			// check if already collided
			//if (i != j && (!collisions.includes(i) || !collisions.includes(j))) {
			if (i !== j) {
				result = detectParticleCollision(particles[i],particles[j]);
				if (result.collided) {
					plane = {x: true,y:true};
					collisionResult(particles[i], "stick", plane);
					collisionResult(particles[j], "stick", plane);
				}
				//collisions.push(i);
				//collisions.push(j);
			}
		}
	}
	//collisions = [];
	for (var i = 0, len = particles.length; i < len; i++) {
		// check border collision
		result = detectBorderCollision(particles[i]);
		if (result.x || result.y) {
			collisionResult(particles[i], "bounce", result);
		}
	}
}
// detect collision between two particles
function detectParticleCollision(particle1, particle2) {
	var col = {};
	col.collided = false;
	col.plane = {x: false, y: false};
	// x collision
	if (particle1.position.x - particle1.size/2 <= particle2.position.x + particle2.size/2 && particle1.position.x + particle1.size/2 >= particle2.position.x - particle2.size/2 && particle1.position.y - particle1.size/2 <= particle2.position.y + particle2.size/2 && particle1.position.y + particle1.size/2 >= particle2.position.y - particle2.size/2) {
		// collision
		col.collided = true;
	}
	//if (particle1.position.y - particle1.size/2 <= particle2.position.y + particle2.size/2 && particle1.position.y + particle1.size/2 >= particle2.position.y - particle2.size/2) {
		// y collision
		//col.y = true;
	// }
	// compare center positions to get the plane of colision
	if (Math.abs(particle1.position.x - particle2.position.x) > Math.abs(particle1.position.y - particle2.position.y)) {
		col.plane.x = true;
	}
	else {
		col.plane.y = true;
	}
	return col;
}
// detect collision with border
function detectBorderCollision(particle) {
	var col = {x: false, y: false};
	// if top border collision
	if (particle.position.y - particle.size/2 <= 0) {
		col.y = true;
	}
	// if bottom border collion
	else if (particle.position.y + particle.size/2 >= canvas.height) {
		col.y = true;
	}
	// if right border collision
	if (particle.position.x - particle.size/2 <= 0) {
		col.x = true;
	}
	// if left border collision
	else if (particle.position.x + particle.size/2 >= canvas.width) {
		col.x = true;
	}
	return col;
}
// Collision response on the particle
function collisionResult(colParticle, colType, planes) {
	plane = planes;
	switch(colType) {
		case "bounce":
			// invert x velocity
			if (plane.x) {
				colParticle.velocity.x *= -1;
			}
			// invert y velocity
			else if (plane.y){
				colParticle.velocity.y *= -1;
			}
			break;
		case "stick":
			// stop motion of particle
			if (plane.x) {
				colParticle.velocity.x = 0;
			}
			if (plane.y) {
				colParticle.velocity.y = 0;
			}
			break;
		default:
			// error to console
			console.log("No collision of type " + collision);
			break;
	}
	updateFramesCount();
}


// Drawing Functions
// Draw all particles
function drawParticles(particleList) {
	for (var i = 0, len = particles.length; i < len; i++) {
		particles[i].draw();
	}
}
// Update the frame counter on the page
function updateFramesCount() {
	$("frames").innerHTML = frames;
}


// Generate a new set of particles
function generateParticles() {
	for(var i = 0; i < startingParticles; i++) {
		//var position = new Position(200,200);
		particles[i] = new Particle(new Position(), randomVelocity(), particleSize, "square", genRGBA());
	}
}

// Initalize variable values
function initialize() {
	console.log("Initializing variables...");
	particles = [];
	running = false;
	colors = ["red"];
	shapes = ["circle","square"];
	getUpdateSpeed();
	getStartingParticles();
	getParticleSize();
	frames = 0;
	console.log("Done initializing variables!");
}


// Getter functions to get information from the html inputs
// Update Speed in number of frames per second
function getUpdateSpeed() {
	updateSpeed = $('updateSpeed').value;
}
// Starting Particles
function getStartingParticles() {
	startingParticles = $('startingParticles').value;
}
// Particle Size
function getParticleSize() {
	particleSize = $('particleSize').value;
}

// Constructors
// Position
function Position(x, y) {
	this.x = x || canvas.width * Math.random();
	this.y = y || canvas.height * Math.random();
}
// Velocity
function Velocity(x, y) {
	this.x = x || 2 * Math.random() - 1;
	this.y = y || 2 * Math.random() - 1;
}
// Particle
function Particle(position, velocity, size, shape, color) {
	// center of the particle
	this.position = position || randomPosition();
	this.velocity = velocity || randomVelocity();
	this.size = size || particleSize;
	this.shape = shape || "square";
	this.color = color || genRGBA();
}
// projected position for  the Particle based on current velocity
Particle.prototype.projected = function() {
	return new Position(this.position.x + this.velocity.x, this.position.y + this.velocity.y);
}
// draw function for Particles
Particle.prototype.draw = function() {
	switch (this.shape) {
		case "circle":
			// draw a circle
			ctx.beginPath();
			ctx.arc(this.position.x, this.position.y, this.size/2, 0, 2*Math.PI);
			ctx.fillStyle = this.color;
			ctx.fill();
			break;
		case "square":
			// draw a square with position at center
			ctx.beginPath();
			// resizing draw
			//ctx.rect(this.position.x - this.size/2, this.position.y - this.size/2, this.position.x + this.size/2, this.position.y + this.size/2);
			ctx.rect(this.position.x - this.size/2, this.position.y - this.size/2, this.size, this.size);
			ctx.fillStyle = this.color;
			ctx.fill();
			break;
		default:
			console.log("Invalid shape for drawing particle");
	}
}


// Utility functions
// Generate a random velocity with a default range of -5 to 5 for x and y
function randomVelocity(maxX, maxY) {
	var x = maxX || 1,
		y = maxY || 1;
	// x value
	x = maxX * 2 * Math.random() - maxX;
	// y value
	y = maxY * 2 * Math.random() - maxY;
	return new Velocity(x,y);
}
// Generate a random position on the canvas
function randomPosition(canvas) {
	var can = canvas || document.getElementById("canvas");
	var x, y;
	// x value
	x = (can.width + 2*particleSize - 1) * Math.random() - particleSize;
	// y value
	y = can.height * Math.random();
	return {x: x, y: y};
}
// make a blue color RGBA string
function blue() {
	var r = 0;
	var g = 0;
	var b = Math.floor(Math.random() * 128 + 128);
	var a = Math.random();
	return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}
// Dump all data
function dump() {
	console.log("Dumping data...");
	console.log("Running:"+running);
	console.log("Update Speed:"+updateSpeed);
	console.log("Starting Particles:"+startingParticles);
	console.log("Number of particles:"+particles.length);
	console.log("Shapes:"+shapes);
	console.log("Colors:"+colors);
	console.log("Particles:"+particles);
	console.log("Done dumping data!");
}
// Flashing party lights!
function rave() {
	if (running) {
		clearCanvas(canvas,genRGBA());
		getUpdateSpeed();
		setTimeout(function() {
			requestAnimationFrame(rave);
		}, 100);
	}
}
