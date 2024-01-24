const colors = ["#252525", "#b59f3b", "#538d4e"];

// Add click event listener to each td element
const letterAreas = document.querySelectorAll(".letter_area");
letterAreas.forEach((area, index) => {
    let colorIndex = 0;
    area.style.backgroundColor = "#252525";
    area.addEventListener("click", () => {
        if(area.classList.value == "letter_area"){
            colorIndex = (colorIndex + 1) % colors.length;
            area.style.backgroundColor = colors[colorIndex];
        }
    });
});
let typedText = 'SALET';
let words = ['SALET'];
let info = [];
let submitLock = false;

updateBoxesWithTypedText();

// Function to update the boxes with the typed text
function updateBoxesWithTypedText() {
    const letterAreas = document.querySelectorAll(".letter_area");
    for (let i = 0; i < letterAreas.length; i++) {
        if (i < typedText.length) {
            letterAreas[i].innerText = typedText[i];
        } else {
            letterAreas[i].innerText = '';
        }
    }
}

// Functionality for typing in the boxes
// document.addEventListener("keypress", (event) => {
//     const pressedKey = event.key.toUpperCase();
//     if (/^[A-Z]$/.test(pressedKey) && typedText.length < 5) { 
//         typedText += pressedKey;
//         updateBoxesWithTypedText();
//     }
// });

// window.addEventListener("keydown", (event) => {
//     if (event.key === "Backspace") {
//         typedText = typedText.slice(0, -1); // Remove the last character
//         updateBoxesWithTypedText();
//     }
// });

const saveButton = document.getElementById('submitButton');
saveButton.addEventListener('click', sendDataToServer);

function updateBoxesWithProcessedData(processedData) {
    try {
        if (Array.isArray(processedData)) {
            const letterAreas = document.querySelectorAll(".letter_area");
            typedText = '';
            for (let i = 0; i < letterAreas.length; i++) {
                const text = processedData[i].text;
                typedText += text;
                const color = '#252525';
                letterAreas[i].innerText = text.toUpperCase();
                letterAreas[i].style.backgroundColor = color;
            }
            words.push(typedText);
        } else {
            console.error('Processed data is not an array:', processedData);
        }
    } catch (error) {
        console.error('Error updating boxes with processed data:', error);
    }
}

// Function to send data to the server
function sendDataToServer() {
    if (submitLock){
        return;
    }
    submitLock = true;
    if (typedText.length != 5){
        return;
    }
    const colors = Array.from(document.querySelectorAll(".letter_area")).map(cell => cell.style.backgroundColor);
    const codedColors = mapColorsToCodes(colors);
    if(codedColors[0] === 2 && codedColors[1] === 2 && codedColors[2] === 2 && codedColors[3] === 2 && codedColors[4] === 2){
        const letterAreas = document.querySelectorAll(".letter_area");
        for (let i = 0; i < letterAreas.length; i++) {
            letterAreas[i].classList.remove('letter_area');
            letterAreas[i].classList.add('letter_area_inactive');
        }
        showToast("Complete!");
        return;
    }
    info.push(codedColors);
    const data = {
        words: words,
        colors: info
    };

    let results = [];
    for (let i = 0; i < words.length; i++) {
        results.push({ word: words[i], color: info[i] });
    }

    // Convert the array of objects into a tuple-like array
    let resultsTuple = results.map(({ word, color }) => [word, ...color]);

    // // Call getNextWord with the resultsTuple
    // let nextWord = getNextWord(resultsTuple);
    // let processed_data = [];
    // for (let i = 0; i < nextWord.length; i++) {
    //     processed_data.push({ text: nextWord[i] });
    // }
    // createNewRow(); 
    // updateBoxesWithProcessedData(processed_data);

    fetch('/save_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        submitLock = false;
        console.log('Server Response:', data);

        // Update the boxes with the processed data received from the server
        if (data.hasOwnProperty('processedData')) {

            createNewRow(); 
            updateBoxesWithProcessedData(data.processedData);
        } else {
            console.error('Processed data not found in the server response.');
        }
    })
    .catch(error => {
        submitLock = false;
        showToast("Invalid!");
        console.error('Error sending data to the server:', error);
        info.pop();
        colors.pop();
    });
}
function createNewRow() {
    const letterAreas = document.querySelectorAll(".letter_area");
    for (let i = 0; i < letterAreas.length; i++) {
        letterAreas[i].classList.remove('letter_area');
        letterAreas[i].classList.add('letter_area_inactive');
    }


    const newRow = document.createElement('tr');
    newRow.classList.add('newRow');

    for (let i = 0; i < 5; i++) {
        const newBox = document.createElement('td');
        newBox.classList.add('letter_area');
        newRow.appendChild(newBox);
    }

    // Add the new row to the table
    const table = document.querySelectorAll('table');
    table[1].appendChild(newRow);

    const newLetterAreas = document.querySelectorAll(".letter_area");
    
    newLetterAreas.forEach((area, index) => {
        let colorIndex = 0;
        area.style.backgroundColor = "#252525";
        area.addEventListener("click", () => {
            if(area.classList.value == "letter_area"){
                colorIndex = (colorIndex + 1) % colors.length;
                area.style.backgroundColor = colors[colorIndex];
            }
        });
    });
}

