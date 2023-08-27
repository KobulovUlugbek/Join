/**
 * Holds the selected priority level for the task.
 * @type {string}
 */
let priority;

/**
 * Holds an array of assigned contacts for the task.
 * @type {Array}
 */
let assignedContacts = [];

/**
 * Holds the selected category for the task.
 * @type {string}
 */
let selectedCategory;

/**
 * Holds the ID for generating subtasks.
 * @type {number}
 */
let subtaskID = 0;

/**
 * Holds the remote category data fetched from the server.
 * @type {Array}
 */
let remoteCategoryAsJSON;

/**
 * Initializes the 'Add Task' functionality by fetching remote data and setting up event listeners.
 * @returns {Promise<void>}
 */
async function initAddTask() {
  /**
   * Fetches remote task data from the server.
   * @type {Array}
   */
  remoteTasksAsJSON = await getRemoteData("tasksRemote");

  /**
   * Fetches remote category data from the server.
   * @type {Array}
   */
  remoteCategoryAsJSON = await getRemoteData("categoryRemote");

  // Adds contact names to the 'Assigned To' dropdown.
  addContactNamesToAssignedTo();

  // Adds categories to the dropdown menu.
  addCategories();

  // Sets up event listener for subtask input field.
  addSubtaskEventListener();
}


/**
 * Sets the priority level for the task and updates corresponding UI elements.
 * @param {string} prio - The priority level to be set ('urgent', 'medium', or 'low').
 */
function setPrio(prio) {
  // Get references to priority icons and selected priority element
  let urgentIcon = document.getElementById("urgentIcon");
  let mediumIcon = document.getElementById("mediumIcon");
  let lowIcon = document.getElementById("lowIcon");
  let prioIcon = document.getElementById(`${prio}Icon`);
  let selectedPrio = document.getElementById(`${prio}`);

  // Remove priority class from all buttons and reset icon sources
  let elem = document.querySelectorAll(".prio-btn");
  for (let k = 0; k < elem.length; k++) {
    elem[k].classList.remove("urgent", "medium", "low");

    lowIcon.src = `assets/icons/low.png`;
    mediumIcon.src = `assets/icons/medium.png`;
    urgentIcon.src = `assets/icons/urgent.png`;
  }

  // Set the selected priority and update icon source
  selectedPrio.classList.add(`${prio}`);
  prioIcon.src = `assets/icons/${prio}_white.png`;

  // Update the global priority variable
  priority = prio;
}

/**
 * Adds contact names to the "Assigned To" dropdown menu and renders them.
 */
function addContactNamesToAssignedTo() {
  //adding and rendering contacts to dropdown menu
  document.getElementById("selectContactDropdown").innerHTML = "";
  for (let i = 0; i < contacts.length; i++) {
    let contact = contacts[i];
    let name = contact.name;
    document.getElementById("selectContactDropdown").innerHTML += `
    <div id="assignedContactID${i}" onclick="selectOptionContacts(${i}), pushAssignedContact(${i})" class="option sb">${name} </div>`;
  }
}

/**
 * Adds categories to the "Category" dropdown menu and renders them.
 */
async function addCategories() {
  //adding and rendering categories to dropdown menu
  document.getElementById(
    "categoryDropdown"
  ).innerHTML = `<div class="option" onclick="showNewCategory()">
    New Category 
  </div>`;
  for (let i = 0; i < remoteCategoryAsJSON.length; i++) {
    let category = remoteCategoryAsJSON[i];
    let name = category["name"];
    let color = category["color"];
    name = name.charAt(0).toUpperCase() + name.slice(1);
    document.getElementById("categoryDropdown").innerHTML += genCategoryHTML(
      i,
      name,
      color
    );
  }
}

/**
 * Generates HTML for displaying a category option in the dropdown menu.
 * @param {number} i - The index of the category.
 * @param {string} name - The name of the category.
 * @param {string} color - The color of the category.
 * @returns {string} - The generated HTML for the category option.
 */
