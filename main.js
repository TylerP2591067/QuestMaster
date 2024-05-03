import { signOutUser } from './auth.js';

// User stats initialization
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let user = JSON.parse(localStorage.getItem('user')) || {
    level: 1,
    xp: 0,
    nextLevelXp: 100,
};


// Function to update user level and XP display
function updateDisplay() {
    document.getElementById('user-level').textContent = user.level;
    document.getElementById('user-xp').textContent = user.xp;
    document.getElementById('next-level-xp').textContent = user.nextLevelXp;

    const xpProgress = (user.xp / user.nextLevelXp) * 100;
    document.querySelector('.progress-bar-inner').style.width = `${xpProgress}%`;
}

// Function to show level-up notification
function showLevelUpNotification(newLevel) {
    const notification = document.getElementById('level-up-notification');
    document.getElementById('new-level').textContent = newLevel;    
    notification.style.display = 'block';
    playSound('/sfx/LevelUpSound.wav');

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function setupCategoryToggle() {
    const categoryRadioButtons = document.querySelectorAll('.options.category input[name="category"]');
    const customCategoryInput = document.getElementById('customCategoryInput');

    categoryRadioButtons.forEach((radio) => {
        radio.addEventListener('change', () => {
            if (radio.value === 'Custom') {
                customCategoryInput.style.display = 'block'; // Show the input box
            } else {
                customCategoryInput.style.display = 'none'; // Hide the input box
            }
        });
    });
}

// Function to add XP and handle level-up
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
        user.nextLevelXp += 10;

        showLevelUpNotification(user.level);
    }
    localStorage.setItem('user', JSON.stringify(user));
    updateDisplay();
}

// Function to display todos (quests)
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
        todoItem.appendChild(contentInput);

        // Display additional information like category, due date, and time
        const questDetails = document.createElement('div'); // Create a wrapper for quest details
        questDetails.classList.add('quest-details'); // Apply quest-detail styling

        // Adding category information with an icon
        let category = todo.category || 'Uncategorized'; // Default to 'Uncategorized' if not set
        const categorySpan = document.createElement('span');
        categorySpan.classList.add('quest-category'); // Apply category styling
        categorySpan.textContent = `Category: ${category}`;

        // Adding due date information with an icon
        const dueDateSpan = document.createElement('span');
        dueDateSpan.classList.add('due-date'); // Apply due date styling
        dueDateSpan.textContent = `Due: ${todo.dueDate} ${todo.dueTime || ''}`;

        // Append the quest details to the wrapper
        questDetails.appendChild(categorySpan);
        questDetails.appendChild(dueDateSpan);

        // Add the quest details to the todo item
        todoItem.appendChild(questDetails);

        const actions = document.createElement('div');
        actions.classList.add('actions');

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

        // Add actions to the todo item
        todoItem.appendChild(actions);

        // Event handlers for quest actions
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
                editButton.textContent = 'Save';
                contentInput.focus(); // Focus on the input for editing
            } else {
                contentInput.readOnly = true;
                editButton.textContent = 'Edit';

                // Update the quest content and save it to local storage
                const todoIndex = todos.findIndex((t) => t.content === todo.content);
                if (todoIndex !== -1) {
                    todos[todoIndex].content = contentInput.value;
                }

                localStorage.setItem('todos', JSON.stringify(todos));
                DisplayTodos();
            }
        });

        deleteButton.addEventListener('click', () => {
            todos.splice(index, 1);
            localStorage.setItem('todos', JSON.stringify(todos));
            DisplayTodos();
        });

        // Add the todo item to the list
        todoList.appendChild(todoItem);
    });
}



document.addEventListener('DOMContentLoaded', () => {
    setupCategoryToggle(); 
    setupTabButtons();
    setupLogoutButton();
    setupSettingsForm();
    initializeTheme();
    setupCustomCategory();
});

function setupTabButtons() {
    const tabButtons = document.querySelectorAll('.tab-links button');
    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-content').forEach((section) => {
                section.style.display = 'none';
            });
            const sectionId = btn.getAttribute('data-section');
            document.getElementById(sectionId).style.display = 'block';
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
    settingsForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const soundEnabled = document.getElementById('sound').checked;
        localStorage.setItem('soundEnabled', soundEnabled);

        const defaultDifficulty = document.querySelector('input[name="defaultDifficulty"]:checked').value;
        localStorage.setItem('defaultDifficulty', defaultDifficulty);

        alert('Settings saved successfully.');
    });
}

