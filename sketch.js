let video
let poseNet
let leftWristPos
let rightWristPos
let poses = []
let song = 0
let text_song = "La valse d'Amélie"
var piano = {
	vals: undefined,
	classic: undefined,
	volume: 0,
	currentTime: 0,
}
var violin = {
	vals: undefined,
	classic: undefined,
	volume: 0,
	currentTime: 0,
}
var guitar = {
	vals: undefined,
	classic: undefined,
	volume: 0,
	currentTime: 0,
}

var button
let volume_left
let volume_right
let boolean_guitar = 0
let boolean_violin = 0
let boolean_piano = 0
let guitarImage
let pianoImage
let violinImage
let entro
let r_hand = 0
let l_hand = 0 // we need to determine which hand activates each instrument
const CONFIDENCE_THRESHOLD = 0.3

// all files needed to be loaded are in preload funciton
function preload() {
	guitarImage = loadImage('./images/guitar.png')
	pianoImage = loadImage('./images/piano.png')
	violinImage = loadImage('./images/violin.jpeg')
	piano = {
		...piano,
		vals: loadSound('./music/piano_vals.mp3'),
		classic: loadSound('./music/piano_chopin.mp3'),
	}
	guitar = {
		...guitar,
		vals: loadSound('./music/guitar_vals.mp3'),
		classic: loadSound('./music/guitar_chopin.mp3'),
	}
	violin = {
		...violin,
		vals: loadSound('./music/violin_vals.mp3'),
		classic: loadSound('./music/violin_chopin.mp3'),
	}
}

function setImages() {
	image(guitarImage, 56, 10, 80, 80)
	image(violinImage, 270, 10, 80, 80)
	image(pianoImage, 483, 10, 80, 80)
}

function setup() {
	createCanvas(640, 580)
	video = createCapture(VIDEO)
	video.size(width, 480)
	setImages()
	translate(video.width, 0)
	scale(-1, 1)
	image(video, 0, 0, video.width, video.height)

	// Create a new poseNet method with a single detection
	poseNet = ml5.poseNet(video, modelReady)
	// This sets up an event that fills the global variable "poses"
	// with an array every time new poses are detected
	poseNet.on('pose', function (results) {
		if (results.length > 0) {
			poses = results
			leftWristPos = poses[0].pose.leftWrist
			rightWristPos = poses[0].pose.rightWrist
		}
	})
	console.log(piano.classic.isLoaded())
	// piano = new Audio('./music/piano_vals.mp3')
	// guitar = new Audio('./music/guitar_vals.mp3')
	// violin = new Audio('./music/violin_vals.mp3')

	piano.volume = 0
	guitar.volume = 0
	violin.volume = 0

	button = createButton('Songs')
	button.style('background-color', color(200, 255, 255))
	button.mousePressed(ChangeSong)

	// Hide the video element, and just show the canvas
	video.hide()
}

function ChangeSong() {
	song = song + 1
	if (song >= 2) {
		song = 0
	}
	if (song == 0) {
		text_song = "La valse d'Amélie"
		piano.vals.play()
		guitar.vals.play()
		violin.vals.play()
		piano.classic.pause()
		guitar.classic.pause()
		violin.classic.pause()
		// piano.pause()
		// guitar.pause()
		// violin.pause()
		//text(text_song,posX,posY);

		// piano = new Audio('./music/piano_vals.mp3')
		// guitar = new Audio('./music/guitar_vals.mp3')
		// violin = new Audio('./music/violin_vals.mp3')
	} else if (song == 1) {
		text_song = 'Nocturne Op. 9 No. 2'
		piano.classic.play()
		guitar.classic.play()
		violin.classic.play()
		piano.vals.pause()
		guitar.vals.pause()
		violin.vals.pause()
		// piano.pause()
		// guitar.pause()
		// violin.pause()
		//text(text_song,posX,posY);

		// piano = new Audio('./music/piano_chopin.mp3')
		// guitar = new Audio('./music/guitar_chopin.mp3')
		// violin = new Audio('./music/violin_chopin.mp3')
	}
	//to reset sketch: window.location.reload()
}

function draw() {
	translate(video.width, 0)
	scale(-1, 1)
	image(video, 0, 100, width, 480)

	// We can call both functions to draw all keypoints and the skeletons
	if (poses.length > 0) {
		drawKeypoints() //draw points in the hands
		WhatInstrumentSounds() //tells which instruments are about to sound, and the hand that indicates it
		VolumeToSound() //tells the volume and starts playing the music
	}
	drawLines()

	// drawSkeleton()
}

function drawLines() {
	line(213, 0, 213, 580)
	line(426, 0, 426, 580)
	strokeWeight(4)
	stroke(255, 204, 0)
}
// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
	// Loop through all the poses detected
	if (leftWristPos.confidence > CONFIDENCE_THRESHOLD) {
		fill(0, 255, 0, 100)

		//noStroke()
		ellipse(leftWristPos.x, leftWristPos.y, 40, 40)
	}
	if (rightWristPos.confidence > CONFIDENCE_THRESHOLD) {
		fill(0, 0, 255, 100)

		//noStroke()
		ellipse(rightWristPos.x, rightWristPos.y, 40, 40)
	}
}