function mapColorsToCodes(colors) {
    return colors.map(color => {
        if (color === "rgb(37, 37, 37)") return 0;
        if (color === "rgb(181, 159, 59)") return 1;
        if (color === "rgb(83, 141, 78)") return 2;
        return -1; // If an unknown color is found, return -1 (error code)
    });
}
function showToast(message) {
    const toastElement = document.createElement("div");
    toastElement.innerText = message;
    toastElement.style.backgroundColor = "#333";
    toastElement.style.color = "#fff";
    toastElement.style.padding = "10px";
    toastElement.style.position = "fixed";
    toastElement.style.bottom = "30px";
    toastElement.style.left = "50%";
    toastElement.style.transform = "translateX(-50%)";
    toastElement.style.borderRadius = "5px";
    toastElement.style.zIndex = "999";
    toastElement.style.fontFamily = "Verdana";
    document.body.appendChild(toastElement);

    setTimeout(function () {
        document.body.removeChild(toastElement);
    }, 3000); // Toast will disappear after 3 seconds
}

const infoButton = document.getElementById('infoButton');
const infoBox = document.getElementById('infoBox');
const closeButton = document.getElementById('closeButton');

// Show the information box when the image button is clicked
infoButton.addEventListener('click', () => {
    infoBox.style.display = 'block';
});

// Hide the information box when the close button is clicked
closeButton.addEventListener('click', () => {
    infoBox.style.display = 'none';
});





// Implement a simple LRU (Least Recently Used) cache
class LRUCache {
    constructor(capacity) {
      this.capacity = capacity;
      this.cache = new Map();
    }
  
    get(key) {
      if (this.cache.has(key)) {
        const value = this.cache.get(key);
        // Move the accessed item to the end of the Map to indicate it's recently used
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
      }
      return null;
    }
  
    put(key, value) {
      if (this.cache.has(key)) {
        this.cache.delete(key);
      } else if (this.cache.size >= this.capacity) {
        // If the cache is full, remove the least recently used (first item)
        this.cache.delete(this.cache.keys().next().value);
      }
      this.cache.set(key, value);
    }
    has(key) {
        return this.cache.has(key);
    }
  }
  

const wordleResultCache = new LRUCache(1000);

function wordleResult(guess, answer) {
    const cacheKey = JSON.stringify({ guess, answer });
    if (wordleResultCache.has(cacheKey)) {
        return wordleResultCache.get(cacheKey);
    }
    const result = [0, 0, 0, 0, 0];
    const str = new Map();
    let i = 0;

    for (const letter of guess) {
        if (letter === answer[i]) {
        result[i] = 2; // case for green letter
        } else {
        str.set(answer[i], (str.get(answer[i]) || 0) + 1); // case for yellow or grey letter
        }
        i += 1;
    }

    i = 0;

    for (const letter of guess) {
        if (result[i] !== 2) {
        // loop through again and look at non-greens
        if (str.get(letter) > 0) {
            // if the letter is not green and is in the answer, subtract from our dictionary of the non-green letters
            result[i] = 1;
            str.set(letter, str.get(letter) - 1);
        }
        }
        i += 1;
    }
    wordleResultCache.put(cacheKey, result)
    return result;
}

console.log(wordleResult("APPLE", "ABCDE")); // Example usage

// Helper function to check if a given answer is a possible answer based on the guess and result
function isPossibleAnswer(answer, guess, result) {
    return JSON.stringify(wordleResult(guess, answer)) === JSON.stringify(result);
}
  
// Returns all possible answers
function getPossibleAnswers(answerList, guess, result) {
    const possible = [];
    for (const answer of answerList) {
        if (isPossibleAnswer(answer, guess, result)) {
        possible.push(answer);
        }
    }
    return possible;
}

// Scores all answers
function scoreAnswers(validGuess, validAnswer) {
    let maxScore = 0;
    let max = validGuess[0];

    // For every guess, assume every answer and see how many answers it would eliminate
    // Sum total eliminated answers for the score
    for (const guess of validGuess) {
        let currScore = 0;
        for (const answer of validAnswer) {
        const result = wordleResult(guess, answer);
        for (const ans of validAnswer) {
            if (!isPossibleAnswer(ans, guess, result)) {
            currScore += 1;
            }
        }
        }
        if (currScore > maxScore) {
        max = guess;
        maxScore = currScore;
        }
    }
    return max;
}

