// ====================
// Variables
// ====================

let tasks = [];
let selectedTaskId = null;
let calendarDate = new Date();
let selectedDate = null;
let pomodoroTime = 25 * 60;
let pomodoroInterval = null;

// ====================
// DOM Elements
// ====================

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const currentTime = document.getElementById("currentTime");
const darkModeBtn = document.getElementById("darkModeBtn");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const calendarMonth = document.getElementById("calendarMonth");
const calendarDays = document.getElementById("calendarDays");
const pomodoroTimeDisplay = document.getElementById("pomodoroTime");
const startPomodoroBtn = document.getElementById("startPomodoroBtn");
const pausePomodoroBtn = document.getElementById("pausePomodoroBtn");
const resetPomodoroBtn = document.getElementById("resetPomodoroBtn");

// ====================
// Theme
// ====================

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    darkModeBtn.textContent = "☀️";
}

// ====================
// Pomodoro Functions
// ====================

function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroTime / 60);
    const seconds = pomodoroTime % 60;

    pomodoroTimeDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


// ====================
// Calendar Functions
// ====================

function renderCalendar() {
    calendarDays.innerHTML = "";

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    calendarMonth.textContent = calendarDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement("span");

        calendarDays.appendChild(emptyDay);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayElement = document.createElement("span");

        dayElement.textContent = day;
        dayElement.classList.add("calendar-day");

        const today = new Date();

        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            dayElement.classList.add("today");
        }

        if (
            selectedDate &&
            day === selectedDate.day &&
            month === selectedDate.month &&
            year === selectedDate.year
        ) {
            dayElement.classList.add("selected");
        }
        dayElement.addEventListener("click", function () {
            selectedDate = {
                day: day,
                month: month,
                year: year
            };

            renderCalendar();
        });
        calendarDays.appendChild(dayElement);
    }
}

// ====================
// Task Functions
// ====================

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks.push(task);
    saveTasks();
    taskInput.value = "";
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = "";

    totalTasks.textContent = tasks.length;

    const completedCount = tasks.filter(function (task) {
        return task.completed;
    }).length;

    completedTasks.textContent = completedCount;

    tasks.forEach(function (task) {
        const listItem = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        const taskSpan = document.createElement("span");
        taskSpan.textContent = task.text;
        taskSpan.addEventListener("click", function () {
            selectedTaskId = task.id;

            renderTasks();
        });

        const editButton = document.createElement("button");
        editButton.textContent = "✏️";
        editButton.classList.add("edit-btn");
        editButton.setAttribute("aria-label", "Edit task");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️";
        deleteButton.classList.add("delete-btn");
        deleteButton.setAttribute("aria-label", "Delete task");

        if (task.completed) {
            listItem.classList.add("completed");
        }
        if (task.id === selectedTaskId) {
            listItem.classList.add("selected-task");
        }

        listItem.appendChild(checkbox);
        listItem.appendChild(taskSpan);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        taskList.appendChild(listItem);


        // Checkbox

        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;

            saveTasks();
            renderTasks();
        });

        // Edit

        editButton.addEventListener("click", function () {

            // Save mode

            if (editButton.textContent === "💾") {
                const editInput = listItem.querySelector(".edit-input");
                const updatedTask = editInput.value.trim();

                if (updatedTask === "") {
                    return;
                }

                task.text = updatedTask;

                saveTasks();
                renderTasks();

                return;
            }

            // Edit mode

            const editInput = document.createElement("input");

            editInput.type = "text";
            editInput.value = task.text;
            editInput.classList.add("edit-input");

            taskSpan.replaceWith(editInput);

            editButton.textContent = "💾";
            editButton.setAttribute("aria-label", "Save task");

            editInput.focus();

            editInput.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    const updatedTask = editInput.value.trim();

                    if (updatedTask === "") {
                        return;
                    }

                    task.text = updatedTask;

                    saveTasks();
                    renderTasks();
                }
            });
        });

        // Delete

        deleteButton.addEventListener("click", function () {
            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            saveTasks();
            renderTasks();
        });

    });
}
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    renderTasks();
}

// ====================
// Event Listeners
// ====================

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

clearCompletedBtn.addEventListener("click", function () {
    tasks = tasks.filter(function (task) {
        return !task.completed;
    });

    saveTasks();
    renderTasks();
});

darkModeBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        darkModeBtn.textContent = "☀️";

        localStorage.setItem("theme", "dark");
    } else {
        darkModeBtn.textContent = "🌙";

        localStorage.setItem("theme", "light");
    }
});

prevMonthBtn.addEventListener("click", function () {
    calendarDate.setMonth(calendarDate.getMonth() - 1);

    renderCalendar();
});

nextMonthBtn.addEventListener("click", function () {
    calendarDate.setMonth(calendarDate.getMonth() + 1);

    renderCalendar();
});

startPomodoroBtn.addEventListener("click", function () {
    if (pomodoroInterval !== null) {
        return;
    }

    pomodoroInterval = setInterval(function () {
        if (pomodoroTime > 0) {
            pomodoroTime--;
            updatePomodoroDisplay();
        } else {
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
        }
    }, 1000);
});

pausePomodoroBtn.addEventListener("click", function () {
    clearInterval(pomodoroInterval);

    pomodoroInterval = null;
});

resetPomodoroBtn.addEventListener("click", function () {
    clearInterval(pomodoroInterval);

    pomodoroInterval = null;
    pomodoroTime = 25 * 60;

    updatePomodoroDisplay();
});

// ====================
// Initial Setup
// ====================

loadTasks();
renderCalendar();
updatePomodoroDisplay();

// ====================
// Current Time
// ====================
setInterval(function () {
    const now = new Date();

    currentTime.textContent = now.toLocaleTimeString();
}, 1000);