function genCategoryHTML(i, name, color) {
  return `
<div onclick="selectOptionCategory(${i})" class="option">
  <div class="d-option">
    ${name}
    <div style="background-color: ${color}" class="category-circle"></div>
  </div>
  <img onclick="removeCategory(event, ${i})" src="assets/icons/clear-subtask.png">  
</div>`;
}


/**
* Pushes the selected contact into the assignedContacts array.
* @param {number} i - The index of the selected contact.
*/
function pushAssignedContact(i) {
  // pushing selected contacts into assignedContacts Array
  let contact = contacts[i];
  let index = assignedContacts.indexOf(contact);
  if (index <= -1 && assignedContacts.length < 5) {
    assignedContacts.push(contacts[i]);
  }
}

/**
 * Creates a new task with the provided details and adds it to the remote task list.
 * @param {string} status - The status of the new task.
 */
async function createTask(status) {
  let title = document.getElementById("addTaskTitle");
  let description = document.getElementById("addTaskDescription");
  let dueDate = document.getElementById("date");

  if (selectedCategory == "" || assignedContacts == "" || !priority) {
    taskPopup(alert);
  } else {
    let newTask = {
      title: title.value,
      description: description.value,
      status: status,
      category: selectedCategory,
      priority: priority,
      subtasks: pushSubtasks(),
      dueDate: dueDate.value,
      assignedTo: assignedContacts,
    };
    remoteTasksAsJSON.push(newTask);
    await setItem("tasksRemote", remoteTasksAsJSON);
    subtaskID = 0;
    resetValues(dueDate, description, title);
    taskPopup();
    boardCondition();
  }
}

/**
 * Handles the condition of the board after adding a task.
 */
function boardCondition() {
  //in case task is added in add_task.html, window.location will jump to board.html
  if (window.location.pathname.includes("add_task.html")) {
    setTimeout(() => {
      window.location.href = "board.html";
    }, 1000);
  }
  if (window.location.pathname.includes("board.html")) {
    initBoard();
    closeSlideInBtn();
  }
}

/**
 * Resets input values and UI elements after creating a task.
 * @param {HTMLInputElement} dueDate - The input element for the due date.
 * @param {HTMLTextAreaElement} description - The textarea element for the task description.
 * @param {HTMLInputElement} title - The input element for the task title.
 */
function resetValues(dueDate, description, title) {
  let category = document.getElementById("addTaskCategory");
  let assignedTo = document.getElementById("chosenContacts");
  let subtaskContainer = document.getElementById("subtaskContainer");
  priority = "";
  let elem = document.querySelectorAll(".prio-btn");
  for (let k = 0; k < elem.length; k++) {
    elem[k].classList.remove("urgent", "medium", "low");
    document.getElementById("mediumIcon").src = "assets/icons/medium.png";
    document.getElementById("urgentIcon").src = "assets/icons/urgent.png";
    document.getElementById("lowIcon").src = "assets/icons/low.png";
  }
  title.value = "";
  description.value = "";
  dueDate.value = "";
  category.innerHTML = "Select task category";
  assignedTo.innerHTML = "";
  subtaskContainer.innerHTML = "";
  assignedContacts = [];
  selectedCategory = [];
}

// custom select/dropdown
//-----------dropdown-category --------------------//
/**
 * Opens the category dropdown menu.
 */
function openDropdownCategory() {
  let dropdown = document.getElementById("categoryDropdown");
  let category = document.getElementById("addTaskCategory");
  dropdown.classList.toggle("expanded");
  category.classList.toggle("category-expanded");
}

/**
 * Handles the selection of a category option.
 * @param {number} i - The index of the selected category option.
 */
function selectOptionCategory(i) {
  let dropdown = document.getElementById("categoryDropdown");
  let category = document.getElementById("addTaskCategory");
  let selectedOption = event.target.innerHTML;

  category.innerHTML = selectedOption;
  selectedCategory = remoteCategoryAsJSON[i]["name"];

  dropdown.classList.remove("expanded");
  category.classList.remove("category-expanded");
}

