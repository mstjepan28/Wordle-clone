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
    console.log(curSession);
    [...curSession.guessList, curSession.curGuess].forEach((guess, guessIndex) => {
        const letterGuesses = getGuessDomElement(guessIndex + 1).children;

        guess.forEach((letter, letterIndex) => {
            [...letterGuesses][letterIndex].innerText = letter.toUpperCase();
        })
    });
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

function addNewKey(newKey){
    if(curSession.curGuess.length >= 5) return;
    curSession.curGuess.push(newKey);

    const letterGuesses = getGuessDomElement(false).children;
    [...letterGuesses][curSession.curGuess.length - 1].innerText = newKey.toUpperCase();

    updateLocalStorage();
}

function deleteLastInput(){
    if(curSession.curGuess.length == 0) return;

    const letterGuesses = getGuessDomElement().children;
    [...letterGuesses][curSession.curGuess.length - 1].innerText = "";

    curSession.curGuess.pop();

    updateLocalStorage();
}

function validateInput(){
    if(curSession.curGuess.length != 5) return;

    const guessedWord = curSession.curGuess.join("");
    const indexInWordList = wordList.indexOf(guessedWord);

    if(indexInWordList == -1) return console.log("Word no in word list!");
    
    curSession.guessList.push(curSession.curGuess)
    curSession.curGuess = []

    updateLocalStorage();
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