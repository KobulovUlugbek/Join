let openTaskIndex;
let openTaskID;
let assignedToArray;
let remoteTasksAsJSON;
let assignedContactNames = [];

async function initBoard() {
  remoteTasksAsJSON = await getRemoteData("tasksRemote");
  remoteCategoryAsJSON = await getRemoteData("categoryRemote");
  renderTaskCards("todo", "todo");
  renderTaskCards("inProgress", "inProgress");
  renderTaskCards("awaitingFeedback", "awaitingFeedback");
  renderTaskCards("done", "done");
  toggleButtonVisibility();
  isEmptyStatusContainer();
}

function renderCategoryLabelColor(i) {
  let categoryName =
    remoteTasksAsJSON[i]["category"].charAt(0).toUpperCase() +
    remoteTasksAsJSON[i]["category"].slice(1);
  let labelColor = findColorByName(categoryName);

  return labelColor;
}

function findColorByName(categoryName) {
  for (let i = 0; i < remoteCategoryAsJSON.length; i++) {
    if (remoteCategoryAsJSON[i].name === categoryName) {
      return remoteCategoryAsJSON[i].color;
    }
  }
  return null;
}

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

function renderTaskDescription(i) {
  let description = remoteTasksAsJSON[i]["description"];
  return description;
}

function isEmptyStatusContainer(){
  let statusContainers = document.querySelectorAll('.statusContainer');
  statusContainers.forEach( c => {
    if (c.innerHTML == '') {
      c.style.minHeight = '100px';
    }
  })
}

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

function fillAssignedContactNames() {
  let assignedToContainer = document.querySelectorAll(".assignedTo-row p");
  assignedToContainer.forEach((container) => {
    let name = container;
    assignedContactNames.push(name.innerHTML);
  });
}

function editTaskCard(taskIndex) {
  let openCardContainer = document.querySelector(".task-card-big");
  openCardContainer.innerHTML = editTaskCardHTML(taskIndex);
  fillEditFields(taskIndex);
  addContactNamesToAssignedTo();
  renderSubtask(taskIndex);
  openTaskIndex = taskIndex;
  excludeNamesInDropdown();
}

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

function pushToAssignedContact(assignedToArray) {
  for (let i = 0; i < assignedToArray.length; i++) {
    const contact = assignedToArray[i];
    assignedContacts.push(contact);
  }
}

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

function renderClosingArrow() {
  let arrow = document.querySelector(".task-card-arrow");
  if (window.innerWidth > 670) {
    arrow.style.display = "none";
  } else {
    arrow.style.display = "unset";
  }
}

function renderCloseBtn() {
  const closeBtn = document.querySelector(".task-card-closeBtn");
  if (window.innerWidth > 670) {
    closeBtn.style.display = "unset";
  } else {
    closeBtn.style.display = "none";
  }
}

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

async function getRemoteData(key) {
  let res = await getItem(key);
  return JSON.parse(res.data.value.replace(/'/g, '"'));
}

function clearContainers(containerIds) {
  containerIds.forEach((containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
  });
}

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

function closeSlideInBtn() {
  closeSlideInContainer();
  closeLayer();
  closeTaskCardBig();
  document.body.style.overflow = "auto";
}

function closeSlideInContainer() {
  const slideInContainer = document.getElementById("slideInContainer");
  const taskLayer = document.getElementById("taskLayer");
  taskLayer.style.zIndex = "103";
  if (slideInContainer) {
    slideInContainer.style.transform = "translateX(200%)";
  }
}

function closeTaskCardBig() {
  const taskCardBig = document.querySelector(".task-card-big");
  if (taskCardBig) {
    taskCardBig.style.display = "none";
  }
}

function closeLayer() {
  let layer = document.getElementById("taskLayer");
  setTimeout(() => {
    layer.style.display = "none";
  }, 200),
    layer.removeEventListener("click", displayLayer);
  subtaskCount = 0;
  assignedContactNames = [];
}

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

document.addEventListener("input", function (event) {
  if (event.target.id === "searchInput") {
    filterCards();
  }
});

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

function countDoneSubtasks(i) {
  let doneSubtasks = remoteTasksAsJSON[i]["subtasks"].filter(
    (subtask) => subtask.status === "done"
  );
  let doneSubtasksCount = doneSubtasks.length;
  return doneSubtasksCount;
}

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

function startDragging(i) {
  currentDraggedElement = i;
}

async function moveTo(status) {
  remoteTasksAsJSON[currentDraggedElement]["status"] = status;
  await setItem("tasksRemote", remoteTasksAsJSON);
  remoteTasksAsJSON = await getRemoteData("tasksRemote");
  initBoard();
  removeHighlight(status);
}

function allowDrop(ev) {
  ev.preventDefault();
}

function highlight(id) {
  let container = document.getElementById(id);
  container.style.transition = "background-color 0.5s";
  container.style.backgroundColor = "#d1d1d1";
}

function removeHighlight(id) {
  let container = document.getElementById(id);
  container.style.transition = "background-color 0.5s";
  container.style.backgroundColor = "#f6f7f8";
}

function highlightAll() {
  let statusContainers = document.querySelectorAll(".statusContainer");
  statusContainers.forEach((container) => {
    container.style.border = "1px dashed black";
    container.style.transition = "border 0.5s";
  });
}

function removeHighlightAll() {
  let statusContainers = document.querySelectorAll(".statusContainer");
  if (statusContainers) {
    statusContainers.forEach((container) => {
      container.style.border = "none";
      container.style.transition = "none";
    });
  }
}

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

window.addEventListener("resize", toggleButtonVisibility);
