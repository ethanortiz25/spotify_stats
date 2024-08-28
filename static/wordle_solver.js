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
    table[0].appendChild(newRow);

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
    infoBox.style.display = 'flex';
});

// Hide the information box when the close button is clicked
closeButton.addEventListener('click', () => {
    infoBox.style.display = 'none';
});
