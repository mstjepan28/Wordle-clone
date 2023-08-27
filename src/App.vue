<template>
	<div id="resultModal" class="modal">
		<div id="modalBody" class="modal-body">
			<h2 id="game-outcome"></h2>
			<h3 id="game-result"></h3>
			<button id="playAgainButton" class="playAgainButton" type="click">
				Play Again
			</button>
		</div>
	</div>

	<div class="colorPicketToggle">
		<button v-if="colorPickerOpened" type="button" :onClick="() => setColorPickerOpened(false)">
			<KeyboardIcon />
		</button>
		<button v-else type="button" :onClick="() => setColorPickerOpened(true)">
			<ColorIcon />
		</button>
	</div>

	<div class="game-container">
		<div></div>
		<div id="countdown" class="game-countdown"></div>

		<div class="game-guesses">
			<div class="guess-instance firstGuess">
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
			</div>
			<div class="guess-instance secondsGuess">
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
			</div>
			<div class="guess-instance thirdGuess">
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
			</div>
			<div class="guess-instance fourthGuess">
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
			</div>
			<div class="guess-instance fifthGuess">
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
				<div class="guess-letter"></div>
			</div>
		</div>

		<div v-if="colorPickerOpened">
			<ColorPicker @changePalette="setColorPalette" />
		</div>
		<div v-else>
			<OnScreenKeyBoard :totalScores="totalScores" @input="addNewKey" @delete="deleteLastInput"
				@validate="validateInput" />
		</div>
	</div>
</template>

<script>
import wordList from "./assets/wordList.js";
import ColorIcon from "./components/ColorIcon.vue";
import ColorPicker from "./components/ColorPicker.vue";
import KeyboardIcon from "./components/KeyboardIcon.vue";
import OnScreenKeyBoard from "./components/onScreenKeyBoard.vue"

