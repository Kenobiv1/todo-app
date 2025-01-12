// script.js

// Select DOM elements
const todoInput = document.getElementById('todo-input');
const todoDate = document.getElementById('todo-date');
const todoTime = document.getElementById('todo-time');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');

// Filter buttons
const filterAll = document.getElementById('filter-all');
const filterActive = document.getElementById('filter-active');
const filterCompleted = document.getElementById('filter-completed');

// Theme toggle elements
const themeSwitch = document.getElementById('theme-switch');
const body = document.body;

// Modal elements
const modalContainer = document.getElementById('modal-container');

// Alert Modal Elements
const alertModal = document.querySelector('.alert-modal');
const alertMessage = document.getElementById('alert-message');
const alertOkButton = document.getElementById('alert-ok-button');

// Prompt Modal Elements
const promptModal = document.querySelector('.prompt-modal');
const promptMessage = document.getElementById('prompt-message');
const promptInput = document.getElementById('prompt-input');
const promptDate = document.getElementById('prompt-date'); // **NEW: Added**
const promptTime = document.getElementById('prompt-time'); // **NEW: Added**
const promptCancelButton = document.getElementById('prompt-cancel-button');
const promptOkButton = document.getElementById('prompt-ok-button');

// Retrieve to-dos from Local Storage or initialize an empty array
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Current filter: 'all', 'active', 'completed'
let currentFilter = 'all';

// Function to generate a unique ID for each task
function generateID() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Function to format date (YYYY-MM-DD) to a more readable format (e.g., Jan 1, 2025)
function formatDate(dateStr) {
    if (!dateStr) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, options);
}

// Function to format time (HH:MM) to a more readable format (e.g., 2:30 PM)
function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Function to create a single to-do list item
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.setAttribute('data-id', todo.id);

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleCompletion(todo.id));

    // Create span for task text
    const span = document.createElement('span');
    span.textContent = todo.text;
    if (todo.completed) {
        span.classList.add('completed');
    }

    // Create due date span if dueDate exists
    let dueDateSpan = null;
    if (todo.dueDate) {
        dueDateSpan = document.createElement('span');
        dueDateSpan.className = 'due-date';
        dueDateSpan.textContent = `Due: ${formatDate(todo.dueDate)}`;
    }

    // Create due time span if dueTime exists
    let dueTimeSpan = null;
    if (todo.dueTime) {
        dueTimeSpan = document.createElement('span');
        dueTimeSpan.className = 'due-time';
        dueTimeSpan.textContent = `@ ${formatTime(todo.dueTime)}`;
    }

    // Create edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-button';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.setAttribute('data-id', todo.id);
    editBtn.addEventListener('click', () => openEditModal(todo.id));

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-button';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.setAttribute('data-id', todo.id);
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    // Append elements to li
    li.appendChild(checkbox);
    li.appendChild(span);
    if (dueDateSpan) li.appendChild(dueDateSpan);
    if (dueTimeSpan) li.appendChild(dueTimeSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    return li;
}

// Function to display to-dos with filtering
function displayTodos() {
    // Clear the current list
    todoList.innerHTML = '';

    // Iterate over the todos array
    todos.forEach((todo) => {
        // Determine if the task should be displayed based on the current filter
        if (
            currentFilter === 'all' ||
            (currentFilter === 'active' && !todo.completed) ||
            (currentFilter === 'completed' && todo.completed)
        ) {
            const todoElement = createTodoElement(todo);
            todoList.appendChild(todoElement);
        }
    });
}

// Function to add a new to-do
function addTodo() {
    const newTodoText = todoInput.value.trim();
    const newTodoDate = todoDate.value;
    const newTodoTime = todoTime.value;

    if (newTodoText !== '') {
        const newTodo = {
            id: generateID(),
            text: newTodoText,
            dueDate: newTodoDate || null, // Allow null if not set
            dueTime: newTodoTime || null, // Allow null if not set
            completed: false
        };
        todos.push(newTodo);
        updateLocalStorage();
        const newTodoElement = createTodoElement(newTodo);
        todoList.appendChild(newTodoElement);
        animateNewTask(newTodo.id);
        // Clear input fields
        todoInput.value = '';
        todoDate.value = '';
        todoTime.value = '';
    } else {
        openAlertModal('Please enter a task.');
    }
}

