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

    return [result[0], result[1], result[2], result[3], result[4]];
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
    if (getNextWordCache.has(results)) {
        return getNextWordCache.get(results);
    }

    const validGuessFile = 'wordle/validGuess.txt';
    const validAnswerFile = 'wordle/validAnswer.txt';
    const firstResultFile = 'wordle/beginning_roate.txt';

    

    const fs = require('fs');

    let firstResult = fs.readFileSync(firstResultFile, 'utf8').split('\n');
    let validGuess = fs.readFileSync(validGuessFile, 'utf8').split('\n');
    let validAnswer = fs.readFileSync(validAnswerFile, 'utf8').split('\n');

    for (const info of results) {
        const result = info[1];
        const guess = info[0].toLowerCase();
        validAnswer = getPossibleAnswers(validAnswer, guess, result);
        if (results.length === 1 && validAnswer.length > 10) {
        const line = firstResult[result[4] + result[3] * 3 + result[2] * 9 + result[1] * 27 + result[0] * 81];
        const guess = line.slice(-5);
        cache.set(results, guess);
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
    cache.set(results, guess);
    return guess;
}
