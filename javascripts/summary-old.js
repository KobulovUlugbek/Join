// Überprüfen, ob die Flag-Variable bereits im sessionStorage vorhanden ist
let isActive = sessionStorage.getItem("isActive");
// Wenn sie nicht vorhanden ist, standardmäßig auf true setzen
isActive = isActive === null ? true : JSON.parse(isActive);

/**
 * Calls all functions for summary card
 */
async function startSummary() {
    includeHTML("summaryMenu");
    getDataForSummary();
    taskWithEarliestDuedate();
    tasksAsJSON = await getRemoteData("tasksRemote");
    if (!isActive) {
        return; // Die Funktion wird beendet, ohne den Code auszuführen
    }
    greet(); // Funktionierender Code hier

    // Flag-Variable aktualisieren, um zu markieren, dass die Funktion bereits aufgerufen wurde
    isActive = false;
    sessionStorage.setItem("isActive", JSON.stringify(isActive));
}

/**
 * Changes greeting according to the time of day
 */
async function greet() {
    const date = new Date();
    const hours = date.getHours();
    let timeOfDay;

    if (hours < 12) {
        timeOfDay = "Good morning,";
    } else if (hours < 17) {
        timeOfDay = "Good afternoon,";
    } else {
        timeOfDay = "Good evening,";
    }

    const element = document.getElementById("greeting");
    const property = window.getComputedStyle(element).getPropertyValue("display");

    const currentUserName = (
        await JSON.parse(
            (await getItem("currentUserName")).data.value.replace(/'/g, '"')
        )
    ).name;

    const greetingTextId = property !== "none" ? "greetingText" : "greetingText2";
    const greetingNameId = property !== "none" ? "greetingName" : "greetingName2";

    document.getElementById(greetingTextId).innerHTML = timeOfDay;
    document.getElementById(greetingNameId).innerHTML = currentUserName;
}

/**
 * Sumes up tasks per category and urgency per priority
 */
async function getDataForSummary() {
    const res = await getItem("tasksRemote");
    const remoteTasksAsJSON = JSON.parse(res.data.value.replace(/'/g, '"'));

    document.getElementById("tasksInBoard").innerHTML = remoteTasksAsJSON.length;
    document.getElementById("tasksInProgress").innerHTML = getCountByStatus(
        remoteTasksAsJSON,
        "inProgress"
    );
    document.getElementById("tasksAwaitingFeedback").innerHTML = getCountByStatus(
        remoteTasksAsJSON,
        "awaitingFeedback"
    );
    document.getElementById("sumToDo").innerHTML = getCountByStatus(
        remoteTasksAsJSON,
        "todo"
    );
    document.getElementById("sumDone").innerHTML = getCountByStatus(
        remoteTasksAsJSON,
        "done"
    );
    document.getElementById("sumUrgent").innerHTML = getCountByPriority(
        remoteTasksAsJSON,
        "urgent"
    );
}

function getCountByStatus(tasks, status) {
    return tasks.filter((task) => task.status === status).length;
}

function getCountByPriority(tasks, priority) {
    return tasks.filter((task) => task.priority === priority).length;
}

/**
 * Shows earliest due date of tasks with category='urgent'
 */
async function taskWithEarliestDuedate() {
    let res = await getItem("tasksRemote");
    remoteTasksAsJSON = await JSON.parse(res.data.value.replace(/'/g, '"'));

    let earliestDate = ["2021-06-04"];
    for (let i = 0; i < remoteTasksAsJSON.length; i++) {
        if (remoteTasksAsJSON[i].priority == "urgent") {
            let currentDate = remoteTasksAsJSON[i].dueDate;
            if (currentDate > earliestDate) {
                earliestDate = currentDate;
            }
        }
        let d1 = new Date(earliestDate);
        let d2 = d1.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
        document.getElementById("dateDeadline").innerHTML = d2;
    }
}

function jumpToBoard() {
    window.location.href = "board.html";
}

// Waits until document in loaded
document.addEventListener("DOMContentLoaded", function() {
    if (!isActive) {
        return; // Der Code wird nicht ausgeführt
    }
    let overlay = document.querySelector(".overlay");

    // Adds class "show" to make the overlay container visible
    overlay.classList.add("show");

    // Removes the class "show" after 2 seconds to make the overlay container invisible
    setTimeout(function() {
        overlay.classList.remove("show");
    }, 2000);

    let greeting = document.querySelector(".greeting");

    // Adds class "show" to make the overlay container visible
    greeting.classList.add("show");

    // Removes the class "show" after 2 seconds to make the overlay container invisible
    setTimeout(function() {
        greeting.classList.remove("show");
    }, 1000);
});