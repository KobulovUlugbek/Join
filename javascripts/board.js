/**
 * Index of the currently open task card.
 * @type {number}
 */
let openTaskIndex;

/**
 * ID of the currently open task.
 * @type {string}
 */
let openTaskID;

/**
 * Array to store assigned contacts for a task.
 * @type {Array}
 */
let assignedToArray;

/**
 * Array to store the tasks retrieved from remote data.
 * @type {Array}
 */
let remoteTasksAsJSON;

/**
 * Array to store assigned contact names for a task.
 * @type {Array}
 */
let assignedContactNames = [];

/**
 * Initializes the board by fetching remote data and rendering task cards for different statuses.
 * Also handles button visibility and checks if status containers are empty.
 * @async
 */
async function initBoard() {
  // Fetch tasks and categories from remote data
  remoteTasksAsJSON = await getRemoteData("tasksRemote");
  remoteCategoryAsJSON = await getRemoteData("categoryRemote");

  // Render task cards for different statuses
  renderTaskCards("todo", "todo");
  renderTaskCards("inProgress", "inProgress");
  renderTaskCards("awaitingFeedback", "awaitingFeedback");
  renderTaskCards("done", "done");

  // Toggle button visibility based on open task and assigned contacts
  toggleButtonVisibility();

  // Check if status containers are empty
  isEmptyStatusContainer();
}

/**
 * Renders the category label color for a task based on its category.
 * @param {number} i - Index of the task in the remoteTasksAsJSON array.
 * @returns {string|null} - Color code of the category label, or null if not found.
 */
function renderCategoryLabelColor(i) {
  let categoryName =
    remoteTasksAsJSON[i]["category"].charAt(0).toUpperCase() +
    remoteTasksAsJSON[i]["category"].slice(1);
  let labelColor = findColorByName(categoryName);

  return labelColor;
}

/**
 * Finds the color associated with a category name from the remoteCategoryAsJSON array.
 * @param {string} categoryName - Name of the category.
 * @returns {string|null} - Color code of the category, or null if not found.
 */
function findColorByName(categoryName) {
  for (let i = 0; i < remoteCategoryAsJSON.length; i++) {
    if (remoteCategoryAsJSON[i].name === categoryName) {
      return remoteCategoryAsJSON[i].color;
    }
  }
  return null;
}

/**
 * Renders task cards within a specified container for a given status.
 * @param {string} container - ID of the container to render task cards in.
 * @param {string} status - Status of the tasks to be rendered.
 */
function renderTaskCards(container, status) {
  let cardIndex = 0;
  document.getElementById(container).innerHTML = "";
  for (let i = 0; i < remoteTasksAsJSON.length; i++) {
    const taskContainer = document.getElementById(container);
    const task = remoteTasksAsJSON[i];
    if (task["status"] === status) {
      let cardID = remoteTasksAsJSON[i]["status"] + cardIndex;

      taskContainer.innerHTML += taskCardHTML(i, cardID);
      renderAssignedTo(i, `assignedToContainerSmall${i}`);
      cardIndex++;
    }
  }
}

/**
 * Retrieves and renders the description of a task.
 * @param {number} i - Index of the task in the remoteTasksAsJSON array.
 * @returns {string} - Description of the task.
 */
function renderTaskDescription(i) {
  let description = remoteTasksAsJSON[i]["description"];
  return description;
}

/**
 * Checks if a status container is empty and adjusts its min-height if necessary.
 */
function isEmptyStatusContainer() {
  let statusContainers = document.querySelectorAll('.statusContainer');
  statusContainers.forEach(c => {
    if (c.innerHTML == '') {
      c.style.minHeight = '100px';
    }
  })
}

/**
 * Opens the task card with detailed information and assigns the provided index and cardID.
 * @param {number} i - Index of the task in the remoteTasksAsJSON array.
 * @param {string} cardID - ID of the task card.
 */
function openTaskCard(i, cardID) {
  const taskLayer = document.getElementById("taskLayer");
  taskLayer.style.zIndex = "1";
  if (window.innerWidth > 670) {
    taskLayer.style.zIndex = "103";
  } else {
    taskLayer.style.zIndex = "1";
  }
  taskLayer.innerHTML = openTaskCardHTML(i, cardID);
  openTaskID = cardID;
  displayLayer();
  renderAssignedTo(i, "assignedTo-container");
  renderClosingArrow();
  document.body.style.overflow = "hidden";
  fillAssignedContactNames();
}



