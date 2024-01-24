import csv
from functools import lru_cache

# returns the result of a guess answer pair

@lru_cache
def wordleResult(guess, answer):
    result = [0,0,0,0,0]
    i = 0
    str = {}
    for letter in guess:
        # case for green letter
        if letter == answer[i]:
            result[i] = 2
        # case for yellow or grey letter
        else:
            str[answer[i]] = str.get(answer[i], 0) + 1
        i += 1
    i = 0
    for letter in guess:
        if result[i] !=2:
            # loop through again and look at non greens
            if str.get(letter, 0) > 0:
                # if the letter is not green and is in the answer subtract from our dictionary of the non green letters
                result[i] = 1
                str[letter] = str[letter] - 1

        i += 1
    return (result[0], result[1], result[2], result[3], result[4])

# returns true if an answer is possible given a guess and result
def isPossibleAnswer(answer, guess, result):
    return wordleResult(guess, answer) == result

# returns all possible answers
def getPossibleAnswers(answerList, guess, result):
    possible = []
    for answer in answerList:
        if isPossibleAnswer(answer, guess, result):
            possible += [answer]
    return possible

# scores all answers
def scoreAnswers(validGuess, validAnswer):
    guessNumbers = []
    i = 0
    maxScore = 0
    max = validGuess[0]
    # for every guess assume every answer and see how many answers it would eliminate
    # sum total eliminated answers for score
    for guess in validGuess:
        currScore = 0
        for answer in validAnswer:
            result = wordleResult(guess, answer)
            for ans in validAnswer:
                if not isPossibleAnswer(ans, guess, result):
                    currScore += 1
        if(currScore > maxScore):
            max = guess
            maxScore = currScore
    return max

# ranks all scores and returns the best guess
def rankScores(scoredWords):
    scoresDict = {}
    scoresList = []
    for row in scoredWords:
        currScore = float(row[1])
        while currScore in scoresList:
            currScore += 1/len(scoresList)
        scoresList += [currScore]
        scoresDict[currScore] = row[0]
    score = max(scoresList)
    return scoresDict[score]

# eliminates guesses that are deemed bad due to letter frequency
def widdle(validAnswers, validGuesses, results):
    letterFreq = {'a': 0, 'b': 0, 'c': 0, 'd': 0, 'e': 0, 'f': 0, 'g': 0, 'h': 0, 'i': 0, 'j': 0, 'k': 0, 'l': 0,
               'm': 0, 'n': 0, 'o': 0, 'p': 0, 'q': 0, 'r': 0, 's': 0, 't': 0, 'u': 0, 'v': 0, 'w': 0,
               'x': 0, 'y': 0, 'z': 0}
    for answer in validAnswers:
        for letter in answer:
            letterFreq[letter] += 1
    grey = []
    for entry in results:
        word = entry[0]
        result = entry[1]
        i = 0
        str = ''
        for number in result:
            if number == 0 and word[i] not in str:
                grey += word[i]
            else:
                str = str + word[i]
            i+=1
    i=0
    for letter, val in letterFreq.items():
        if val == 0:
            grey += [letter]
        i+=1
    ret = []
    while(len(grey) > 18):
        grey.remove(grey[len(grey)-1])
    for word in validGuesses:
        bool = True
        for letter in grey:
            if letter in word:
                bool = False
                break
        if bool:
            ret += [word]

    return ret

# eliminates more strictly based on letter frequency in remaining answers
def widdleMore(validAnswers, validGuesses):
    letterFreq = {'a': 0, 'b': 0, 'c': 0, 'd': 0, 'e': 0, 'f': 0, 'g': 0, 'h': 0, 'i': 0, 'j': 0, 'k': 0, 'l': 0,
                  'm': 0, 'n': 0, 'o': 0, 'p': 0, 'q': 0, 'r': 0, 's': 0, 't': 0, 'u': 0, 'v': 0, 'w': 0,
                  'x': 0, 'y': 0, 'z': 0}
    for answer in validAnswers:
        for letter in answer:
            letterFreq[letter] += 1
    least = 13000
    worst = ''
    for letter, val in letterFreq.items():
        if val < least and val != 0:
            least = val
            worst = letter
    ret = []
    for word in validGuesses:
        if worst not in word:
            ret += [word]
    used = [worst]
    while len(ret) > 700:
        least = 13000
        nworst = ''
        for letter, val in letterFreq.items():
            if val < least and val != 0 and letter not in used:
                least = val
                nworst = letter
        ret2 = []
        for word in ret:
            if nworst not in word:
                ret2 += [word]
        used += [nworst]
        if len(ret2) == 0:
            return ret
        ret = ret2
    return ret
    
@lru_cache
def getNextWord(results):
    validGuessFile = open('wordle/validGuess.txt', 'r')
    validAnswerFile = open('wordle/validAnswer.txt', 'r')
    firstResultFile = open('wordle/beginning_roate.txt', 'r')
    firstResult = firstResultFile.read().split('\n')
    validGuess = validGuessFile.read().split('\n')
    validAnswer = validAnswerFile.read().split('\n')
    firstResultFile.close()
    validAnswerFile.close()
    validGuessFile.close()

    for info in results:
        result = info[1]
        guess = info[0].lower()
        validAnswer = getPossibleAnswers(validAnswer, guess, result)
        if len(results) == 1 and len(validAnswer) > 10:
            line = firstResult[result[4] + result[3] * 3 + result[2] * 9 + result[1] * 27 + result[0] * 81]
            guess = line[-5:]
            return guess

    optimalGuesses = validGuess
    if (len(validAnswer) > 3):
        bestScore = scoreAnswers(optimalGuesses, validAnswer)
    else:
        bestScore = scoreAnswers(validAnswer, validAnswer)
    guess = bestScore
    return guess
