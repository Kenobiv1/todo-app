// script.js

// Select DOM elements
const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');

// Filter buttons
const filterAll = document.getElementById('filter-all');
const filterActive = document.getElementById('filter-active');
const filterCompleted = document.getElementById('filter-completed');

// Theme toggle elements
const themeSwitch = document.getElementById('theme-switch');
const body = document.body;

// Retrieve to-dos from Local Storage or initialize an empty array
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Current filter: 'all', 'active', 'completed'
let currentFilter = 'all';

// Function to generate a unique ID for each task
function generateID() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Function to display to-dos with filtering
function displayTodos(searchQuery = '') {
    // Clear the current list
    todoList.innerHTML = '';

    // Iterate over the original todos array
    todos.forEach((todo) => {
        // Determine if the task should be displayed based on the current filter
        if (currentFilter === 'all' ||
            (currentFilter === 'active' && !todo.completed) ||
            (currentFilter === 'completed' && todo.completed)) {

            // If there's a search query, filter based on task text
            if (todo.text.toLowerCase().includes(searchQuery.toLowerCase())) {

                const li = document.createElement('li');
                li.className = 'todo-item';

                // Create checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = todo.completed || false;
                checkbox.addEventListener('change', () => toggleCompletion(todo.id));

                // Create span for task text
                const span = document.createElement('span');
                span.textContent = todo.text;
                if (todo.completed) {
                    span.classList.add('completed');
                }

                // Create edit button
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-button';
                editBtn.textContent = 'Edit';
                editBtn.setAttribute('data-id', todo.id);
                editBtn.addEventListener('click', () => editTodo(todo.id));

                // Create delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-button';
                deleteBtn.textContent = 'Delete';
                deleteBtn.setAttribute('data-id', todo.id);
                deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

                // Append elements to li
                li.appendChild(checkbox);
                li.appendChild(span);
                li.appendChild(editBtn);
                li.appendChild(deleteBtn);
                todoList.appendChild(li);
            }
        }
    });
}

// Function to add a new to-do
function addTodo() {
    const newTodoText = todoInput.value.trim();
    if (newTodoText !== '') {
        const newTodo = {
            id: generateID(),
            text: newTodoText,
            completed: false
        };
        todos.push(newTodo);
        updateLocalStorage();
        displayTodos();
        todoInput.value = '';
    } else {
        alert('Please enter a task.');
    }
}

// Function to delete a to-do by ID
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    updateLocalStorage();
    displayTodos();
}

// Function to toggle completion status by ID
function toggleCompletion(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    updateLocalStorage();
    displayTodos();
}

// Function to edit a to-do by ID
function editTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (!todo) return;

    const newText = prompt("Edit your task:", todo.text);
    if (newText !== null) { // If user didn't click cancel
        const trimmedText = newText.trim();
        if (trimmedText !== '') {
            todos = todos.map(todo => {
                if (todo.id === id) {
                    return { ...todo, text: trimmedText };
                }
                return todo;
            });
            updateLocalStorage();
            displayTodos();
        } else {
            alert('Task cannot be empty.');
        }
    }
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

// Event Listener for Add Button
addButton.addEventListener('click', addTodo);

// Event Listener for Enter Key
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

// Initial load
loadTheme();
displayTodos();
