let video
let poseNet
let poses = []
// Wrist variables
let leftWrist, rightWrist
// Instrument variables
let piano, guitar, violin
// Songs variables
let pianoVals, pianoClassic, violinVals, violinClassic, guitarVals, guitarClassic
//Instrument images
let guitarImage, pianoImage, violinImage
// Target Areas variables
let targetArea1, targetArea2, targetArea3, targetArea4
// CONFIDENCE WRIST DETECTION
const CONFIDENCE_THRESHOLD = 0.5

// CLASSES

class Game {
	constructor(start) {
		this.start = start
	}
}

class Instrument {
	constructor(vals, classic, volume, threshold = { bottom, top }, areaNumber) {
		this.vals = vals
		this.classic = classic
		this.volume = volume
		this.currentTime = 0
		this.isPlaying = false
		this.threshold = threshold
		this.areaNumber = areaNumber
	}

	setVolume(volume) {
		this.volume = volume
	}

	isPlayingSong() {
		return this.classic.isPlaying() || this.vals.isPlaying()
	}

	playVals() {
		this.vals.play()
		this.vals.setVolume(this.volume)
	}

	stopVals() {
		this.vals.stop()
	}

	playClassic() {
		this.classic.play()
		this.classic.setVolume(this.volume)
	}

	stopClassic() {
		this.classic.stop()
	}

	isInActiveArea(xCoord) {
		return xCoord >= this.threshold.bottom && xCoord <= this.threshold.top
	}
}

class Wrist {
	constructor(xCoord, yCoord, confidence) {
		this.xCoord = xCoord
		this.yCoord = yCoord
		this.confidence = confidence
		this.isActive = this.confidence >= CONFIDENCE_THRESHOLD
	}

	getActiveArea() {
		return this.activeArea
	}

	getIsActive() {
		return this.isActive
	}

	getXCoord() {
		return this.xCoord
	}

	setXCoord(xCoord) {
		this.xCoord = xCoord
	}

	setYCoord(yCoord) {
		this.yCoord = yCoord
	}

	setIsActive(isActive) {
		this.isActive = isActive
	}

	getTargetArea(targetAreas) {
		let overArea = 0
		targetAreas.forEach(targetArea => {
			if (targetArea.isOverTargetArea(this)) {
				overArea = targetArea.areaNumber
			}
		})
		console.log(overArea)
		return overArea
	}

	mapPositionToVolume(height) {
		let volumeWrist

		volumeWrist = 1 - Math.round10(this.yCoord / height, -2)

		if (volumeWrist < 0) {
			return 0
		} else if (volumeWrist > 1) {
			return 1
		}

		return volumeWrist
	}

	display() {
		if (this.confidence >= CONFIDENCE_THRESHOLD) {
			fill(0, 255, 0, 100)
			ellipse(this.xCoord, this.yCoord, 40, 40)
		}
	}
}

class WristDetector {
	constructor(diameter, xPosition, yPosition, wrist) {
		this.diameter = diameter
		this.xPosition = xPosition
		this.yPosition = yPosition
		this.wrist = wrist
	}

	setCoordinates(xPosition, yPosition) {
		this.xPosition = xPosition
		this.yPosition = yPosition
	}

	display(xPosition, yPosition) {
		this.setCoordinates(xPosition, yPosition)
		ellipse(this.xPosition, this.yPosition, this.diameter)
	}
}

class TargetArea {
	constructor(xCoord, yCoord, width, height, color, areaNumber) {
		this.xCoord = xCoord
		this.yCoord = yCoord
		this.width = width
		this.height = height
		this.color = color
		this.areaNumber = areaNumber
	}

	isOverTargetArea(wrist) {
		return (
			wrist.xCoord > this.xCoord &&
			wrist.xCoord < this.xCoord + this.width &&
			wrist.yCoord > this.yCoord &&
			wrist.yCoord < this.yCoord + this.height
		)
	}

	display() {
		fill(this.color)
		rect(this.xCoord, this.yCoord, this.width, this.height)
	}
}

// all files needed to be loaded are in preload funciton
function preload() {
	guitarImage = loadImage('./images/guitar.png')
	pianoImage = loadImage('./images/piano.png')
	violinImage = loadImage('./images/violin.jpeg')
	pianoVals = loadSound('./music/piano_vals.mp3')
	pianoClassic = loadSound('./music/piano_chopin.mp3')
	guitarVals = loadSound('./music/guitar_vals.mp3')
	guitarClassic = loadSound('./music/guitar_chopin.mp3')
	violinVals = loadSound('./music/violin_vals.mp3')
	violinClassic = loadSound('./music/violin_chopin.mp3')
}

function setup() {
	createCanvas(640, 580)
	video = createCapture(VIDEO)
	video.size(width, 480)

	translate(video.width, 0)
	scale(-1, 1)
	image(video, 0, 0, video.width, video.height)
	// Create instrument instances
	piano = new Instrument(pianoVals, pianoClassic, 0, { bottom: 0, top: 213 }, 1)
	violin = new Instrument(violinVals, violinClassic, 0, { bottom: 213, top: 426 }, 2)
	guitar = new Instrument(guitarVals, guitarClassic, 0, { bottom: 426, top: 640 }, 3)
	// Create a new poseNet method with a single detection
	poseNet = ml5.poseNet(video, modelReady)
	// This sets up an event that fills the global variable "poses"
	// with an array every time new poses are detected
	poseNet.on('pose', function (poses) {
		if (poses.length > 0) {
			// Create Wrists instances in case poses are detected
			leftWrist = new Wrist(poses[0].pose.leftWrist.x, poses[0].pose.leftWrist.y, poses[0].pose.leftWrist.confidence)
			rightWrist = new Wrist(
				poses[0].pose.rightWrist.x,
				poses[0].pose.rightWrist.y,
				poses[0].pose.rightWrist.confidence
			)

			// setHandDetection()
			// WhatInstrumentSounds()
		}
	})
	button = createButton('Songs')
	button.style('background-color', color(200, 255, 255))

	// Hide the video element, and just show the canvas
	video.hide()
}

