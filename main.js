import { signOutUser } from './auth.js';



// User stats initialization
let todos, user = JSON.parse(localStorage.getItem('user')) || {
    level: 1,
    xp: 0,
    nextLevelXp: 100
};

// Function to update the user's level and XP display
function updateDisplay() {
    document.getElementById('user-level').textContent = user.level;
    document.getElementById('user-xp').textContent = user.xp;
    document.getElementById('next-level-xp').textContent = user.nextLevelXp;

    // Update progress bar width
    const xpProgress = (user.xp / user.nextLevelXp) * 100;
    document.querySelector('.progress-bar-inner').style.width = xpProgress + '%';
}
// Function to add XP and handle level up
function showLevelUpNotification(newLevel) {
    const notification = document.getElementById('level-up-notification');
    document.getElementById('new-level').textContent = newLevel;
    notification.style.display = 'block';
    playSound('/sfx/LevelUpSound.wav')

    // Hide the notification after a few seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}



function addXP(difficulty) {
    let xpToAdd;
    switch (difficulty) {
        case 'easy':
            xpToAdd = 10;
            break;
        case 'medium':
            xpToAdd = 20;
            break;
        case 'hard':
            xpToAdd = 30;
            break;
    }
    user.xp += xpToAdd;
    if (user.xp >= user.nextLevelXp) {
        user.level++;
        user.xp -= user.nextLevelXp;
        user.nextLevelXp += 10; // Increase the XP required for the next level

        // Show level-up notification
        showLevelUpNotification(user.level);
    }
    localStorage.setItem('user', JSON.stringify(user));
    updateDisplay();
}

// Function to display todos
function DisplayTodos() {
    const todoList = document.querySelector('#todo-list');
    todoList.innerHTML = '';

    todos.forEach((todo, index) => {
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item');

        const contentInput = document.createElement('input');
        contentInput.type = 'text';
        contentInput.value = todo.content;
        contentInput.readOnly = true;
        contentInput.classList.add('task-input'); // Add class for styling
        todoItem.appendChild(contentInput);

        const difficultySelect = document.createElement('select');
        difficultySelect.style.display = 'none'; // Hide selector initially
        ['easy', 'medium', 'hard'].forEach(difficulty => {
            const option = document.createElement('option');
            option.value = difficulty;
            option.text = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            option.selected = todo.difficulty === difficulty;
            difficultySelect.appendChild(option);
        });
        todoItem.appendChild(difficultySelect);

        const actions = document.createElement('div');
        actions.classList.add('actions');
        todoItem.appendChild(actions);

        const completeButton = document.createElement('button');
        completeButton.classList.add('complete');
        completeButton.textContent = 'Complete Quest';
        actions.appendChild(completeButton);

        const editButton = document.createElement('button');
        editButton.classList.add('edit');
        editButton.textContent = 'Edit';
        actions.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete');
        deleteButton.textContent = 'Delete';
        actions.appendChild(deleteButton);

        todoList.appendChild(todoItem);

        completeButton.addEventListener('click', () => {
            addXP(todo.difficulty);
            todos.splice(index, 1);
            localStorage.setItem('todos', JSON.stringify(todos));
            DisplayTodos();

            playSound('/sfx/CompleteQuestSound.wav');
        });

        editButton.addEventListener('click', () => {
            if (editButton.textContent === 'Edit') {
                contentInput.readOnly = false;
                difficultySelect.style.display = 'block'; // Show selector
                editButton.textContent = 'Save';
                contentInput.focus();
            } else {
                contentInput.readOnly = true;
                difficultySelect.style.display = 'none'; // Hide selector
                todo.content = contentInput.value;
                todo.difficulty = difficultySelect.value;
                localStorage.setItem('todos', JSON.stringify(todos));
                DisplayTodos();
            }
        });

        deleteButton.addEventListener('click', () => {
            todos.splice(index, 1);
            localStorage.setItem('todos', JSON.stringify(todos));
            DisplayTodos();
        });

        if (todo.done) {
            todoItem.classList.add('done');
            completeButton.disabled = true;
        }
    });
}


// Event listener for form submission
window.addEventListener('load', () => {
    todos = JSON.parse(localStorage.getItem('todos')) || [];
    const nameInput = document.querySelector('#name');
    const newTodoForm = document.querySelector('#new-todo-form');

    nameInput.value = localStorage.getItem('username') || '';
    nameInput.addEventListener('change', e => {
        localStorage.setItem('username', e.target.value);
    });

    newTodoForm.addEventListener('submit', e => {
        e.preventDefault();
        const newTodo = {
            content: e.target.elements.content.value,
            difficulty: e.target.elements.difficulty.value,
            done: false,
            createdAt: new Date().getTime()
        };
        todos.push(newTodo);
        localStorage.setItem('todos', JSON.stringify(todos));
        DisplayTodos();
        e.target.reset();

        playSound('/sfx/newQuestSound.wav'); 
    });

    DisplayTodos();
    updateDisplay();
});


function showSection(sectionId) {
    document.getElementById("mainContent").style.display = "none";
    document.getElementById("settings").style.display = "none";
    document.getElementById("challenges").style.display = "none";
    document.getElementById(sectionId).style.display = "block";
}



document.addEventListener('DOMContentLoaded', () => {
    // Initialize the default difficulty based on stored preference
    const storedDefaultDifficulty = localStorage.getItem('defaultDifficulty') || 'easy';
    const defaultDifficultyRadios = document.querySelectorAll('input[name="defaultDifficulty"]');
    defaultDifficultyRadios.forEach((radio) => {
        radio.checked = radio.value === storedDefaultDifficulty;
        radio.addEventListener('change', function() {
            localStorage.setItem('defaultDifficulty', this.value);
        });
    });

    // Set the default difficulty for the new-todo-form
    document.querySelectorAll('#new-todo-form input[name="difficulty"]').forEach((radio) => {
        radio.checked = radio.value === storedDefaultDifficulty;
    });

    // Apply saved sound setting
    const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    document.getElementById('sound').checked = soundEnabled;

    // Setup tab switching functionality
    setupTabButtons();

    // Logout functionality
    setupLogoutButton();

    // Setup save functionality for settings form
    setupSettingsForm();

    // Initialize the theme
    initializeTheme();

    });

function setupTabButtons() {
    const tabButtons = document.querySelectorAll('.tab-links button');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            showSection(btn.getAttribute('data-section'));
        });
    });
}