export default {
	components: { OnScreenKeyBoard, KeyboardIcon, ColorIcon, ColorPicker },
	data() {
		return {
			colorPickerOpened: false,
			colorPalette: {},

			curSession: { word: "humor" },
			coolDown: false,

			countdownTime: 0,
			countDownInterval: null,
			timeAllowed: 1000 * 60 * 60,
			wordList: [],

			totalScores: {}
		}
	},
	methods: {
		setColorPickerOpened(state) {
			this.colorPickerOpened = state;
		},

		setColorPalette(paletteColors) {
			const defaultPalette = {
				background: "#171a1b",
				correct: "#577F45",
				misplaced: "#c9b458",
				wrong: "#5e6468",
			}

			this.colorPalette = paletteColors || defaultPalette;
			document.body.style.backgroundColor = this.colorPalette.background;
		},

		randInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min)
		},

		formatTimeElapsed(timeElapsed) {
			let minutes = Math.floor(timeElapsed / 60) + "";
			let seconds = Math.floor(timeElapsed % 60) + "";

			minutes = minutes.split("").length == 1 ? `0${minutes}` : minutes;
			seconds = seconds.split("").length == 1 ? `0${seconds}` : seconds;

			return `${minutes}:${seconds}`
		},

		getRandomWord() {
			const randIndex = this.randInt(0, this.wordList.length - 1);

			this.curSession = {
				word: this.wordList[randIndex],
				startTime: Date.now(),

				guessList: [],
				curGuess: [],

				sessionTerminated: false
			}

			this.updateLocalStorage();
		},

		startNewSession() {
			document.getElementById("resultModal").style.display = "none";

			this.getRandomWord();
			location.reload();
		},

		terminateSession(isWordGuessed, customMessage) {
			clearInterval(this.countDownInterval);

			const timePassed = (this.timeAllowed / 1000) - this.countdownTime

			const gameOutcome = customMessage ? customMessage : isWordGuessed ? "You got it!" : "Game over";
			const gameResult = isWordGuessed ? `Your time: ${this.formatTimeElapsed(timePassed)}` : `The word was: ${this.curSession.word.toUpperCase()}`;

			document.getElementById("game-outcome").innerText = gameOutcome;
			document.getElementById("game-result").innerText = gameResult;
			document.getElementById("resultModal").style.display = "initial";
			document.getElementById("resultModal").style.backgroundColor = isWordGuessed? this.colorPalette.correct: this.colorPalette.wrong;

			this.curSession.sessionTerminated = 1;
			this.updateLocalStorage();

			localStorage.removeItem("session");
			localStorage.setItem("session", JSON.stringify(this.curSession));
		},

		startCountdown(timeLeft) {
			const countDown = document.getElementById("countdown");
			this.countdownTime = Math.ceil(timeLeft / 1000)
			countDown.innerText = this.formatTimeElapsed(this.countdownTime);

			this.countDownInterval = setInterval(() => {
				this.countdownTime -= 1;

				countDown.innerText = this.formatTimeElapsed(this.countdownTime);

				if (countDown == 0) {
					this.terminateSession(false, "Game over - time ran out");
				}
			}, 1000)
		},

		showPreviousInputs() {
			this.curSession.guessList.forEach((guess, guessIndex) => {
				const letterGuesses = this.getGuessDomElement(guessIndex + 1).children;

				guess.guess.forEach((letter, letterIndex) => {
					let childElement = [...letterGuesses][letterIndex];
					const score = guess.score[letterIndex];
					const color = this.colorPalette[score];
					console.log(score, color)

					childElement.innerText = letter.toUpperCase();
					childElement.style.background = color;
					childElement.style.border = `1px solid ${color}`;

					this.totalScores[letter] = color;
				})
			});

			const curLetterGuess = this.getGuessDomElement(false).children

			this.curSession.curGuess.forEach((letter, letterIndex) => {
				let childElement = [...curLetterGuess][letterIndex];
				childElement.innerText = letter.toUpperCase();
			})
		},

		loadSession() {
			this.curSession = JSON.parse(localStorage.getItem("session"));

			const palette = JSON.parse(localStorage.getItem("colorPalette"));
			this.setColorPalette(palette);

			if (!this.curSession || this.curSession?.sessionTerminated == 1)
				return this.startNewSession();

			const timePassed = Date.now() - this.curSession.startTime;

			if (timePassed > this.timeAllowed)
				return this.terminateSession(false, "Game over - time ran out");

			this.showPreviousInputs();
			this.startCountdown(this.timeAllowed - timePassed);
		},

		getGuessDomElement(guessIndex) {
			const domElementClass = {
				1: "firstGuess",
				2: "secondsGuess",
				3: "thirdGuess",
				4: "fourthGuess",
				5: "fifthGuess"
			}
			const selectedKey = guessIndex || this.curSession.guessList.length + 1;
			const className = domElementClass[selectedKey];

			return document.querySelector(`div.${className}`);
		},

		scoreInput() {
			const score = [];

			this.curSession.curGuess.forEach((letter, index) => {
				let newScore = null;

				if (this.curSession.word[index] == letter)
					newScore = "correct"//this.colorPalette.correct || "#577F45";
				else if (this.curSession.word.indexOf(letter) != -1)
					newScore = "misplaced"//this.colorPalette.misplaced || "#c9b458";
				else
					newScore = "wrong"//this.colorPalette.wrong || "#5e6468";

				score.push(newScore);
			})

			return {
				guess: this.curSession.curGuess,
				score: score
			};
		},

		displayScore(score) {
			const letterGuesses = this.getGuessDomElement(false).children;

			score.guess.forEach((letter, letterIndex) => {
				setTimeout(() => {
					let childElement = [...letterGuesses][letterIndex];
					const letterScore = score.score[letterIndex];
					const color = this.colorPalette[letterScore];

					childElement.innerText = letter.toUpperCase();
					childElement.style.background = color;
					childElement.style.border = `1px solid ${color}`;

					childElement.classList.remove("pop");
					childElement.classList.add("revealLetter");

					this.totalScores[letter] = color;
				}, 500 * letterIndex)
			})
		},

		addNewKey(newKey) {
			if (this.curSession.curGuess.length >= 5) return;
			this.curSession.curGuess.push(newKey);

			const letterGuesses = this.getGuessDomElement(false).children;
			const childElement = [...letterGuesses][this.curSession.curGuess.length - 1];

			childElement.innerText = newKey.toUpperCase();
			childElement.classList.add("pop")

			this.updateLocalStorage();
		},

		deleteLastInput() {
			if (this.curSession.curGuess.length == 0) return;

			const letterGuesses = this.getGuessDomElement(false).children;
			const childElement = [...letterGuesses][this.curSession.curGuess.length - 1];

			childElement.innerText = "";
			childElement.classList.remove("pop")

			this.curSession.curGuess.pop();

			this.updateLocalStorage();
		},

		unknownWordHandler() {
			console.log("word not in word list!");

			this.coolDown = false;

			return;
		},

		validateInput() {
			if (this.coolDown) return;
			this.coolDown = true;
			setTimeout(() => this.coolDown = false, 2500);

			if (this.curSession.curGuess.length != 5) return;

			const wordIndex = this.wordList.indexOf(this.curSession.curGuess.join(""));
			if (wordIndex == -1) return this.unknownWordHandler();

			const score = this.scoreInput();
			this.displayScore(score);

			if (this.curSession.word == this.curSession.curGuess.join(""))
				return setTimeout(() => this.terminateSession(true, null), 2750)

			this.curSession.guessList.push(score)
			this.curSession.curGuess = []

			this.updateLocalStorage();

			if (this.curSession.guessList.length >= 5)
				this.terminateSession(false, null);
		},

		updateLocalStorage() {
			localStorage.removeItem("session");
			localStorage.setItem("session", JSON.stringify(this.curSession));
		},

		keyPressHandler(event) {
			if (this.coolDown) return;

			const validKeys = "abcdefghijklmnopqrstuvwxyz";
			const isValidKey = validKeys.indexOf(event.key)

			if (isValidKey != -1) return this.addNewKey(event.key);

			const keyHandler = {
				Backspace: () => this.deleteLastInput(),
				Enter: () => this.validateInput(),
			}
			keyHandler[event.key]?.();
		}
	},
	mounted() {
		this.wordList = wordList.wordList;

		document.addEventListener("keydown", this.keyPressHandler);
		document.getElementById("playAgainButton").addEventListener("click", this.startNewSession);

		this.loadSession();
	}
}
</script>