// Function to delete a to-do by ID
function deleteTodo(id) {
    const taskElement = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (taskElement) {
        taskElement.classList.add('fade-out');
        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id);
            updateLocalStorage();
            taskElement.remove();
        }, 500); // Match the animation duration in CSS
    }
}

// Function to toggle completion status by ID
function toggleCompletion(id) {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex > -1) {
        todos[todoIndex].completed = !todos[todoIndex].completed;
        updateLocalStorage();

        // Update the DOM element
        const taskSpan = document.querySelector(`.todo-item[data-id="${id}"] span`);
        if (taskSpan) {
            taskSpan.classList.toggle('completed');
        }
    }
}

// Function to open Edit Modal
function openEditModal(id) {
    const todo = todos.find(todo => todo.id === id);
    if (!todo) return;

    promptMessage.textContent = 'Edit your task:';
    promptInput.value = todo.text;
    // **NEW: Set date and time in the modal inputs**
    promptDate.value = todo.dueDate || '';
    promptTime.value = todo.dueTime || '';
    modalContainer.classList.remove('hidden');
    promptModal.classList.remove('hidden');
    alertModal.classList.add('hidden');
    promptInput.focus();

    // Handle OK button
    const handleOk = () => {
        const newText = promptInput.value.trim();
        const newDate = promptDate.value;
        const newTime = promptTime.value;

        if (newText !== '') {
            const todoIndex = todos.findIndex(todo => todo.id === id);
            if (todoIndex > -1) {
                todos[todoIndex].text = newText;
                todos[todoIndex].dueDate = newDate || null;
                todos[todoIndex].dueTime = newTime || null;
                updateLocalStorage();

                // Update the DOM element
                const taskSpan = document.querySelector(`.todo-item[data-id="${id}"] span`);
                if (taskSpan) {
                    taskSpan.textContent = newText;
                }

                // Update due date and time
                const dueDateSpan = document.querySelector(`.todo-item[data-id="${id}"] .due-date`);
                if (dueDateSpan) {
                    if (newDate) {
                        dueDateSpan.textContent = `Due: ${formatDate(newDate)}`;
                    } else {
                        dueDateSpan.remove();
                    }
                } else if (newDate) {
                    // If previously no due date, but now set
                    const taskItem = document.querySelector(`.todo-item[data-id="${id}"]`);
                    const newDueDateSpan = document.createElement('span');
                    newDueDateSpan.className = 'due-date';
                    newDueDateSpan.textContent = `Due: ${formatDate(newDate)}`;
                    taskItem.insertBefore(newDueDateSpan, taskItem.querySelector('.edit-button'));
                }

                const dueTimeSpan = document.querySelector(`.todo-item[data-id="${id}"] .due-time`);
                if (dueTimeSpan) {
                    if (newTime) {
                        dueTimeSpan.textContent = `@ ${formatTime(newTime)}`;
                    } else {
                        dueTimeSpan.remove();
                    }
                } else if (newTime) {
                    // If previously no due time, but now set
                    const taskItem = document.querySelector(`.todo-item[data-id="${id}"]`);
                    const newDueTimeSpan = document.createElement('span');
                    newDueTimeSpan.className = 'due-time';
                    newDueTimeSpan.textContent = `@ ${formatTime(newTime)}`;
                    taskItem.insertBefore(newDueTimeSpan, taskItem.querySelector('.edit-button'));
                }

                animateEditTask(id);
            }
            closeModal();
        } else {
            openAlertModal('Task cannot be empty.');
        }
    };

    // Handle Cancel button
    const handleCancel = () => {
        closeModal();
    };

    // Remove previous event listeners to prevent multiple bindings
    promptOkButton.replaceWith(promptOkButton.cloneNode(true));
    promptCancelButton.replaceWith(promptCancelButton.cloneNode(true));

    // Re-select buttons
    const newPromptOkButton = document.getElementById('prompt-ok-button');
    const newPromptCancelButton = document.getElementById('prompt-cancel-button');

    newPromptOkButton.addEventListener('click', handleOk);
    newPromptCancelButton.addEventListener('click', handleCancel);

    // **NEW: Add Event Listener for Enter Key in Prompt Inputs**
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleOk();
        }
    };

    // Attach the keypress event listener to all inputs in the modal
    promptInput.addEventListener('keypress', handleKeyPress);
    promptDate.addEventListener('keypress', handleKeyPress);
    promptTime.addEventListener('keypress', handleKeyPress);

    // Remove the keypress listeners when the modal is closed to prevent memory leaks
    const cleanup = () => {
        promptInput.removeEventListener('keypress', handleKeyPress);
        promptDate.removeEventListener('keypress', handleKeyPress);
        promptTime.removeEventListener('keypress', handleKeyPress);
    };

    // Modify the closeModal function to include cleanup
    const originalCloseModal = closeModal;
    window.closeModal = () => {
        originalCloseModal();
        cleanup();
    };
}

