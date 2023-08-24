let subtaskCount = 0;

function taskCardHTML(i, cardID) {
  return /* html */ `
  <div draggable="true" ondragstart="startDragging(${i})"  class="task-card" id="${cardID}" onclick="openTaskCard(${i}, '${cardID}')">
    <div class="categoryHeader">
      <div class="category-label"
        style="background-color: ${renderCategoryLabelColor(i)};">
        ${
          remoteTasksAsJSON[i]["category"][0].toUpperCase() +
          remoteTasksAsJSON[i]["category"].slice(1)
        }
      </div>
      <div class="container">
        <button id="dropdown-btn${i}" class="dropdown-btn" onclick="toggleDropdown(event, ${i})">Move Task</button>
        <div id="dropdown-content${i}" class="dropdown-content">
          <div class="select-option" onclick="selectOption(event, 1, ${i}, 'todo')">To Do</div>
          <div class="select-option" onclick="selectOption(event, 2, ${i}, 'inProgress')">In Progress</div>
          <div class="select-option" onclick="selectOption(event, 3, ${i}, 'awaitingFeedback')">Awaiting Feedback</div>
          <div class="select-option" onclick="selectOption(event, 4, ${i}, 'done')">Done</div>
        </div>
      </div>

    </div>
    <div class="task-title">${remoteTasksAsJSON[i]["title"]}</div>
    <div class="task-description">
      ${renderTaskDescription(i)}
    </div>
    <div class="subtask-container">
      <div class="subtask-bar">
        <div class="progress" style="width:${renderProgress(i)}%"></div>
      </div>
      <p class="progress-text">${countDoneSubtasks(i)}/${
    remoteTasksAsJSON[i]["subtasks"].length
  } Done</p>
    </div>
    <div class="task-bottom">
      <div class="assignedToContainerSmall" id="assignedToContainerSmall${i}"></div>
      <div class="task-urgency-container">
        <img src="${renderUrgencyImg(i)}" />
      </div>
    </div>
  </div>`;
}

function openTaskCardHTML(i, cardID) {
  return /* html */ `
    <div class="task-card-big" id="${cardID}">
      <div class="task-card-big-content">
        <div class="category-label-big" style="background-color: ${renderCategoryLabelColor(
          i
        )};">
          ${
            remoteTasksAsJSON[i]["category"][0].toUpperCase() +
            remoteTasksAsJSON[i]["category"].slice(1)
          }
          <img src="assets/icons/arrow-left-black.png" class="task-card-arrow" onclick="closeSlideInBtn()">
        </div>
        <div class="task-title-big">${remoteTasksAsJSON[i]["title"]}</div>
        <div class="task-description-big">${renderTaskDescription(i)}</div>
        <div class="due-date"><b>Due date:</b> ${
          remoteTasksAsJSON[i]["dueDate"]
        }</div>
        <div class="task-card-priority"><b>Priority:</b> <img src="${renderUrgencyLabel(
          i
        )}" /></div>
        <span><b>Assigned To:</b></span>
        <div id="assignedTo-container"></div>
        <div class="open-task-buttons">
          <div class="delete-button" onclick="deleteCard(${i}, '${cardID}')">
            <img src="assets/icons/delete_black.png" />
          </div>
          <div class="edit-button" onclick="editTaskCard(${i})"><img src="assets/icons/Pencil_icon.png" /></div>
        </div>
      </div>

    </div>
  `;
}

function editTaskCardHTML(taskIndex) {
  return /* html */ `
      <div class="task-section-edit">
            <div>
              <p>Title</p>
              <input required id="addTaskTitle" placeholder="Enter a title" />
            </div>
            <div>
              <p>Description</p>
              <textarea
                required
                id="addTaskDescription"
                placeholder="Enter a Description"
                style="resize: none"
              ></textarea>
            </div>
            <div>
              <p>Due date</p>
              <input onclick='setMinDate()';
                required
                id="date"
                class="input pointer"
                type="date"
                min=""
              />
            </div>
            <div>
              <p>Prio</p>
              <div class="prio-section">
                <div
                  id="urgent"
                  onclick="setPrio('urgent')"
                  class="prio-btn pointer"
                >
                  Urgent <img id="urgentIcon" src="assets/icons/urgent.png" />
                </div>
                <div
                  id="medium"
                  onclick="setPrio('medium')"
                  class="prio-btn pointer"
                >
                  Medium <img id="mediumIcon" src="assets/icons/medium.png" />
                </div>
                <div
                  id="low"
                  onclick="setPrio('low')"
                  class="prio-btn pointer"
                >
                  Low <img id="lowIcon" src="assets/icons/low.png" />
                </div>
              </div>
            </div>
            <div>
              <p>Assigned to</p>
              <div class="content">
                <div
                  onclick="openDropdownContacts()"
                  id="selectContact"
                  class="selectContainer"
                >
                  Select contacts to assign
                </div>
                <div class="expand-container">
                  <div id="selectContactDropdown"></div>
                </div>
                <div id="chosenContacts" class="chosenContactsEdit"></div>
              </div>
            </div>
            <h3>Subtasks</h3>
            <div class="subtask-container">
              <div class="subtask-bar">
                <div class="progress" style="width:${renderProgress(
                  taskIndex
                )}%"></div>
              </div>
              <p class="progress-text">${countDoneSubtasks(taskIndex)}/${
    remoteTasksAsJSON[taskIndex]["subtasks"].length
  } Done</p>
            </div>
            <div id="editSubtaskContainer"></div>
            <div class="edit-okBtn" onclick="saveChanges()">Ok<img src="assets/icons/checkmark-white-small.png"></div>
        
  `;
}

