const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const addTaskBtn = document.getElementById("add-task-btn");
const taskCounter = document.getElementById("task-counter");
const completedTaskCounter = document.getElementById("completed-task-counter");
const completionMessage = document.getElementById("completion-message");
const streakCounter = document.getElementById("streak-counter");

let totalTasks = 0;
let completedTasks = 0;
let streak = 0;

function addTask() {
  if (inputBox.value === "") {
    alert("Goober write something!");
  } else {
    let li = document.createElement("li");
    li.innerHTML = inputBox.value;
    listContainer.appendChild(li);
    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);

    totalTasks++;
    updateTaskCounter();

    // Check completion status after adding a task
    recheckCompletionStatus();
  }
  inputBox.value = "";
  saveData();
}

addTaskBtn.addEventListener("click", addTask);

listContainer.addEventListener(
  "click",
  function (e) {
    if (e.target.tagName === "LI") {
      e.target.classList.toggle("checked");
      if (e.target.classList.contains("checked")) {
        completedTasks++;
      } else {
        completedTasks--;
      }
      saveData();
      updateCompletedTaskCounter();
      recheckCompletionStatus(); // Check completion status after modifying a task
    } else if (e.target.tagName === "SPAN") {
      e.target.parentElement.remove();
      totalTasks--;
      if (e.target.parentElement.classList.contains("checked")) {
        completedTasks--;
      }
      updateTaskCounter();
      updateCompletedTaskCounter();
      recheckCompletionStatus(); // Check completion status after modifying a task
      saveData();
    }
  },
  false
);

function saveData() {
  chrome.storage.sync.set({ data: listContainer.innerHTML });
}

function showTask() {
  chrome.storage.sync.get("data", function (result) {
    listContainer.innerHTML = result.data || "";
  });
}

showTask();

function updateTaskCounter() {
  if (totalTasks < 0) {
    totalTasks = 0;
  }
  taskCounter.textContent = totalTasks;
  chrome.storage.sync.set({ totalTasks: totalTasks });
}

function updateCompletedTaskCounter() {
  if (completedTasks < 0) {
    completedTasks = 0;
  }
  completedTaskCounter.textContent = completedTasks;
  chrome.storage.sync.set({ completedTasks: completedTasks });
}

function recheckCompletionStatus() {
  if (completedTasks === totalTasks && totalTasks > 0) {
    completionMessage.textContent = "Hooray! All tasks completed!";
  } else {
    completionMessage.textContent = "";
  }
}

function checkCompletionforStreak() {
  if (completedTasks === totalTasks && totalTasks > 0) {
    streak++; //if done with all increment streak;
    updateStreakCounter();
  } else {
    streak = 0;
    updateStreakCounter();
  }
}

function loadTaskCounts() {
  chrome.storage.sync.get(["totalTasks", "completedTasks"], function (result) {
    const savedTotalTasks = result.totalTasks;
    const savedCompletedTasks = result.completedTasks;

    totalTasks =
      savedTotalTasks !== null && savedTotalTasks !== undefined
        ? parseInt(savedTotalTasks)
        : 0;
    completedTasks =
      savedCompletedTasks !== null && savedCompletedTasks !== undefined
        ? parseInt(savedCompletedTasks)
        : 0;

    updateTaskCounter();
    updateCompletedTaskCounter();
  });
}

function updateStreakCounter() {
  streakCounter.textContent = streak; // I can reset streak here when testing
  chrome.storage.sync.set({ streak: streak });
}

function loadStreakCount() {
  chrome.storage.sync.get("streak", function (result) {
    streak =
      result.streak !== null && result.streak !== undefined
        ? parseInt(result.streak)
        : 0;
    updateStreakCounter();
  });
}

loadTaskCounts();
loadStreakCount();

function checkAndResetAtMidnight() {
  // Retrieve the last reset date from storage
  chrome.storage.sync.get("lastResetDate", function (data) {
    let lastResetDate = data.lastResetDate;

    // Get the current minute
    const now = new Date();
    const currentMinute = now.getMinutes();

    // Get the old minute
    const oldDate = new Date(lastResetDate);
    const oldMinute = oldDate.getMinutes();

    // Print the values of oldMinute and currentMinute
    console.log("Old Minute:", oldMinute);
    console.log("Current Minute:", currentMinute);

    // Compare the last reset date with the current date
    if (oldMinute !== currentMinute) {
      if (oldMinute != currentMinute - 1) {
        reset();
      }
      // If it's a new minute, call the reset function
      resetAtMidnight();

      // Update the last reset date in storage
      chrome.storage.sync.set({ lastResetDate: now.toString() });
    }
  });
  setTimeout(checkAndResetAtMidnight, 1000);
}

function reset() {
  // Reset actions for Test 1
  completionMessage.textContent = "Test 1";
  totalTasks = 0;
  completedTasks = 0;
  updateTaskCounter();
  updateCompletedTaskCounter();
  listContainer.innerHTML = "";
  chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
}

function resetAtMidnight() {
  // Reset actions for Test 1
  checkCompletionforStreak();
  completionMessage.textContent = "Test 1";
  totalTasks = 0;
  completedTasks = 0;
  updateTaskCounter();
  updateCompletedTaskCounter();
  listContainer.innerHTML = "";
  chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
}

checkAndResetAtMidnight();