/**
 * Shows the UI for adding a new category.
 */
function showNewCategory() {
  let selectCat = document.getElementById("addTaskCategory");
  let newCat = document.getElementById("newCat");
  let dropdown = document.getElementById("categoryDropdown");
  selectCat.classList.add("d-none");
  newCat.classList.remove("d-none");
  dropdown.classList.add("d-none");
  renderColors();
}

/**
 * Closes the UI for adding a new category.
 */
function closeNewCategory() {
  let selectCat = document.getElementById("addTaskCategory");
  let newCat = document.getElementById("newCat");
  let dropdown = document.getElementById("categoryDropdown");
  selectCat.classList.remove("d-none");
  newCat.classList.add("d-none");
  dropdown.classList.remove("d-none");
  document.getElementById("newCatInput").value = "";
}

/**
 * Renders color options for a new category.
 */
function renderColors() {
  let colorContainer = document.getElementById("newCatColors");
  colorContainer.innerHTML = "";
  for (let i = 0; i < nameColor.length; i++) {
    let color = nameColor[i];
    colorContainer.innerHTML += `
    <div id="newCatColorID${i}" onclick="selectCatColor(${i})" style="background-color: ${color}" class="newCatColor"></div>`;
  }
}

/**
 * Handles the selection of a color for a new category.
 * @param {number} i - The index of the selected color option.
 */
function selectCatColor(i) {
  let newColor = document.getElementById(`newCatColorID${i}`);
  let allColors = document.querySelectorAll(".newCatColor");
  for (let j = 0; j < allColors.length; j++) {
    allColors[j].classList.remove("selectedColor");
  }
  newColor.classList.add("selectedColor");
}

/**
 * Adds a new category to the remote category list and updates the UI.
 */
async function addNewCategory() {
  let newCatInp = document.getElementById("newCatInput");
  let newColorElement = document.querySelector(".selectedColor");
  let newColor = newColorElement ? newColorElement.style.backgroundColor : null;
  let newCat = newCatInp.value;
  newCat = newCat.charAt(0).toUpperCase() + newCat.slice(1);

  if (newCat && newColor) {
    let newCategory = {
      name: newCat,
      color: newColor,
    };
    remoteCategoryAsJSON.push(newCategory);
    await setItem("categoryRemote", remoteCategoryAsJSON);
  }

  addCategories();
  closeNewCategory();
}

/**
 * Removes a category from the remote category list and updates the UI.
 * @param {Event} event - The click event triggering the category removal.
 * @param {number} i - The index of the category to be removed.
 */
async function removeCategory(event, i) {
  event.stopPropagation();

  remoteCategoryAsJSON.splice(i, 1);
  await setItem("categoryRemote", remoteCategoryAsJSON);
  document.getElementById("addTaskCategory").innerHTML = "Select task category";
  addCategories();
}

//-----------dropdown-category --------------------//
//-----------dropdown-contacts --------------------//

/**
 * Toggles the visibility of the contact dropdown menu.
 */

function openDropdownContacts() {
  let dropdown = document.getElementById("selectContactDropdown");
  let selectContact = document.getElementById("selectContact");
  dropdown.classList.toggle("expanded");
  selectContact.classList.toggle("category-expanded");
}

/**
 * Handles the selection of a contact option and displays it in the chosen contacts container.
 * @param {number} i - The index of the selected contact option.
 */