/**
 * Fills the assignedContactNames array with contact names from assignedToContainer.
 */
function fillAssignedContactNames() {
  let assignedToContainer = document.querySelectorAll(".assignedTo-row p");
  assignedToContainer.forEach((container) => {
    let name = container;
    assignedContactNames.push(name.innerHTML);
  });
}

/**
 * Opens the edit form for a task card and pre-fills the fields with task information.
 * @param {number} taskIndex - Index of the task in the remoteTasksAsJSON array.
 */
function editTaskCard(taskIndex) {
  let openCardContainer = document.querySelector(".task-card-big");
  openCardContainer.innerHTML = editTaskCardHTML(taskIndex);
  fillEditFields(taskIndex);
  addContactNamesToAssignedTo();
  renderSubtask(taskIndex);
  openTaskIndex = taskIndex;
  excludeNamesInDropdown();
}

/**
 * Excludes assigned contact names from the contact dropdown options.
 */
function excludeNamesInDropdown() {
  for (let i = 0; i < assignedContactNames.length; i++) {
    const name = assignedContactNames[i];
    let dropdownNames = document.querySelectorAll(".option");

    dropdownNames.forEach((dropdownName) => {
      let contactName = dropdownName.innerHTML;
      if (contactName.includes(name)) {
        dropdownName.classList.add('d-none');
      }
      // Your code logic for each dropdownName goes here
    });
  }
}

/**
 * Fills the edit form fields with task information for editing.
 * @param {number} taskIndex - Index of the task in the remoteTasksAsJSON array.
 */
function fillEditFields(taskIndex) {
  let titleInputField = document.getElementById("addTaskTitle");
  let descriptionInputField = document.getElementById("addTaskDescription");
  let dueDateField = document.getElementById("date");
  let prio = remoteTasksAsJSON[taskIndex]["priority"];
  assignedToArray = remoteTasksAsJSON[taskIndex]["assignedTo"];

  titleInputField.value = remoteTasksAsJSON[taskIndex]["title"];
  descriptionInputField.value = remoteTasksAsJSON[taskIndex]["description"];
  dueDateField.value = remoteTasksAsJSON[taskIndex]["dueDate"];

  setPrio(prio);
  pushToAssignedContact(assignedToArray);
  renderAssignedToEdit();
}

/**
 * Saves the changes made to a task card and updates the task in the remoteTasksAsJSON array.
 * Also updates the assignedContacts array and re-initializes the board.
 */
async function saveChanges() {
  const titleInputFieldValue = document.getElementById("addTaskTitle").value;
  const descriptionInputFieldValue = document.getElementById("addTaskDescription").value;
  const dueDateFieldValue = document.getElementById("date").value;

  const updatedTask = {
    ...remoteTasksAsJSON[openTaskIndex],
    title: titleInputFieldValue,
    description: descriptionInputFieldValue,
    dueDate: dueDateFieldValue,
    priority: priority,
    assignedTo: assignedContacts,
  };

  remoteTasksAsJSON[openTaskIndex] = updatedTask;

  loadSubtasks();
  await setItem("tasksRemote", remoteTasksAsJSON);

  openTaskCard(openTaskIndex, openTaskID);

  assignedContacts = [];

  await initBoard();
}

/**
 * Updates the status of subtasks in the remoteTasksAsJSON array based on their checkbox status.
 */
function loadSubtasks() {
  let subtaskContainer = document.getElementById("editSubtaskContainer");

  for (let i = 0; i < subtaskContainer.childElementCount; i++) {
    let subtask = subtaskContainer.children[i];
    let checkbox = subtask.querySelector(".checkbox");
    let storageSubtask = remoteTasksAsJSON[openTaskIndex]["subtasks"][i];
    if (checkbox.checked) {
      storageSubtask.status = "done";
    } else {
      storageSubtask.status = "inProgress";
    }
  }
}

/**
 * Pushes contacts from assignedToArray into the assignedContacts array.
 * @param {Array} assignedToArray - Array of contacts assigned to a task.
 */
