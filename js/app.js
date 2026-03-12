// Local Storage Keys
const STORAGE_KEYS = {
    TASKS: 'tasks',
    LINKS: 'links',
    THEME: 'theme',
    USER_NAME: 'userName',
    TIMER_DURATION: 'timerDuration'
};

// State
let tasks = [];
let links = [];
let timerInterval = null;
let timerSeconds = 25 * 60;
let timerDuration = 25;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initGreeting();
    initTheme();
    initTimer();
    initTodoList();
    initQuickLinks();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

// Greeting Functions
function initGreeting() {
    const savedName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    const userNameInput = document.getElementById('userName');
    const saveNameBtn = document.getElementById('saveName');

    if (savedName) {
        userNameInput.value = savedName;
    }

    saveNameBtn.addEventListener('click', () => {
        const name = userNameInput.value.trim();
        if (name) {
            localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
            updateGreeting();
        }
    });

    updateGreeting();
}

function updateGreeting() {
    const hour = new Date().getHours();
    const savedName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    const greetingEl = document.getElementById('greeting');
    
    let greeting = '';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    else greeting = 'Good Evening';
    
    if (savedName) {
        greeting += `, ${savedName}`;
    }
    
    greetingEl.textContent = greeting;
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('datetime').textContent = now.toLocaleDateString('en-US', options);
    updateGreeting();
}

// Theme Functions
function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    });
}

// Timer Functions
function initTimer() {
    const savedDuration = localStorage.getItem(STORAGE_KEYS.TIMER_DURATION);
    if (savedDuration) {
        timerDuration = parseInt(savedDuration);
        document.getElementById('timerDuration').value = timerDuration;
        timerSeconds = timerDuration * 60;
        updateTimerDisplay();
    }
    
    document.getElementById('setDuration').addEventListener('click', () => {
        const duration = parseInt(document.getElementById('timerDuration').value);
        if (duration > 0 && duration <= 60) {
            timerDuration = duration;
            timerSeconds = duration * 60;
            localStorage.setItem(STORAGE_KEYS.TIMER_DURATION, duration);
            updateTimerDisplay();
            stopTimer();
        }
    });
    
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('stopTimer').addEventListener('click', stopTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);
}

function startTimer() {
    if (timerInterval) return;
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            stopTimer();
            alert('Time is up! Take a break.');
            resetTimer();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    stopTimer();
    timerSeconds = timerDuration * 60;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// To-Do List Functions
function initTodoList() {
    document.getElementById('addTask').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    document.getElementById('sortTasks').addEventListener('click', sortTasks);
    renderTasks();
}

function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    
    if (!taskText) return;
    
    // Prevent duplicate tasks
    if (tasks.some(task => task.text.toLowerCase() === taskText.toLowerCase())) {
        alert('This task already exists!');
        return;
    }
    
    tasks.push({
        id: Date.now(),
        text: taskText,
        completed: false
    });
    
    input.value = '';
    saveToStorage();
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveToStorage();
        renderTasks();
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newText = prompt('Edit task:', task.text);
    if (newText && newText.trim()) {
        const trimmedText = newText.trim();
        
        // Prevent duplicate tasks
        if (tasks.some(t => t.id !== id && t.text.toLowerCase() === trimmedText.toLowerCase())) {
            alert('This task already exists!');
            return;
        }
        
        task.text = trimmedText;
        saveToStorage();
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveToStorage();
    renderTasks();
}

function sortTasks() {
    tasks.sort((a, b) => a.text.localeCompare(b.text));
    saveToStorage();
    renderTasks();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="task-edit">Edit</button>
            <button class="task-delete">Delete</button>
        `;
        
        li.querySelector('.task-checkbox').addEventListener('change', () => toggleTask(task.id));
        li.querySelector('.task-text').addEventListener('click', () => toggleTask(task.id));
        li.querySelector('.task-edit').addEventListener('click', () => editTask(task.id));
        li.querySelector('.task-delete').addEventListener('click', () => deleteTask(task.id));
        
        taskList.appendChild(li);
    });
}

// Quick Links Functions
function initQuickLinks() {
    document.getElementById('addLink').addEventListener('click', addLink);
    renderLinks();
}

function addLink() {
    const nameInput = document.getElementById('linkName');
    const urlInput = document.getElementById('linkUrl');
    
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    
    if (!name || !url) {
        alert('Please enter both name and URL');
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URL must start with http:// or https://');
        return;
    }
    
    links.push({
        id: Date.now(),
        name: name,
        url: url
    });
    
    nameInput.value = '';
    urlInput.value = '';
    saveToStorage();
    renderLinks();
}

function deleteLink(id) {
    links = links.filter(l => l.id !== id);
    saveToStorage();
    renderLinks();
}

function renderLinks() {
    const linksList = document.getElementById('linksList');
    linksList.innerHTML = '';
    
    links.forEach(link => {
        const linkBtn = document.createElement('a');
        linkBtn.href = link.url;
        linkBtn.target = '_blank';
        linkBtn.className = 'link-button';
        linkBtn.textContent = link.name;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.className = 'link-delete';
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            deleteLink(link.id);
        });
        
        linkBtn.appendChild(deleteBtn);
        linksList.appendChild(linkBtn);
    });
}

// Storage Functions
function loadFromStorage() {
    const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const savedLinks = localStorage.getItem(STORAGE_KEYS.LINKS);
    
    if (savedTasks) tasks = JSON.parse(savedTasks);
    if (savedLinks) links = JSON.parse(savedLinks);
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
}
