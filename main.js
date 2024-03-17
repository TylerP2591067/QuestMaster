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
}

// Function to add XP and handle level up
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
        user.nextLevelXp += 100; // Increase the XP required for the next level
        alert(`Congratulations! You've reached level ${user.level}!`);
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
    });

    DisplayTodos();
    updateDisplay();
});