function pushToAssignedContact(assignedToArray) {
  for (let i = 0; i < assignedToArray.length; i++) {
    const contact = assignedToArray[i];
    assignedContacts.push(contact);
  }
}

/**
 * Renders assigned contact names and initials for editing a task.
 */
function renderAssignedToEdit() {
  let chosenContacts = document.getElementById("chosenContacts");
  for (let i = 0; i < assignedContacts.length; i++) {
    const contact = assignedContacts[i];
    let color = contact["color"];
    let assignedToName = contact["name"];
    let initials = getInitials(assignedToName);
    let contactIndex = contacts.findIndex((c) => {
      return (
        c.name === contact.name &&
        c.color === contact.color &&
        c.email === contact.email &&
        c.phone === contact.phone
      );
    });
    if (chosenContacts.children.length < 5) {
      chosenContacts.innerHTML += `<div onclick="removeContact(${contactIndex})" style="background-color:${color}" class="chosenContactInitials">
      ${initials}</div>`;
    }
  }
}

/**
 * Renders the closing arrow based on window width.
 */
function renderClosingArrow() {
  let arrow = document.querySelector(".task-card-arrow");
  if (window.innerWidth > 670) {
    arrow.style.display = "none";
  } else {
    arrow.style.display = "unset";
  }
}

/**
 * Renders the close button based on window width.
 */
function renderCloseBtn() {
  const closeBtn = document.querySelector(".task-card-closeBtn");
  if (window.innerWidth > 670) {
    closeBtn.style.display = "unset";
  } else {
    closeBtn.style.display = "none";
  }
}

/**
 * Deletes a task card from the board and updates the remoteTasksAsJSON array.
 * @param {number} cardIndex - Index of the card in the remoteTasksAsJSON array.
 * @param {string} cardID - ID of the card element.
 */
async function deleteCard(cardIndex, cardID) {
  const card = document.getElementById(cardID);
  card.remove();
  remoteTasksAsJSON.splice(cardIndex, 1);
  clearContainers(["todo", "inProgress", "awaitingFeedback", "done"]);
  setItem("tasksRemote", remoteTasksAsJSON);
  remoteTasksAsJSON = await getRemoteData("tasksRemote");
  initBoard();
  closeLayer();
  document.body.style.overflow = "auto";
}

/**
 * Retrieves remote data from local storage using the specified key.
 * @param {string} key - The key to retrieve data from local storage.
 * @returns {Promise} - A promise containing the parsed JSON data.
 */
