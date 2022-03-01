let curSession = {word: "humor"};
let coolDown = false;

let countdownTime = 0;
let countDownInterval = null;
const timeAllowed = 1000 * 60 * 60;


const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

function formatTimeElapsed(timeElapsed){
    let minutes = Math.floor(timeElapsed / 60) + "";
    let seconds = Math.floor(timeElapsed % 60) + "";

    minutes = minutes.split("").length == 1? `0${minutes}`: minutes;
    seconds = seconds.split("").length == 1? `0${seconds}`: seconds;

    return `${minutes}:${seconds}`
}

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
    document.getElementById("resultModal").style.display = "none";

    getRandomWord();
    location.reload();
}

function terminateSession(isWordGuessed, customMessage){
    clearInterval(countDownInterval);

    const timePassed = (timeAllowed / 1000) - countdownTime

    const gameOutcome = customMessage? customMessage: isWordGuessed? "You got it!": "Game over";
    const gameResult = isWordGuessed? `Your time: ${formatTimeElapsed(timePassed)}`: `The word was: ${curSession.word.toUpperCase()}`;

    document.getElementById("game-outcome").innerText = gameOutcome;
    document.getElementById("game-result").innerText = gameResult;
    document.getElementById("resultModal").style.display = "initial";
    
    curSession.sessionTerminated = 1;
    updateLocalStorage();
}

function startCountdown(timeLeft){
    const countDown = document.getElementById("countdown");
    countdownTime = Math.ceil(timeLeft / 1000)
    
    countDownInterval = setInterval(() => {
        countdownTime -= 1;

        countDown.innerText = formatTimeElapsed(countdownTime);

        if(countDown == 0) terminateSession(false, "Game over - time ran out");
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
    curSession = JSON.parse(localStorage.getItem("session"));

    if(!curSession || curSession?.sessionTerminated == 1) 
        return startNewSession();

    const timePassed = Date.now() - curSession.startTime;

    if(timePassed > timeAllowed) 
        return terminateSession(false, "Game over - time ran out");

    showPreviousInputs();
    startCountdown(timeAllowed - timePassed);
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
            childElement.classList.add("revealLetter");
        }, 500 * letterIndex)
    })
}

function addNewKey(newKey){
    if(curSession.curGuess.length >= 5) return;
    curSession.curGuess.push(newKey);

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

function unknownWordHandler(){
    console.log("word not in word list!");

    coolDown = false;

    return;
}

function validateInput(){
    if(coolDown) return;
    coolDown = true;
    setTimeout(() => coolDown = false, 2500);

    if(curSession.curGuess.length != 5) return;

    const wordIndex = wordList.indexOf(curSession.curGuess.join(""));
    if(wordIndex == -1) return unknownWordHandler();

    const score = scoreInput();
    displayScore(score);

    if(curSession.word == curSession.curGuess.join("")) 
        return setTimeout(() => terminateSession(true, null), 2750)

    curSession.guessList.push(score)
    curSession.curGuess = []

    updateLocalStorage();

    if(curSession.guessList.length >= 5) 
        terminateSession(false, null); 
}

function updateLocalStorage(){
    localStorage.clear();
    localStorage.setItem("session", JSON.stringify(curSession));
}

function keyPressHandler(event){
    if(coolDown) return;

    const validKeys = "abcdefghijklmnopqrstuvwxyz";
    const isValidKey = validKeys.indexOf(event.key)

    if(isValidKey != -1) return addNewKey(event.key);

    const keyHandler = {
        Backspace: () => deleteLastInput(),
        Enter: () => validateInput(),
    }
    keyHandler[event.key]?.();   
}

document.addEventListener("keydown", keyPressHandler);
document.getElementById("playAgainButton").addEventListener("click", startNewSession);

loadSession();

//terminateSession(false, null);