function setupReady() {
	if (typeof targetArea4 === 'undefined') return false
	if (typeof leftWrist === 'undefined') return false
	if (typeof rightWrist === 'undefined') return false
	return true
}

function draw() {
	translate(video.width, 0)
	scale(-1, 1)
	image(video, 0, 100, width, 480)

	// We can call both functions to draw all keypoints and the skeletons
	// Validate all the necesary elements
	drawTargetAreas(width, height)

	if (setupReady()) {
		drawKeypoints() //draw points in the hands
		rightWrist.getTargetArea([targetArea1, targetArea2, targetArea3, targetArea4])
	}
	// drawSkeleton()
}

// DRAW FUNCTIONS
function drawTargetAreas(canvasWidth, canvasHeight) {
	targetArea1 = new TargetArea(canvasWidth / 4, canvasHeight / 4, 60, 60, 'green', 2)
	targetArea2 = new TargetArea((canvasWidth / 4) * 3, canvasHeight / 4, 60, 60, '#EF8069', 1)
	targetArea3 = new TargetArea(canvasWidth / 4, (canvasHeight / 4) * 3, 60, 60, '#EF8069', 4)
	targetArea4 = new TargetArea((canvasWidth / 4) * 3, (canvasHeight / 4) * 3, 60, 60, '#EF8069', 3)
	let targetAreas = [targetArea1, targetArea2, targetArea3, targetArea4]
	targetAreas.forEach(targetArea => targetArea.display())
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
	// Loop through all the poses detected
	leftWrist.display()
	rightWrist.display()
}

function setHandDetection() {
	if (rightWristPos.confidence > CONFIDENCE_THRESHOLD && leftWristPos.confidence > CONFIDENCE_THRESHOLD) {
		handDetection = {
			any: {
				...handDetection.any,
				isActive: false,
			},
			left: {
				...handDetection.left,
				isActive: true,
			},
			right: {
				...handDetection.right,
				isActive: true,
			},
		}
	} else if (rightWristPos.confidence > CONFIDENCE_THRESHOLD && leftWristPos.confidence <= CONFIDENCE_THRESHOLD) {
		handDetection = {
			any: {
				...handDetection.any,
				isActive: false,
			},
			left: {
				...handDetection.left,
				isActive: false,
			},
			right: {
				...handDetection.right,
				isActive: true,
			},
		}
	} else if (rightWristPos.confidence < CONFIDENCE_THRESHOLD && leftWristPos.confidence >= CONFIDENCE_THRESHOLD) {
		handDetection = {
			any: {
				...handDetection.any,
				isActive: false,
			},
			left: {
				...handDetection.left,
				isActive: true,
			},
			right: {
				...handDetection.right,
				isActive: false,
			},
		}
	} else {
		handDetection = {
			any: {
				...handDetection.any,
				isActive: true,
			},
			left: {
				...handDetection.left,
				isActive: false,
			},
			right: {
				...handDetection.right,
				isActive: false,
			},
		}
	}
}

function setWristActiveArea(wrist) {
	let wristXCoord = wrist.getXCoord()
	if (wrist.isActive()) {
	}
}

function WhatInstrumentSounds() {
	// let { any, left, right } = handDetection
	let instruments = [piano, guitar, violin]
	if (!handDetection.any.isActive) {
		if (handDetection.left.isActive) {
			instruments.forEach(instrument => {
				if (
					handDetection.left.xCoord > instrument.threshhold.bottom &&
					handDetection.left.xCoord <= instrument.threshhold.top
				) {
					handDetection.left = {
						...handDetection.left,
						instrument: instrument,
						volume: getVolumeFromWrist(handDetection.left),
					}
				}
			})
		}
		if (handDetection.right.isActive) {
			instruments.forEach(instrument => {
				if (
					handDetection.right.xCoord > instrument.threshhold.bottom &&
					handDetection.right.xCoord <= instrument.threshhold.top
				) {
					handDetection.right = {
						...handDetection.right,
						instrument: instrument,
						volume: getVolumeFromWrist(handDetection.right),
					}
					playSong()
				}
			})
		}
	} else {
		handDetection.left.instrument = undefined
		handDetection.right.instrument = undefined
	}
}

function VolumeToSound() {
	volume_right = getVolumeFromWrist(rightWristPos)
	volume_left = getVolumeFromWrist(leftWristPos)

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

function getVolumeFromWrist(wrist) {
	let volumeWrist

	volumeWrist = 1 - Math.round10(wrist.yCoord / height, -2)

	if (volumeWrist < 0) {
		return 0
	} else if (volumeWrist > 1) {
		return 1
	}

	return volumeWrist
}

function playSong() {
	if (handDetection.right.isActive) {
		if (!handDetection.right.instrument.vals.isPlaying()) {
			handDetection.right.instrument.vals.play()
			handDetection.right.instrument.vals.setVolume(handDetection.right.volume)
		}
	} else if (!handDetection.right.isActive) {
		handDetection.right.instrument.vals.pause()
	}

	// if (handDetection.left.isActive && !handDetection.left.instrument.vals.isPlaying()) {
	// 	handDetection.left.instrument.vals.play()
	// 	handDetection.left.instrument.vals.setVolume(handDetection.left.volume)
	// } else {
	// 	handDetection.right.instrument.vals.pause()
	// }
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