function WhatInstrumentSounds() {
	if (rightWristPos.confidence > CONFIDENCE_THRESHOLD && leftWristPos.confidence > CONFIDENCE_THRESHOLD) {
		// l/r_hand 0 -> no instrument
		// l/r_hand 1 -> piano
		// l/r_hand 2 -> violin
		// l/r_hand 3 -> guitar

		if (rightWristPos.x <= 213) {
			boolean_piano = 1
			boolean_violin = 0
			boolean_guitar = 0
			r_hand = 1
		} else if (rightWristPos.x <= 426) {
			boolean_violin = 1
			boolean_guitar = 0
			boolean_piano = 0
			r_hand = 2
		} else if (rightWristPos.x <= 640) {
			boolean_guitar = 1
			boolean_violin = 0
			boolean_piano = 0
			r_hand = 3
		}

		if (leftWristPos.x <= 213) {
			boolean_piano = 1
			l_hand = 1
		} else if (leftWristPos.x <= 426) {
			boolean_violin = 1
			l_hand = 2
		} else if (leftWristPos.x <= 640) {
			boolean_guitar = 1
			l_hand = 3
		}
	}

	if (rightWristPos.confidence > CONFIDENCE_THRESHOLD && leftWristPos.confidence <= CONFIDENCE_THRESHOLD) {
		l_hand = 0
		if (rightWristPos.x <= 213.0) {
			boolean_piano = 1
			boolean_violin = 0
			boolean_guitar = 0
			r_hand = 1
		} else if (rightWristPos.x <= 426.0) {
			boolean_violin = 1
			boolean_guitar = 0
			boolean_piano = 0
			r_hand = 2
		} else if (rightWristPos.x <= 640.0) {
			boolean_guitar = 1
			boolean_violin = 0
			boolean_piano = 0
			r_hand = 3
		}
	}

	if (leftWristPos.confidence > CONFIDENCE_THRESHOLD && rightWristPos.confidence <= CONFIDENCE_THRESHOLD) {
		r_hand = 0

		if (leftWristPos.x <= 213) {
			boolean_piano = 1
			boolean_violin = 0
			boolean_guitar = 0
			l_hand = 1
		} else if (leftWristPos.x <= 426) {
			boolean_violin = 1
			boolean_guitar = 0
			boolean_piano = 0
			l_hand = 2
		} else if (leftWristPos.x <= 640) {
			boolean_guitar = 1
			boolean_violin = 0
			boolean_piano = 0
			l_hand = 3
		}
	}

	if (leftWristPos.confidence <= CONFIDENCE_THRESHOLD && rightWristPos.confidence <= CONFIDENCE_THRESHOLD) {
		boolean_violin = 0
		boolean_guitar = 0
		boolean_piano = 0
		r_hand = 0
		l_hand = 0
	}
}
//console.log('lw', 1-Math.round10(rightWristPos.y / height,-2))
function VolumeToSound() {
	volume_right = 1 - Math.round10(rightWristPos.y / height, -2)
	if (volume_right < 0) {
		volume_right = 0
	} else if (volume_right > 1) {
		volume_right = 1
	}

	volume_left = 1 - Math.round10(leftWristPos.y / height, -2)
	if (volume_left < 0) {
		volume_left = 0
	} else if (volume_left > 1) {
		volume_left = 1
	}

	if (boolean_piano == 1) {
		if (r_hand == 1) {
			piano.volume = volume_right
		} else if (l_hand == 1) {
			piano.volume = volume_left
		}
	} else {
		piano.volume = 0
	}

	if (boolean_violin == 1) {
		if (r_hand == 2) {
			violin.volume = volume_right
		} else if (l_hand == 2) {
			violin.volume = volume_left
		}
	} else {
		violin.volume = 0
	}

	if (boolean_guitar == 1) {
		if (r_hand == 3) {
			guitar.volume = volume_right
		} else if (l_hand == 3) {
			guitar.volume = volume_left
		}
	} else {
		guitar.volume = 0
	}
}

;(function () {
	/**
	 * Ajuste decimal de un número.
	 *
	 * @param {String}  tipo  El tipo de ajuste.
	 * @param {Number}  valor El numero.
	 * @param {Integer} exp   El exponente (el logaritmo 10 del ajuste base).
	 * @returns {Number} El valor ajustado.
	 */
	function decimalAdjust(type, value, exp) {
		// Si el exp no está definido o es cero...
		if (typeof exp === 'undefined' || +exp === 0) {
			return Math[type](value)
		}
		value = +value
		exp = +exp
		// Si el valor no es un número o el exp no es un entero...
		if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
			return NaN
		}
		// Shift
		value = value.toString().split('e')
		value = Math[type](+(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp)))
		// Shift back
		value = value.toString().split('e')
		return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp))
	}

	// Decimal round
	if (!Math.round10) {
		Math.round10 = function (value, exp) {
			return decimalAdjust('round', value, exp)
		}
	}
	// Decimal floor
	if (!Math.floor10) {
		Math.floor10 = function (value, exp) {
			return decimalAdjust('floor', value, exp)
		}
	}
	// Decimal ceil
	if (!Math.ceil10) {
		Math.ceil10 = function (value, exp) {
			return decimalAdjust('ceil', value, exp)
		}
	}
})()

function modelReady() {
	console.log('Model Ready!!!')
}