// Function to open Alert Modal
function openAlertModal(message) {
    alertMessage.textContent = message;
    modalContainer.classList.remove('hidden');
    alertModal.classList.remove('hidden');
    promptModal.classList.add('hidden');

    // Handle OK button
    const handleOk = () => {
        closeModal();
    };

    // Remove previous event listeners to prevent multiple bindings
    alertOkButton.replaceWith(alertOkButton.cloneNode(true));

    // Re-select button
    const newAlertOkButton = document.getElementById('alert-ok-button');
    newAlertOkButton.addEventListener('click', handleOk);
}

// Function to close modals
function closeModal() {
    modalContainer.classList.add('hidden');
    alertModal.classList.add('hidden');
    promptModal.classList.add('hidden');
}

// Function to set the current filter and update active button styling
function setFilter(filter) {
    currentFilter = filter;
    updateFilterButtons();
    displayTodos();
}

// Function to update active filter button styling
function updateFilterButtons() {
    // Remove 'active' class from all filter buttons
    document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));

    // Add 'active' class to the selected filter button
    if (currentFilter === 'all') {
        filterAll.classList.add('active');
    } else if (currentFilter === 'active') {
        filterActive.classList.add('active');
    } else if (currentFilter === 'completed') {
        filterCompleted.classList.add('active');
    }
}

// Function to update Local Storage
function updateLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Function to toggle theme
function toggleTheme() {
    body.classList.toggle('dark-mode');
    // Save the user's theme preference in localStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// Function to load theme preference from localStorage
function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        themeSwitch.checked = true;
    } else {
        body.classList.remove('dark-mode');
        themeSwitch.checked = false;
    }
}

// Initialize Sortable.js once
let sortable = null;

// Function to initialize Sortable.js on the todoList
function initializeSortable() {
    if (sortable) {
        sortable.destroy(); // Destroy the previous instance to prevent duplicates
    }

    sortable = Sortable.create(todoList, {
        animation: 150, // Smooth animation when dragging
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder
        onEnd: function (evt) {
            const itemEl = evt.item; // dragged HTMLElement
            const newIndex = evt.newIndex;

            // Get the task ID from the dragged element
            const draggedTaskId = itemEl.getAttribute('data-id');

            // Find the dragged task
            const draggedTask = todos.find(todo => todo.id === draggedTaskId);
            if (!draggedTask) return;

            // Remove the dragged task from its original position
            todos = todos.filter(todo => todo.id !== draggedTaskId);

            // Insert the dragged task at the new position
            todos.splice(newIndex, 0, draggedTask);

            // Update Local Storage
            updateLocalStorage();
        },
    });
}

// Optional: Animation functions for enhanced feedback
function animateNewTask(id) {
    const taskElement = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (taskElement) {
        taskElement.classList.add('fade-in');
        setTimeout(() => {
            taskElement.classList.remove('fade-in');
        }, 500);
    }
}

function animateEditTask(id) {
    const taskElement = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (taskElement) {
        taskElement.classList.add('highlight');
        setTimeout(() => {
            taskElement.classList.remove('highlight');
        }, 500);
    }
}

// Event Listener for Add Button
addButton.addEventListener('click', addTodo);

// Event Listener for Enter Key in Add Task Input
todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Event Listeners for Filter Buttons
filterAll.addEventListener('click', () => setFilter('all'));
filterActive.addEventListener('click', () => setFilter('active'));
filterCompleted.addEventListener('click', () => setFilter('completed'));

// Event Listener for Theme Toggle
themeSwitch.addEventListener('change', toggleTheme);

// Close modal when clicking outside the modal content
window.addEventListener('click', function(event) {
    if (event.target === modalContainer) {
        closeModal();
    }
});

// Close modal when pressing the Escape key
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !modalContainer.classList.contains('hidden')) {
        closeModal();
    }
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    displayTodos();
    initializeSortable();
});