function selectOptionContacts(i) {
  // Adding and rendering selected Contacts into container below dropdown menu
  let dropdown = document.getElementById("selectContactDropdown");
  let selectContact = document.getElementById("selectContact");
  let chosenContacts = document.getElementById("chosenContacts");
  let assignedContact = document.getElementById(`assignedContactID${i}`);
  let initials = getInitials(contacts[i]["name"]);
  let color = contacts[i]["color"];

  if (!isContactSelected(chosenContacts, contacts[i])) {
    if (chosenContacts.children.length < 5) {
      assignedContact.classList.add("d-none");

      let newContactHTML = `
        <div style="background-color: ${color}" class="chosenContactInitials" onclick="removeContact(${i})">
          ${initials}
        </div>
      `;
      chosenContacts.innerHTML += newContactHTML;
      let selectedOption = dropdown.querySelector(`option[value="${i}"]`);
      if (selectedOption) {
        selectedOption.remove();
      }
    }
  }
  dropdown.classList.remove("expanded");
  selectContact.classList.remove("category-expanded");
}

/**
 * Checks if a contact is already selected in the chosen contacts container.
 * @param {HTMLElement} chosenContacts - The container for chosen contacts.
 * @param {object} contact - The contact to be checked.
 * @returns {boolean} - True if the contact is already selected, false otherwise.
 */
function isContactSelected(chosenContacts, contact) {
  // checking if contact is in chosenContacts
  let contactElements = chosenContacts.getElementsByClassName(
    "chosenContactInitials"
  );

  for (let i = 0; i < contactElements.length; i++) {
    let initials = contactElements[i].textContent.trim();
    if (initials === getInitials(contact["name"])) {
      return true;
    }
  }

  return false;
}

//-----------dropdown-contacts ------------------------//
//-----------remove added contacts --------------------//
/* let assignedContacts = []; */

/**
 * Removes a contact from the assignedContacts array and updates the UI.
 * @param {number} i - The index of the contact to be removed.
 */
function removeContact(i) {
  // Remove the contact from the assignedContacts array
  let dropdown = document.getElementById("selectContactDropdown");
  let contact = contacts[i];
  let contactID = assignedContacts.indexOf(contact);
  assignedContacts.splice(contactID, 1);

  // Add the selected contact back to the dropdown if it doesn't exist
  let selectedContact = contacts[i];
  let contactName = selectedContact.name;
  let assignedContactID = `assignedContactID${i}`;

  let existingOption = dropdown.querySelector(`#${assignedContactID}`);
  if (!existingOption) {
    let newOptionHTML = `
      <div id="${assignedContactID}" onclick="selectOptionContacts(${i})" class="option sb">${contactName}</div>
    `;
    dropdown.innerHTML += newOptionHTML;
  }

  removeFromChosenContacts(i, contactName);
  recoverAssignedContact(assignedContactID);
}

/**
 * Removes a contact from the chosenContacts container.
 * @param {number} i - The index of the contact to be removed.
 * @param {string} contactName - The name of the contact to be removed.
 */

function removeFromChosenContacts(i, contactName) {
  // Remove the contact from the chosenContacts container
  let chosenContacts = document.getElementById("chosenContacts");
  let contactInitials = getInitials(contactName);
  let chosenContact = chosenContacts.querySelector(
    `.chosenContactInitials[onclick*="removeContact(${i})"]`
  );
  if (chosenContact) {
    chosenContact.remove();
  }
}

/**
 * Displays a hidden assigned contact back in the contact dropdown.
 * @param {string} assignedContactID - The ID of the assigned contact to be recovered.
 */
function recoverAssignedContact(assignedContactID) {
  // Show the assigned contact again in the selectContactDropdown
  let assignedContact = document.getElementById(assignedContactID);
  if (assignedContact) {
    assignedContact.classList.remove("d-none");
  }
}

/**
 * Removes a contact from the assignedContacts array based on its index.
 * @param {number} i - The index of the contact to be removed.
 */
function deleteFromAssignedContacts(i) {
  let contactName = contacts[i]["name"];
  let index = assignedContacts.findIndex((obj) => obj.name === contactName);
  if (index > -1) {
    assignedContacts.splice(index, 1);
  }
}

//-----------remove added contacts --------------------//

//-------------task successfully added----------------//

