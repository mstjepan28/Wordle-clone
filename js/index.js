let curSession = {}
let countDownInterval = null;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

function getRandomWord(){
    const randIndex = randInt(0, wordList.length - 1);
    
    curSession = {
        word: wordList[randIndex],
        startTime: Date.now(),

        guessList: [],
        curGuess: [],

        sessionTerminated: false
    }

    updateLocalStorage();
}

function startNewSession(){
    console.log("Starting new session")

    getRandomWord();
    loadSession();
}

function terminateSession(){
    clearInterval(countDownInterval);

    console.log("game over")

    curSession.sessionTerminated = 1;
    localStorage.setItem("sessionTerminated", 1)
}

function wordGuessed(){
    clearInterval(countDownInterval);

    console.log("word guessed")

    curSession.sessionTerminated = 1;
    localStorage.setItem("sessionTerminated", 1)
}

function startCountdown(countdownTime){
    const countDown = document.getElementById("countdown");
    countdownTime = Math.ceil(countdownTime / 1000)
    
    countDownInterval = setInterval(() => {
        countdownTime -= 1;

        let minutes = Math.floor(countdownTime / 60) + "";
        let seconds = Math.floor(countdownTime % 60) + "";

        minutes = minutes.split("").length == 1? `0${minutes}`: minutes;
        seconds = seconds.split("").length == 1? `0${seconds}`: seconds;

        countDown.innerText = `${minutes}:${seconds}`

        if(countDown == 0) terminateSession();
    }, 1000)
}

function showPreviousInputs(){
    curSession.guessList.forEach((guess, guessIndex) => {
        const letterGuesses = getGuessDomElement(guessIndex + 1).children;

        guess.guess.forEach((letter, letterIndex) => {
            childElement = [...letterGuesses][letterIndex];

            childElement.innerText = letter.toUpperCase();
            childElement.style.background = guess.score[letterIndex];
            childElement.style.border = `1px solid ${guess.score[letterIndex]}`;
        })
    });

    const curLetterGuess = getGuessDomElement(false).children

    curSession.curGuess.forEach((letter, letterIndex) => {
        childElement = [...curLetterGuess][letterIndex];
        childElement.innerText = letter.toUpperCase();
    })
}

function loadSession(){
    if(localStorage.getItem("sessionTerminated") == 1) return startNewSession();

    curSession = JSON.parse(localStorage.getItem("session"));

    const timeDifference = Date.now() - (curSession?.startTime || 0);
    const oneHour = 1000 * 60 * 60;

    if(timeDifference > oneHour) return startNewSession();

    showPreviousInputs();
    startCountdown(oneHour - timeDifference);
}

function getGuessDomElement(guessIndex){
    const domElementClass = {
        1: "firstGuess",
        2: "secondsGuess",
        3: "thirdGuess",
        4: "fourthGuess",
        5: "fifthGuess"
    }
    const selectedKey = guessIndex || curSession.guessList.length + 1;
    const className = domElementClass[selectedKey];

    return document.querySelector(`div.${className}`);
}

function scoreInput(){
    const score = [];

    curSession.curGuess.forEach((letter, index) => {
        if(curSession.word[index] == letter) 
            score.push("#577F45");
        else if(curSession.word.indexOf(letter) != -1)
            score.push("#c9b458");
        else
            score.push("#5e6468");
    })

    return {
        guess: curSession.curGuess, 
        score: score
    };
}

function displayScore(score){
    const letterGuesses = getGuessDomElement(false).children;

    score.guess.forEach((letter, letterIndex) => {
        setTimeout(() => {
            childElement = [...letterGuesses][letterIndex];
    
            childElement.innerText = letter.toUpperCase();
            childElement.style.background = score.score[letterIndex];
            childElement.style.border = `1px solid ${score.score[letterIndex]}`;
    
            childElement.classList.remove("pop");
            childElement.classList.add("flip");
        }, 500 * letterIndex)
    })
}

function addNewKey(newKey){
    if(curSession.curGuess.length >= 5) return;
    curSession.curGuess.push(newKey);

    //document.getElementById("resultModal").style.opacity = "1";

    const letterGuesses = getGuessDomElement(false).children;
    const childElement = [...letterGuesses][curSession.curGuess.length - 1];

    childElement.innerText = newKey.toUpperCase();
    childElement.classList.add("pop")

    updateLocalStorage();
}

function deleteLastInput(){
    if(curSession.curGuess.length == 0) return;

    const letterGuesses = getGuessDomElement(false).children;
    const childElement = [...letterGuesses][curSession.curGuess.length - 1];

    childElement.innerText = "";
    childElement.classList.remove("pop")

    curSession.curGuess.pop();

    updateLocalStorage();
}

function validateInput(){
    if(curSession.curGuess.length != 5) return;

    const wordIndex = wordList.indexOf(curSession.curGuess.join(""));
    if(wordIndex == -1) return console.log("word not in word list");

    const score = scoreInput();
    displayScore(score);

    if(curSession.word == curSession.curGuess.join("")) 
        return wordGuessed();

    curSession.guessList.push(score)
    curSession.curGuess = []

    updateLocalStorage();

    if(curSession.guessList.length >= 5) 
        terminateSession(); 
}

function updateLocalStorage(){
    localStorage.clear();
    localStorage.setItem("session", JSON.stringify(curSession));
}

function keyPressHandler(event){
    const validKeys = "abcdefghijklmnopqrstuvwxyz";
    const isValidKey = validKeys.indexOf(event.key)

    if(isValidKey != -1) return addNewKey(event.key);

    const keyHandler = {
        Backspace: () => deleteLastInput(),
        Enter: () => validateInput(),
    }
    keyHandler[event.key]?.();
}

document.addEventListener("keydown", keyPressHandler)

loadSession();