function setupCustomCategory() {
    const customCategoryRadio = document.querySelector('input[name="category"][value="custom"]');
    const customCategoryInput = document.getElementById("customCategoryInput");

    customCategoryRadio.addEventListener('change', function() {
        customCategoryInput.style.display = this.checked ? 'block' : 'none';
    });

    customCategoryInput.addEventListener('change', () => {
        const customCategory = customCategoryInput.value.trim();
        localStorage.setItem('customCategory', customCategory);
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

let weeklyChallenges = JSON.parse(localStorage.getItem('weeklyChallenges')) || [];


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



function checkAndResetWeeklyChallenges() {
    const currentWeek = getWeekNumber(new Date());

    if (localStorage.getItem('lastChallengeWeek') !== String(currentWeek)) {
        // Reset weekly challenges
        resetWeeklyChallenges();

        // Store the current week
        localStorage.setItem('lastChallengeWeek', currentWeek);
    }
}

// Function to reset weekly challenges
function resetWeeklyChallenges() {
    weeklyChallenges = [
        { id: 'complete10Tasks', name: 'Complete 10 Tasks', target: 10, completed: 0 },
        { id: 'completeEasyTasks', name: 'Complete 5 Easy Tasks', target: 5, completed: 0 },
        { id: 'completeMediumTasks', name: 'Complete 3 Medium Tasks', target: 3, completed: 0 },
        { id: 'completeHardTasks', name: 'Complete 2 Hard Tasks', target: 2, completed: 0 },
    ];

    localStorage.setItem('weeklyChallenges', JSON.stringify(weeklyChallenges));
}

// Function to get the current week number
function getWeekNumber(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
    return weekNumber;
}

// Function to update weekly challenge progress
function updateWeeklyChallenges(difficulty) {
    // Update challenge completion based on difficulty
    weeklyChallenges.forEach((challenge) => {
        if (
            (challenge.id === 'complete10Tasks') ||
            (challenge.id === 'completeEasyTasks' && difficulty === 'easy') ||
            (challenge.id === 'completeMediumTasks' && difficulty === 'medium') ||
            (challenge.id === 'completeHardTasks' && difficulty === 'hard')
        ) {
            if (challenge.completed < challenge.target) {
                challenge.completed++;
            }
        }
    });

    // Save updated challenges to local storage
    localStorage.setItem('weeklyChallenges', JSON.stringify(weeklyChallenges));
}

// Function to display weekly challenges
function displayWeeklyChallenges() {
    const challengeList = document.getElementById('challenge-list');
    challengeList.innerHTML = '';

    weeklyChallenges.forEach((challenge) => {
        const challengeItem = document.createElement('li');
        challengeItem.textContent = `${challenge.name} (${challenge.completed}/${challenge.target})`;

        if (challenge.completed >= challenge.target) {
            challengeItem.classList.add('complete');
            challengeItem.textContent += ' - Completed';
        }

        challengeList.appendChild(challengeItem);
    });
}

// Setup event listeners for quest creation and challenge completion
window.addEventListener('load', () => {
    checkAndResetWeeklyChallenges(); // Check if a new week has started

    DisplayTodos(); // Initial display of todos
    displayWeeklyChallenges(); // Display current weekly challenges

    const newTodoForm = document.querySelector('#new-todo-form');

    // Ensure the event listener is added only once to avoid duplication
    if (newTodoForm) {
        newTodoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let category = newTodoForm.elements['category'].value;

        if (category === 'custom') {
            const customCategoryInput = document.querySelector('#customCategory').value.trim();
            category = customCategoryInput || 'Uncategorized'; // Use the custom category or fallback to 'Uncategorized'
        }

        const newTodo = {
            content: newTodoForm.elements['content'].value,
            difficulty: newTodoForm.elements['difficulty'].value,
            category: category, 
            dueDate: document.querySelector('#dueDate').value,
            dueTime: document.querySelector('#dueTime').value,
            done: false,
            createdAt: new Date().getTime(),
        };

        todos.push(newTodo);
        localStorage.setItem('todos', JSON.stringify(todos));
        updateWeeklyChallenges(newTodo.difficulty); // Update weekly challenges
        DisplayTodos(); // Update the display
        newTodoForm.reset(); // Clear the form
        playSound('/sfx/newQuestSound.wav'); // Play the sound
    });
        }
});