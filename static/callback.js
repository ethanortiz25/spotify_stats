document.addEventListener("DOMContentLoaded", function() {
    var dataGroups = document.querySelectorAll(".data-group");
    var switchButtons = document.querySelectorAll(".btn-switch");
    console.log("alert");

    switchButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            var targetGroupId = this.getAttribute("data-group-id");
            dataGroups.forEach(function(group) {
                console.log("clicked");
                if (group.id === targetGroupId) {
                    group.classList.add("active");
                } else {
                    group.classList.remove("active");
                }
            });
        });
    });
});

function updateText(buttonId) {
    var textContainer = document.getElementById("term_text");
    
    if (buttonId === 0) {
        textContainer.textContent = "top songs this month:";
    } else if (buttonId === 1) {
        textContainer.textContent = "top songs last 6 months:";
    } else if (buttonId === 2) {
        textContainer.textContent = "top songs of all time:";
    } else if (buttonId === 3) {
        textContainer.textContent = "recently listened:";
    }
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