async function getRemoteData(key) {
  let res = await getItem(key);
  return JSON.parse(res.data.value.replace(/'/g, '"'));
}

/**
 * Clears the HTML content of specified container elements.
 * @param {Array} containerIds - Array of container element IDs to clear.
 */
function clearContainers(containerIds) {
  containerIds.forEach((containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
  });
}

/**
 * Renders the urgency icon based on the priority of the task.
 * @param {number} i - Index of the task in remoteTasksAsJSON array.
 * @returns {string} - Path to the urgency icon image.
 */
function renderUrgencyImg(i) {
  const urgency = remoteTasksAsJSON[i]["priority"];
  if (urgency == "urgent") {
    return "assets/icons/urgent.png";
  } else if (urgency == "medium") {
    return "assets/icons/medium.png";
  } else {
    return "assets/icons/low.png";
  }
}

/**
 * Renders the urgency label based on the priority of the task.
 * @param {number} i - Index of the task in remoteTasksAsJSON array.
 * @returns {string} - Path to the urgency label image.
 */
function renderUrgencyLabel(i) {
  const urgency = remoteTasksAsJSON[i]["priority"];
  if (urgency == "urgent") {
    return "assets/icons/urgent-label.png";
  } else if (urgency == "medium") {
    return "assets/icons/medium-label.png";
  } else {
    return "assets/icons/low-label.png";
  }
}

/**
 * Renders the assigned contact names and initials for a task.
 * @param {number} taskID - Index of the task in remoteTasksAsJSON array.
 * @param {string} containerClass - Class name of the container to render the assigned contacts.
 */
function renderAssignedTo(taskID, containerClass) {
  const container = document.getElementById(containerClass);
  const assignedToArray = remoteTasksAsJSON[taskID]["assignedTo"];

  for (let i = 0; i < assignedToArray.length; i++) {
    const assignedTo = assignedToArray[i];
    const assignedToName = assignedTo["name"];
    const contactColor = assignedTo["color"];
    const initials = getInitials(assignedToName);
    if (container.id === "assignedTo-container") {
      container.innerHTML += assignedToHTML(contactColor, initials, assignedToName);
    } else {
      container.innerHTML += assignedToCardHTML(contactColor, initials, assignedToName);
    }
  }
}

/**
 * Displays the task layer and handles the click event to close the layer.
 */
function displayLayer() {
  let layer = document.getElementById("taskLayer");
  layer.style.display = "flex";
  layer.addEventListener("click", (event) => {
    if (event.target === layer) {
      closeSlideInContainer();
      closeLayer();
      closeTaskCardBig();
      assignedContacts = [];
      document.body.style.overflow = "auto";
    }
  });
}

/**
 * Closes the slide-in container, the task layer, and the task card modal.
 */
function closeSlideInBtn() {
  closeSlideInContainer();
  closeLayer();
  closeTaskCardBig();
  document.body.style.overflow = "auto";
}


/**
 * Closes the slide-in container and adjusts the layer visibility.
 */
function closeSlideInContainer() {
  const slideInContainer = document.getElementById("slideInContainer");
  const taskLayer = document.getElementById("taskLayer");
  taskLayer.style.zIndex = "103";
  if (slideInContainer) {
    slideInContainer.style.transform = "translateX(200%)";
  }
}

/**
 * Closes the expanded task card modal.
 */
function closeTaskCardBig() {
  const taskCardBig = document.querySelector(".task-card-big");
  if (taskCardBig) {
    taskCardBig.style.display = "none";
  }
}

/**
 * Closes the task layer and resets associated variables.
 */
function closeLayer() {
  let layer = document.getElementById("taskLayer");
  setTimeout(() => {
    layer.style.display = "none";
  }, 200),
    layer.removeEventListener("click", displayLayer);
  subtaskCount = 0;
  assignedContactNames = [];
}

/**
 * Displays the slide-in container for a specific task status.
 * @param {string} status - Status of the task.
 */
function slideInContainer(status) {
  displayLayer();
  const taskLayer = document.getElementById("taskLayer");
  taskLayer.style.zIndex = "1000";
  taskLayer.innerHTML = slideInHTML(status);
  setTimeout(() => {
    const slideInContainer = document.getElementById("slideInContainer");
    slideInContainer.style.display = "flex";
    slideInContainer.style.transform = "translateX(0%)";
  }, 100);
  addContactNamesToAssignedTo();
  addCategories();
  addSubtaskEventListener();
  document.body.style.overflow = "hidden";
}

/**
 * Filters task cards based on the search input.
 */
document.addEventListener("input", function (event) {
  if (event.target.id === "searchInput") {
    filterCards();
  }
});

/**
 * Filters task cards based on the search input value.
 */
function filterCards() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".task-card");

  cards.forEach((card) => {
    const header = card.querySelector(".task-title").innerHTML.toLowerCase();
    const description = card.querySelector(".task-description").innerHTML.toLowerCase();
    if (header.includes(query) || description.includes(query)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

/**
 * Counts the number of subtasks that are marked as "done" for a given task.
 * @param {number} i - Index of the task in remoteTasksAsJSON array.
 * @returns {number} - Count of completed subtasks.
 */
function countDoneSubtasks(i) {
  let doneSubtasks = remoteTasksAsJSON[i]["subtasks"].filter(
    (subtask) => subtask.status === "done"
  );
  let doneSubtasksCount = doneSubtasks.length;
  return doneSubtasksCount;
}

/**
 * Calculates and returns the progress percentage of completed subtasks for a task.
 * @param {number} i - Index of the task in remoteTasksAsJSON array.
 * @returns {number} - Progress percentage.
 */
function renderProgress(i) {
  let doneCount = countDoneSubtasks(i);
  let subtaskLength = remoteTasksAsJSON[i]["subtasks"].length;
  let percentage = (doneCount / subtaskLength) * 100;
  if (subtaskLength == 0) {
    return 0;
  } else {
    return percentage;
  }
}

// -----------------------drag-&-drop ----------------------------//

let currentDraggedElement;

/**
 * Initiates the dragging operation for a task.
 * @param {number} i - Index of the task in remoteTasksAsJSON array.
 */
function startDragging(i) {
  currentDraggedElement = i;
}

/**
 * Moves a task to the specified status and updates the data accordingly.
 * @param {string} status - New status of the task.
 */
async function moveTo(status) {
  remoteTasksAsJSON[currentDraggedElement]["status"] = status;
  await setItem("tasksRemote", remoteTasksAsJSON);
  remoteTasksAsJSON = await getRemoteData("tasksRemote");
  initBoard();
  removeHighlight(status);
}

/**
 * Allows dropping tasks by preventing the default behavior.
 * @param {Event} ev - The dragover event object.
 */
function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * Highlights the drop container when a task is dragged over it.
 * @param {string} id - ID of the drop container.
 */
function highlight(id) {
  let container = document.getElementById(id);
  container.style.transition = "background-color 0.5s";
  container.style.backgroundColor = "#d1d1d1";
}

/**
 * Removes the highlight from the drop container.
 * @param {string} id - ID of the drop container.
 */
function removeHighlight(id) {
  let container = document.getElementById(id);
  container.style.transition = "background-color 0.5s";
  container.style.backgroundColor = "#f6f7f8";
}

/**
 * Highlights all drop containers for better visibility during drag-and-drop.
 */
function highlightAll() {
  let statusContainers = document.querySelectorAll(".statusContainer");
  statusContainers.forEach((container) => {
    container.style.border = "1px dashed black";
    container.style.transition = "border 0.5s";
  });
}

/**
 * Removes the highlight from all drop containers.
 */

function removeHighlightAll() {
  let statusContainers = document.querySelectorAll(".statusContainer");
  if (statusContainers) {
    statusContainers.forEach((container) => {
      container.style.border = "none";
      container.style.transition = "none";
    });
  }
}

/**
 * Toggles the display of a dropdown menu for a task.
 * @param {Event} event - The click event object.
 * @param {number} i - Index of the task in remoteTasksAsJSON array.
 */
function toggleDropdown(event, i) {
  event.stopPropagation();
  let dropdownContent = document.getElementById(`dropdown-content${i}`);
  dropdownContent.style.transition = "opacity 0.3s ease";
  if (dropdownContent.style.display === "" || dropdownContent.style.display === "none") {
    dropdownContent.style.opacity = "0";
    dropdownContent.style.display = "block";
    setTimeout(() => {
      dropdownContent.style.opacity = "1";
    }, 10);
  } else {
    dropdownContent.style.opacity = "0";
    dropdownContent.style.display = "none";
  }
  function hideDropdown(event) {
    if (!event.target.closest(".container")) {
      dropdownContent.style.opacity = "0";
      dropdownContent.style.display = "none";
      document.removeEventListener("click", hideDropdown);
    }
  }
  if (dropdownContent.style.display === "block") {
    document.addEventListener("click", hideDropdown);
  }
}

/**
 * Handles the selection of an option from the dropdown menu for task status.
 * Updates the task's status and triggers data updates.
 * @param {Event} event - The click event object.
 * @param {number} option - The selected option (1 to 4).
 * @param {number} i - Index of the task in remoteTasksAsJSON array.
 * @param {string} status - New status of the task.
 */
async function selectOption(event, option, i, status) {
  event.stopPropagation();
  let dropdownBtn = document.getElementById(`dropdown-btn${option}`);
  let taskContainer = remoteTasksAsJSON[i];
  dropdownBtn.classList.remove("highlighted");

  if (option >= 1 && option <= 4) {
    dropdownBtn.classList.add("highlighted");
    taskContainer["status"] = status;
    await setItem("tasksRemote", remoteTasksAsJSON);
    await initBoard();
  }
}

/**
 * Toggles the visibility of dropdown buttons based on window width.
 * Displays the buttons on smaller screens and hides on larger screens.
 */
function toggleButtonVisibility() {
  const button = document.getElementById("dropdown-btn${i}");
  let buttons = document.querySelectorAll(".dropdown-btn");
  buttons.forEach((button) => {
    if (window.innerWidth < 671) {
      button.style.display = "block";
    } else {
      button.style.display = "none";
    }
  });
}

// Listen for window resize events and adjust button visibility accordingly
window.addEventListener("resize", toggleButtonVisibility);
