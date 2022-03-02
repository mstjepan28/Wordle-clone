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

  <div class="game-container">
    <div id="countdown" class="game-countdown">Loading...</div>

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

    <div class="game-keyboard"></div>
  </div>
</template>

<script>
import wordList from "./assets/wordList.js";

export default {
	data() {
		return{
			curSession: {word: "humor"},
			coolDown: false,

			countdownTime: 0,
			countDownInterval: null,
			timeAllowed: 1000 * 60 * 60,
			wordList: [],
		}
	},
	methods: {
		randInt(min, max){
			return Math.floor(Math.random() * (max - min + 1) + min)
		},

		formatTimeElapsed(timeElapsed){
			let minutes = Math.floor(timeElapsed / 60) + "";
			let seconds = Math.floor(timeElapsed % 60) + "";

			minutes = minutes.split("").length == 1? `0${minutes}`: minutes;
			seconds = seconds.split("").length == 1? `0${seconds}`: seconds;

			return `${minutes}:${seconds}`
		},

		getRandomWord(){
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

		startNewSession(){
			document.getElementById("resultModal").style.display = "none";

			this.getRandomWord();
			location.reload();
		},

		terminateSession(isWordGuessed, customMessage){
			clearInterval(this.countDownInterval);

			const timePassed = (this.timeAllowed / 1000) - this.countdownTime

			const gameOutcome = customMessage? customMessage: isWordGuessed? "You got it!": "Game over";
			const gameResult = isWordGuessed? `Your time: ${this.formatTimeElapsed(timePassed)}`: `The word was: ${this.curSession.word.toUpperCase()}`;

			document.getElementById("game-outcome").innerText = gameOutcome;
			document.getElementById("game-result").innerText = gameResult;
			document.getElementById("resultModal").style.display = "initial";

			this.curSession.sessionTerminated = 1;
			this.updateLocalStorage();
		},

		startCountdown(timeLeft){
			const countDown = document.getElementById("countdown");
			this.countdownTime = Math.ceil(timeLeft / 1000)

			this.countDownInterval = setInterval(() => {
				this.countdownTime -= 1;

				countDown.innerText = this.formatTimeElapsed(this.countdownTime);

				if(countDown == 0) this.terminateSession(false, "Game over - time ran out");
			}, 1000)
		},

		showPreviousInputs(){
			this.curSession.guessList.forEach((guess, guessIndex) => {
				const letterGuesses = this.getGuessDomElement(guessIndex + 1).children;

				guess.guess.forEach((letter, letterIndex) => {
					let childElement = [...letterGuesses][letterIndex];

					childElement.innerText = letter.toUpperCase();
					childElement.style.background = guess.score[letterIndex];
					childElement.style.border = `1px solid ${guess.score[letterIndex]}`;
				})
			});

			const curLetterGuess = this.getGuessDomElement(false).children

			this.curSession.curGuess.forEach((letter, letterIndex) => {
				let childElement = [...curLetterGuess][letterIndex];
				childElement.innerText = letter.toUpperCase();
			})
		},

		loadSession(){
			this.curSession = JSON.parse(localStorage.getItem("session"));

			if(!this.curSession || this.curSession?.sessionTerminated == 1)
				return this.startNewSession();

			const timePassed = Date.now() - this.curSession.startTime;

			if(timePassed > this.timeAllowed)
				return this.terminateSession(false, "Game over - time ran out");

			this.showPreviousInputs();
			this.startCountdown(this.timeAllowed - timePassed);
		},

		getGuessDomElement(guessIndex){
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

		scoreInput(){
			const score = [];

			this.curSession.curGuess.forEach((letter, index) => {
				if(this.curSession.word[index] == letter)
					score.push("#577F45");
				else if(this.curSession.word.indexOf(letter) != -1)
					score.push("#c9b458");
				else
					score.push("#5e6468");
			})

			return {
				guess: this.curSession.curGuess,
				score: score
			};
		},

		displayScore(score){
			const letterGuesses = this.getGuessDomElement(false).children;

			score.guess.forEach((letter, letterIndex) => {
				setTimeout(() => {
					let childElement = [...letterGuesses][letterIndex];

					childElement.innerText = letter.toUpperCase();
					childElement.style.background = score.score[letterIndex];
					childElement.style.border = `1px solid ${score.score[letterIndex]}`;

					childElement.classList.remove("pop");
					childElement.classList.add("revealLetter");
				}, 500 * letterIndex)
			})
		},

		addNewKey(newKey){
			if(this.curSession.curGuess.length >= 5) return;
			this.curSession.curGuess.push(newKey);

			const letterGuesses = this.getGuessDomElement(false).children;
			const childElement = [...letterGuesses][this.curSession.curGuess.length - 1];

			childElement.innerText = newKey.toUpperCase();
			childElement.classList.add("pop")

			this.updateLocalStorage();
		},

		deleteLastInput(){
			if(this.curSession.curGuess.length == 0) return;

			const letterGuesses = this.getGuessDomElement(false).children;
			const childElement = [...letterGuesses][this.curSession.curGuess.length - 1];

			childElement.innerText = "";
			childElement.classList.remove("pop")

			this.curSession.curGuess.pop();

			this.updateLocalStorage();
		},

		unknownWordHandler(){
			console.log("word not in word list!");

			this.coolDown = false;

			return;
		},

		validateInput(){
			if(this.coolDown) return;
			this.coolDown = true;
			setTimeout(() => this.coolDown = false, 2500);

			if(this.curSession.curGuess.length != 5) return;

			const wordIndex = this.wordList.indexOf(this.curSession.curGuess.join(""));
			if(wordIndex == -1) return this.unknownWordHandler();

			const score = this.scoreInput();
			this.displayScore(score);

			if(this.curSession.word == this.curSession.curGuess.join(""))
				return setTimeout(() => this.terminateSession(true, null), 2750)

			this.curSession.guessList.push(score)
			this.curSession.curGuess = []

			this.updateLocalStorage();

			if(this.curSession.guessList.length >= 5)
				this.terminateSession(false, null);
		},

		updateLocalStorage(){
			localStorage.clear();
			localStorage.setItem("session", JSON.stringify(this.curSession));
		},

		keyPressHandler(event){
			if(this.coolDown) return;

			const validKeys = "abcdefghijklmnopqrstuvwxyz";
			const isValidKey = validKeys.indexOf(event.key)

			if(isValidKey != -1) return this.addNewKey(event.key);

			const keyHandler = {
				Backspace: () => this.deleteLastInput(),
				Enter: () => this.validateInput(),
			}
			keyHandler[event.key]?.();
		}
	},
	mounted(){
		this.wordList = wordList.wordList;

		document.addEventListener("keydown", this.keyPressHandler);
		document.getElementById("playAgainButton").addEventListener("click", this.startNewSession);

		this.loadSession();
	}
}
</script>

<style lang="scss">
@import "./styles/style.scss";

</style>