/**
 * Displays a popup message indicating the success of task addition or alerting about missing information.
 * @param {string} change - The change to determine the message to display.
 */
function taskPopup(change) {
  let success = document.getElementById("taskAdded");
  if (change == alert) {
    success.innerHTML = `Please fill missing informations`;
  } else {
    success.innerHTML = `Task added to board &nbsp; <img src="assets/icons/board-icon.svg" />`;
  }
  success.style.display = "block";
  setTimeout(function () {
    success.style.display = "none";
  }, 2000);
}
//-------------task successfully added----------------//

//-------------setting min date to today----------------//

/**
 * Sets the minimum date for the date input field to today's date.
 */

function setMinDate() {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let minMonth = `0${month}`;
  let day = date.getDate();
  let minDay = `0${day}`;
  let today = document.getElementById("date");
  if (month < 10) {
    month = minMonth;
  }
  if (day < 10) {
    day = minDay;
  }
  today.min = `${year}-${month}-${day}`;
}

//-------------setting min date to today----------------//

//-------------subtask----------------//

/**
 * Adds event listeners to the subtask input field for managing its visibility.
 */

function addSubtaskEventListener() {
  const inputField = document.getElementById("addTaskSubtask");
  const container = document.getElementById("subtask-buttons");

  inputField.addEventListener("focus", () => {
    container.style.display = "flex";
  });

  inputField.addEventListener("blur", () => {
    setTimeout(() => {
      container.style.display = "none";
    }, 100);
  });
}

/**
 * Creates a new subtask element and adds it to the subtask container.
 */

function createNewSubtask() {
  let inputField = document.getElementById("addTaskSubtask");
  let subtaskContainer = document.getElementById("subtaskContainer");

  if (inputField.value) {
    subtaskContainer.innerHTML += subtaskHTML(inputField.value, subtaskID);
    subtaskID++;
    inputField.value = "";
  }
}

/**
 * Renders subtasks for a task based on its ID.
 * @param {number} taskID - The ID of the task for which to render subtasks.
 */

function renderSubtask(taskID) {
  let subtaskContainer = document.getElementById("editSubtaskContainer");

  for (let i = 0; i < remoteTasksAsJSON[taskID]["subtasks"].length; i++) {
    const subtaskName = remoteTasksAsJSON[taskID]["subtasks"][i]["name"];
    const subtaskStatus = remoteTasksAsJSON[taskID]["subtasks"][i]["status"];
    subtaskContainer.innerHTML += subtaskHTML(
      subtaskName,
      taskID,
      subtaskStatus
    );
  }
}

/**
 * Collects subtask information and returns an array of subtasks.
 * @returns {Array} - An array of subtasks.
 */

function pushSubtasks() {
  let subtasks = document.querySelectorAll(".subtask");
  let subtaskArray = [];
  subtasks.forEach((subtask) => {
    let checkbox = subtask.querySelector("input[type='checkbox']");
    subtaskArray.push({
      name: subtask.textContent,
      status: isChecked(checkbox),
    });
  });
  return subtaskArray;
}

/**
 * Checks if a subtask's checkbox is checked.
 * @param {HTMLInputElement} checkbox - The checkbox element for the subtask.
 * @returns {string} - The status of the subtask ('done' or 'inProgress').
 */
function isChecked(checkbox) {
  if (checkbox.checked) {
    return "done";
  } else {
    return "inProgress";
  }
}

/**
 * Checks if a subtask's status is 'done'.
 * @param {string} subtaskStatus - The status of the subtask.
 * @returns {boolean} - True if the subtask is done, false otherwise.
 */

function isSubtaskChecked(subtaskStatus) {
  if (subtaskStatus === "done") {
    return true;
  }
  return false;
}

/**
 * Clears the value of the subtask input field.
 */
function emptySubtaskValue() {
  let inputField = document.getElementById("addTaskSubtask");
  inputField.value = "";
}