function widdle(validAnswers, validGuesses, results) {
    const letterFreq = new Map();
    const grey = new Set();
  
    // Calculate the letter frequency in validAnswers
    for (const answer of validAnswers) {
      for (const letter of answer) {
        letterFreq.set(letter, (letterFreq.get(letter) || 0) + 1);
      }
    }
  
    // Determine the grey letters based on results
    for (const entry of results) {
      const word = entry[0];
      const result = entry[1];
      let str = '';
      for (let i = 0; i < result.length; i++) {
        if (result[i] === 0 && !str.includes(word[i])) {
          grey.add(word[i]);
        } else {
          str += word[i];
        }
      }
    }
  
    // Add letters with zero frequency to grey
    for (const letter of letterFreq.keys()) {
      if (!letterFreq.get(letter)) {
        grey.add(letter);
      }
    }
  
    // Remove extra letters from grey if it has more than 18 elements
    while (grey.size > 18) {
      grey.delete(Array.from(grey)[grey.size - 1]);
    }
  
    // Filter validGuesses based on grey letters
    const ret = validGuesses.filter(word => {
      for (const letter of grey) {
        if (word.includes(letter)) {
          return false;
        }
      }
      return true;
    });
    return ret;
}
  
function widdleMore(validAnswers, validGuesses) {
    const letterFreq = new Map();
  
    // Calculate the letter frequency in validAnswers
    for (const answer of validAnswers) {
      for (const letter of answer) {
        letterFreq.set(letter, (letterFreq.get(letter) || 0) + 1);
      }
    }
  
    // Find the least frequent letter
    let least = 13000;
    let worst = '';
    for (const [letter, val] of letterFreq.entries()) {
      if (val < least && val !== 0) {
        least = val;
        worst = letter;
      }
    }
  
    // Filter validGuesses based on the least frequent letter
    const ret = validGuesses.filter(word => !word.includes(worst));
  
    // Remove the least frequent letter and filter validGuesses further until the desired length is reached
    const used = new Set([worst]);
    while (ret.length > 700) {
      least = 13000;
      let nworst = '';
      for (const [letter, val] of letterFreq.entries()) {
        if (val < least && val !== 0 && !used.has(letter)) {
          least = val;
          nworst = letter;
        }
      }
      const ret2 = ret.filter(word => !word.includes(nworst));
      used.add(nworst);
      if (ret2.length === 0) {
        return ret;
      }
      ret = ret2;
    }
  
    return ret;
}
function rankScores(scoredWords) {
    const scoresDict = {};
    const scoresList = [];
  
    for (const row of scoredWords) {
      let currScore = parseFloat(row[1]);
      while (scoresList.includes(currScore)) {
        currScore += 1 / scoresList.length;
      }
      scoresList.push(currScore);
      scoresDict[currScore] = row[0];
    }
  
    const score = Math.max(...scoresList);
    return scoresDict[score];
}

const getNextWordCache = new Map();

function getNextWord(results) {
    cacheKey = generateKey(results);
    if (getNextWordCache.has(cacheKey)) {
        return getNextWordCache.get(cacheKey);
    }

    const validGuessFile = 'wordle/validGuess.txt';
    const validAnswerFile = 'wordle/validAnswer.txt';
    const firstResultFile = 'wordle/beginning_roate.txt';


    const fs = require('fs');

    let firstResult = fs.readFileSync(firstResultFile, 'utf8').split('\n');
    let validGuess = fs.readFileSync(validGuessFile, 'utf8').split('\n');
    let validAnswer = fs.readFileSync(validAnswerFile, 'utf8').split('\n');
    
    fetch('/save_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        submitLock = false;
        console.log('Server Response:', data);

        // Update the boxes with the processed data received from the server
        if (data.hasOwnProperty('firstResult') && data.hasOwnProperty('validGuess') && data.hasOwnProperty('validAnswer')) {

        } else {
            console.error('Processed data not found in the server response.');
        }
    })
    .catch(error => {
        submitLock = false;
        showToast("Invalid!");
        console.error('Error sending data to the server:', error);
        info.pop();
        colors.pop();
    });

    for (const info of results) {
        const result = info[1];
        const guess = info[0].toLowerCase();
        validAnswer = getPossibleAnswers(validAnswer, guess, result);
        if (results.length === 1 && validAnswer.length > 10) {
            const line = firstResult[result[4] + result[3] * 3 + result[2] * 9 + result[1] * 27 + result[0] * 81];
            const guess = line.slice(-5);
            getNextWordCache.put(cacheKey, guess);
            return guess;
        }
    }

    let optimalGuesses = validGuess;
    let bestScore;
    if (validAnswer.length > 3) {
        bestScore = scoreAnswers(optimalGuesses, validAnswer);
    } else {
        bestScore = scoreAnswers(validAnswer, validAnswer);
    }

    const guess = bestScore;
    getNextWordCache.put(cacheKey, guess);
    return guess;
}

function generateKey(arr) {
    return JSON.stringify(arr);
}