function assignedToHTML(contactColor, initials, assignedToName) {
  return `
  <div class="assignedTo-row">
  <div class="initial-label" style="background-color:${contactColor}">${initials}</div><p>${assignedToName}</p>
  </div>
  `;
}

function assignedToCardHTML(contactColor, initials) {
  return `
  <div class="initial-label-card" style="background-color:${contactColor}">${initials}</div>
  `;
}

function slideInHTML(status) {
  return /* html */ `
      <div id="slideInContainer" class="task-form">
        <div class="slideInContainer-content">
          <div class="addTask-header">
            <h1>Add Task</h1>
            <img class="pointer" src="assets/icons/clear.png" onclick="closeSlideInBtn()" />
          </div>
          <form onsubmit="event.preventDefault(); createTask('${status}'); pushSubtasks()">
            <div class="task-section form-section-mobile">
              <div class="content-left">
                <div>
                  <p>Title</p>
                  <input required id="addTaskTitle" placeholder="Enter a title" />
                </div>
                <div>
                  <p>Description</p>
                  <textarea required
                    id="addTaskDescription"
                    placeholder="Enter a Description"
                    style="resize: none"
                  ></textarea>
                </div>
                <div>
                  <p>Category</p>
                  <div class="content">
                    <div class="d-none" id="newCat">
                      <div class="newCatOrg">
                        <input id="newCatInput" placeholder="Enter new category....">
                        <img onclick="closeNewCategory()" src="assets/icons/clear-subtask.png">
                        <img onclick="addNewCategory()" src="assets/icons/checkmark-black.png">
                      </div>
                      <div id="newCatColors"></div>
                    </div>
                    <div
                      onclick="openDropdownCategory()"
                      id="addTaskCategory"
                      class="selectContainer"
                    >
                      Select task category
                    </div>
                    <div class="expand-container">
                    <div id="categoryDropdown">
                      <div class="option" onclick="showNewCategory()">
                        New Category 
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
                <div>
                  <p>Assigned to</p>
                  <div class="content">
                    <div
                      onclick="openDropdownContacts()"
                      id="selectContact"
                      class="selectContainer"
                    >
                      Select contacts to assign
                    </div>
                    <div class="expand-container">
                      <div id="selectContactDropdown"></div>
                    </div>
                    <div
                      id="chosenContacts"
                      class="chosenContacts chosenContactsForm"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="content-right mobile-form-right">
                <div>
                  <p>Due date</p>
                  <input onclick='setMinDate()';
                  required
                  id="date"
                  class="input pointer"
                  type="date"
                  min=""
                />
                </div>
                <div>
                  <p>Prio</p>
                  <div class="prio-section">
                    <div
                      id="urgent"
                      onclick="setPrio('urgent')"
                      class="prio-btn pointer"
                    >
                      Urgent <img id="urgentIcon" src="assets/icons/urgent.png" />
                    </div>
                    <div
                      id="medium"
                      onclick="setPrio('medium')"
                      class="prio-btn pointer"
                    >
                      Medium <img id="mediumIcon" src="assets/icons/medium.png" />
                    </div>
                    <div
                      id="low"
                      onclick="setPrio('low')"
                      class="prio-btn pointer"
                    >
                      Low <img id="lowIcon" src="assets/icons/low.png" />
                    </div>
                  </div>
                </div>
                <div>
                  <p>Subtasks</p>
                  <div class="subtask-input-container">
                    <input
                      id="addTaskSubtask"
                      class="input"
                      type="text"
                      placeholder="Add new subtask"
                    />
                    <div id="subtask-buttons">
                      <img style="cursor: pointer" src="assets/icons/clear-subtask.png" onclick="emptySubtaskValue()">
                      <div class="seperator"></div>
                      <img style="cursor: pointer" src="assets/icons/checkmark-black.png" onclick="createNewSubtask()">
                    </div>
                  </div>
                  <div id="subtaskContainer">
          
                  </div>
                </div>
              </div>
            </div>
            <div class="button-container-form-board">
              <button type="button" onclick="resetValues()" class="clear-btn pointer">
                Clear &nbsp; x
              </button>
              <button type="submit"
                id="createTaskBtn"
                class="create-btn pointer"
              >
                Create Task <img src="assets/icons/check-white.png" />
              </button>
            </div>
          </form>
          <div id="taskAdded" class="taskAdded">
              Task added to board &nbsp; <img src="assets/icons/board-icon.svg" />
          </div>  
        </div>
      </div>
  `;
}

function subtaskHTML(inputFieldValue, i, subtaskStatus) {
  subtaskCount++;
  return /* html */ `
    <div id="subtask-${subtaskCount}" class="subtask">
      <input type="checkbox" class="checkbox" ${
        isSubtaskChecked(subtaskStatus) ? "checked" : ""
      } />
      <p>${inputFieldValue}</p>
    </div>
  `;
}