function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOutUser()
                .then(() => window.location.href = 'login.html')
                .catch((error) => console.error('Logout failed:', error));
        });
    }
}

function setupSettingsForm() {
    const settingsForm = document.getElementById('settings-form');
    settingsForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Save the sound setting
        const soundEnabled = document.getElementById('sound').checked;
        localStorage.setItem('soundEnabled', soundEnabled);

        // Save the default difficulty
        const selectedDefaultDifficulty = document.querySelector('input[name="defaultDifficulty"]:checked').value;
        localStorage.setItem('defaultDifficulty', selectedDefaultDifficulty);

        alert('Settings saved successfully.');
    });
}

function initializeTheme() {
    const themeSelect = document.getElementById('theme');
    const savedTheme = localStorage.getItem('theme') || 'light';
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    themeSelect.addEventListener('change', function() {
        applyTheme(this.value);
        localStorage.setItem('theme', this.value);
    });
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}


function playSound(soundSrc) {
    const soundCheckbox = document.getElementById("sound");
    if (soundCheckbox && soundCheckbox.checked) {
        const sound = new Audio(soundSrc);
        sound.play();
    }
}



/*
document.getElementById('settings-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Save the default difficulty
    const defaultDifficulty = document.querySelector('input[name="defaultDifficulty"]:checked').value;
    localStorage.setItem('defaultDifficulty', defaultDifficulty);

    // Save the sound setting
    const soundEnabled = document.getElementById('sound').checked;
    localStorage.setItem('soundEnabled', soundEnabled);

    // Optionally, display a message to the user that settings are saved
    // ...
});
*/
// Example daily tasks
const dailyTasksData = [
    { id: 'makeBed', name: 'Make your bed', xpReward: 40 },
    { id: 'exerciseHour', name: '1 hour of exercise', xpReward: 40 },
    // ... add more tasks as needed
];

// Function to check if a task is completed today
function isTaskCompletedToday(taskId) {
    const completedTasks = JSON.parse(localStorage.getItem('completedDailyTasks')) || {};
    const lastCompletedDate = completedTasks[taskId];
    return lastCompletedDate === new Date().toDateString();
}

// Function to display daily tasks
function displayDailyTasks() {
    const dailyTasksList = document.getElementById('dailyTasks');
    dailyTasksList.innerHTML = '';

    dailyTasksData.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.textContent = `${task.name} - `;
        const statusSpan = document.createElement('span');

        if (isTaskCompletedToday(task.id)) {
            statusSpan.textContent = 'Completed Today';
        } else {
            statusSpan.textContent = 'Incomplete';
            statusSpan.style.cursor = 'pointer';
            statusSpan.onclick = () => completeDailyTask(task);
        }

        taskItem.appendChild(statusSpan);
        dailyTasksList.appendChild(taskItem);
    });
}

// Function to complete a daily task
function completeDailyTask(task) {
    if (!isTaskCompletedToday(task.id)) {
        user.xp += task.xpReward;
        if (user.xp >= user.nextLevelXp) {
            // Handle level up
            user.level++;
            user.xp -= user.nextLevelXp;
            user.nextLevelXp += 10; // Modify as needed
            showLevelUpNotification(user.level);
        }
        
        // Update local storage
        const completedTasks = JSON.parse(localStorage.getItem('completedDailyTasks')) || {};
        completedTasks[task.id] = new Date().toDateString();
        localStorage.setItem('completedDailyTasks', JSON.stringify(completedTasks));

        updateDisplay();
        playSound('completeQuestSound'); // If you have a sound for completing tasks
    }

    displayDailyTasks(); // Refresh the list of tasks
}

document.addEventListener('DOMContentLoaded', displayDailyTasks);