<style lang="scss">
@import "./styles/style.scss";

#app {
	width: 100%;
	height: 100%;
}

.colorPicketToggle {
	position: absolute;
	right: 0;

	&>button {
		padding: 1rem;

		background: none;
		outline: none;
		border: none;
	}
}

.modal {
	width: 100vw;
	height: 100vh;

	position: absolute;
	top: 0;
	left: 0;
	z-index: 10;

	display: none;

	background: rgba($gray, 0.5);

	.modal-body {
		width: 75%;
		min-width: 400px;
		max-width: 750px;

		min-height: 250px;

		font-size: 36px;
		font-weight: bold;
		color: white;

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		row-gap: 3rem;

		padding: 2rem 0;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		h2,
		h3 {
			text-align: center;
		}

		.playAgainButton {
			margin-top: 1.5rem;
			padding: 0 1rem 0.25rem 1rem;

			font-size: 36px;
			font-weight: bold;
			color: white;

			cursor: pointer;
			border: none;

			background: none;

			&:focus,
			&:hover {
				border-bottom: 1px solid white;
				outline: none;
			}
		}
	}
}

.pop {
	animation: expandAnimation 0.125s;

	@keyframes expandAnimation {
		0% {
			transform: scale(1);
		}

		50% {
			transform: scale(1.25);
		}

		100% {
			transform: scale(1);
		}
	}
}

.revealLetter {
	animation: revealLetterAnimation 0.75s cubic-bezier(.01, 1.36, .77, .69) both;

	@keyframes revealLetterAnimation {
		0% {
			transform: translateY(0) scale(1);
		}

		50% {
			transform: translateY(-1rem) scale(1.1);
		}

		100% {
			transform: translateY(0) scale(1);
		}
	}
}

.game-container {
	height: 100%;

	display: flex;
	justify-content: center;
	flex-direction: column;

	.game-countdown {
		margin: 0 auto;

		font-size: 48px;
		color: white;
	}

	.game-guesses {
		display: flex;
		align-items: center;
		flex-direction: column;

		gap: 1.5rem;
		margin: 4rem 0;

		.guess-instance {
			display: flex;
			justify-content: space-between;

			gap: 1rem;

			.guess-letter {
				--letterBox-size: 75px;
				--letterBox-font: 40px;

				width: 75px;
				aspect-ratio: 1/1;

				display: flex;
				justify-content: center;
				align-items: center;

				font-size: 40px;
				font-weight: bold;
				color: white;

				border: 1px solid $white;
			}
		}
	}
}

@media only screen and (max-width: 650px) {
	.guess-letter {
		width: 50px !important;
		font-size: 30px !important;
	}
}

@media only screen and (max-width: 650px) {
	.guess-letter {
		width: 50px !important;
		font-size: 30px !important;
	}
}

@media only screen and (max-height: 700px) {
	.game-guesses {
		margin: 2rem 0 !important;
		gap: 0.75rem !important;

		.guess-instance {
			gap: 0.25rem !important;
		}
	}
}

@media only screen and (max-height: 600px) {
	.game-guesses {
		margin: 0.5rem !important;
		gap: 0.75rem !important;
	}
}
</style>
