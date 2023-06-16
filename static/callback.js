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
    }
}