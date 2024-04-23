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
    streak = result.streak !== null && result.streak !== undefined ? parseInt(result.streak) : 0;
    updateStreakCounter();
  });
}


loadTaskCounts();
loadStreakCount();

function resetAtMidnight() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // Check if it's midnight
  if (hours === 18 && minutes === 25 && seconds === 4) {
    checkCompletionforStreak()
    completionMessage.textContent = "Test 1";
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  }

  // Check if it's midnight
  if (hours === 18 && minutes === 25 && seconds === 9) {
    checkCompletionforStreak()
    completionMessage.textContent = "Test 2";
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  }

  // Check if it's midnight
  if (hours === 18 && minutes === 25 && seconds === 14) {
    checkCompletionforStreak()
    completionMessage.textContent = "Test 3";
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  }

  // Check if it's midnight
  if (hours === 18 && minutes === 25 && seconds === 19) {
    checkCompletionforStreak()
    completionMessage.textContent = "Test 4";
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  }

  // Check if it's midnight
  if (hours === 18 && minutes === 25 && seconds === 24) {
    checkCompletionforStreak()
    completionMessage.textContent = "Test 5";
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  }

  // Check if it's midnight
  if (hours === 18 && minutes === 25 && seconds === 29) {
    checkCompletionforStreak()
    completionMessage.textContent = "Test 6";
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  }

  // Check if it's midnight
  if (hours === 18 && minutes === 25 && seconds === 34) {
    checkCompletionforStreak()
    completionMessage.textContent = "Test 7";
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  }

  // Check if it's midnight
  if (hours === 18 && minutes === 25 && seconds === 39) {
    checkCompletionforStreak()
    completionMessage.textContent = "Test 8";
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  }

  // Check if it's midnight
  if (hours === 18 && minutes === 25 && seconds === 44) {
    checkCompletionforStreak()
    completionMessage.textContent = "Test 9";
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  }

  // Check if it's midnight
  if (hours === 18 && minutes === 25 && seconds === 49) {
    checkCompletionforStreak()
    completionMessage.textContent = "Test 10";
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  }


  // Check if it's midnight
  if (hours === 18 && minutes === 25 && seconds === 54) {
    checkCompletionforStreak()
    completionMessage.textContent = "Test 11";
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  }

  // Check if it's midnight
  if (hours === 18 && minutes === 25 && seconds === 59) {
    checkCompletionforStreak()
    completionMessage.textContent = "Test 12";
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  }
  // Schedule the next check for the next second
  setTimeout(resetAtMidnight, 1000);
}

// Start the resetAtMidnight function
resetAtMidnight();
