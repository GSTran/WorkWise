const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const addTaskBtn = document.getElementById("add-task-btn");
const taskCounter = document.getElementById("task-counter");
const completedTaskCounter = document.getElementById("completed-task-counter");
const completionMessage = document.getElementById("completion-message");
const streakCounter = document.getElementById("streak-counter");

let totalTasks = 0; // Initialize total tasks counter
let completedTasks = 0; // Initialize completed tasks counter
let streak = 0; // Initialize streak counter

function addTask() {
  if (inputBox.value === "") {
    alert("Write something!"); // Alert if user input is empty
  } else {
    let li = document.createElement("li"); // Create a new list item
    li.innerHTML = inputBox.value; // Set its content to the input value
    listContainer.appendChild(li); // Append it to the list container
    let span = document.createElement("span"); // Create a span element
    span.innerHTML = "\u00d7"; // Set its content to '×' for the remove button
    li.appendChild(span); // Append it to the list item

    totalTasks++; // Increment total tasks counter
    updateTaskCounter(); // Update task counter display
    // Check completion status after adding a task
    recheckCompletionStatus();
    // Update past seven days data
  }
  inputBox.value = ""; // Clear the input box after the task is added
  saveData(); // Save the data to storage
}

addTaskBtn.addEventListener("click", addTask); // Add event listener for add task button

listContainer.addEventListener(
  "click",
  function (e) {
    if (e.target.tagName === "LI") {
      e.target.classList.toggle("checked"); // Toggle the 'checked' class for list item
      if (e.target.classList.contains("checked")) {
        completedTasks++; // Increment completed tasks if checked
      } else {
        completedTasks--; // Decrement completed tasks if unchecked
      }
      saveData(); // Save data to storage
      updateCompletedTaskCounter(); // Update completed task counter display
      recheckCompletionStatus(); // Check completion status after modifying a task
    } else if (e.target.tagName === "SPAN") {
      e.target.parentElement.remove(); // Remove the parent list item if click remove
      totalTasks--;
      if (e.target.parentElement.classList.contains("checked")) {
        completedTasks--;
      }
      updateTaskCounter(); // Update task counter display
      updateCompletedTaskCounter(); // Update completed task counter display
      recheckCompletionStatus(); // Check completion status after modifying a task

      saveData(); // Save data to storage
    }
  },
  false
);

// Function to save data to Chrome storage
function saveData() {
  chrome.storage.sync.set({
    data: listContainer.innerHTML,
    pastSevenDaysData: pastSevenDaysData,
  });
}

// Modify the showTask function to load both task list and past seven days data
function showTask() {
  chrome.storage.sync.get(["data", "pastSevenDaysData"], function (result) {
    listContainer.innerHTML = result.data || "";
    pastSevenDaysData = result.pastSevenDaysData || pastSevenDaysData;
  });
}

showTask(); // Show tasks on page load

// Function to update total task counter display
function updateTaskCounter() {
  if (totalTasks < 0) {
    totalTasks = 0;
  }
  taskCounter.textContent = totalTasks;
  chrome.storage.sync.set({ totalTasks: totalTasks });
}

// Function to update completed task counter display
function updateCompletedTaskCounter() {
  if (completedTasks < 0) {
    completedTasks = 0;
  }
  completedTaskCounter.textContent = completedTasks;
  chrome.storage.sync.set({ completedTasks: completedTasks });
}

// Function to recheck completion status and display message
function recheckCompletionStatus() {
  if (completedTasks === totalTasks && totalTasks > 0) {
    completionMessage.textContent = "Hooray! All tasks completed!";
  } else {
    completionMessage.textContent = "";
  }
}

// Function to check completion for streak
function checkCompletionforStreak() {
  if (completedTasks === totalTasks && totalTasks > 0) {
    streak++; //if done with all increment streak;
    updateStreakCounter();
  } else {
    streak = 0;
    updateStreakCounter();
  }
}

// Function to load task counts from storage
function loadTaskCounts() {
  chrome.storage.sync.get(["totalTasks", "completedTasks"], function (result) {
    const savedTotalTasks = result.totalTasks;
    const savedCompletedTasks = result.completedTasks;

    totalTasks =
      savedTotalTasks !== null && savedTotalTasks !== undefined
        ? parseInt(savedTotalTasks)
        : 0; // Load total tasks from storage or set to 0
    completedTasks =
      savedCompletedTasks !== null && savedCompletedTasks !== undefined
        ? parseInt(savedCompletedTasks)
        : 0; // Load completed tasks from storage or set to 0

    updateTaskCounter();
    updateCompletedTaskCounter();
  });
}

// Function to update streak counter display
function updateStreakCounter() {
  streakCounter.textContent = streak; // I can reset streak here when testing
  chrome.storage.sync.set({ streak: streak });
}

// Function to load streak count from storage
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

//----------------------------------------------------------------------------------------------
let pastSevenDaysData = []; // Array to store past seven days data

// Function to initialize past seven days data
function initializePastSevenDaysData() {
  // Initialize pastSevenDaysData array with empty objects for the past 7 days
  for (let i = 0; i < 7; i++) {
    pastSevenDaysData.push({
      date: getDateNDaysAgo(i),
      totalTasks: 0,
      completedTasks: 0,
    });
  }
}

// Function to update past seven days data
async function updatePastSevenDaysData() {
  // Remove the first element (oldest data)
  pastSevenDaysData.shift();

  // Insert the new data at the end
  pastSevenDaysData.push({
    date: getDateNDaysAgo(0), // Date for the newest entry
    totalTasks: totalTasks,
    completedTasks: completedTasks,
  });

  // Save past seven days data to Chrome storage
  await chrome.storage.sync.set({ pastSevenDaysData: pastSevenDaysData });

  // After saving, calculate and save past seven days statistics
  const { pastSevenDaysTotalTasks, pastSevenDaysCompletedTasks } =
    calculatePastSevenDaysStats();
  await chrome.storage.sync.set({
    pastSevenDaysTotalTasks: pastSevenDaysTotalTasks,
    pastSevenDaysCompletedTasks: pastSevenDaysCompletedTasks,
  });
}

// Function to get the Date()
function getDateNDaysAgo(n) {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - n);
  return pastDate.toDateString();
}

// Function to calculate past 7 days stats
function calculatePastSevenDaysStats() {
  let pastSevenDaysTotalTasks = 0;
  let pastSevenDaysCompletedTasks = 0;

  // Calculate total and completed tasks for the past 7 days
  pastSevenDaysData.forEach((day) => {
    pastSevenDaysTotalTasks += day.totalTasks;
    pastSevenDaysCompletedTasks += day.completedTasks;
  });

  return { pastSevenDaysTotalTasks, pastSevenDaysCompletedTasks };
}

// Function to display past 7 days stats on UI
function displayPastSevenDaysStats() {
  chrome.storage.sync.get(
    [
      "pastSevenDaysTotalTasks",
      "pastSevenDaysCompletedTasks",
      "pastSevenDaysData",
    ],
    function (data) {
      const pastSevenDaysTotalTasks = data.pastSevenDaysTotalTasks || 0;
      const pastSevenDaysCompletedTasks = data.pastSevenDaysCompletedTasks || 0;
      const pastSevenDaysData = data.pastSevenDaysData || [];

      let totalCompletedTasks = 0;
      let daysWithDataCount = 0;

      pastSevenDaysData.forEach((day) => {
        totalCompletedTasks += day.completedTasks;
        if (day.totalTasks > 0) {
          daysWithDataCount++;
        }
      });

      const averageCompletedTasksPerDay =
        daysWithDataCount > 0 ? totalCompletedTasks / daysWithDataCount : 0;

      const statsContainer = document.getElementById("past-seven-days-stats");
      statsContainer.innerHTML = `
        <p>${pastSevenDaysCompletedTasks}/${pastSevenDaysTotalTasks} tasks completed in the past 7 days. Avg tasks/day: ${averageCompletedTasksPerDay.toFixed(
        2
      )}</p>
      `;
    }
  );
}

initializePastSevenDaysData();

//----------------------------------------------------------------------------------------------
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

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDate
    // Print the values of oldMinute and currentMinute
    console.log("Old Minute:", oldDate.getMinutes());
    console.log("Current Minute:", now.getMinutes());

    // Compare the last reset date with the current date
    if (oldMinute !== currentMinute) {
      //Check if it a back to back minutes
      if (oldMinute !== currentMinute - 1) {
        if (!(oldMinute === 59 && currentMinute === 0)) {
          reset();
        }
      }
      resetAtMidnight();

      // Update the last reset date in storage
      chrome.storage.sync.set({ lastResetDate: now.toString() });
    }
  });
  setTimeout(checkAndResetAtMidnight, 1000);
}

// Function to reset once hit midnight (this one is for back to back day check)
function reset() {
  updatePastSevenDaysData();
  // Reset actions for Test 1
  completionMessage.textContent = "";
  totalTasks = 0;
  completedTasks = 0;
  updateTaskCounter();
  updateCompletedTaskCounter();
  listContainer.innerHTML = "";
  chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  displayPastSevenDaysStats();
}

// Function to reset once hit midnight
async function resetAtMidnight() {
  await updatePastSevenDaysData();
  // Reset actions for Test 1
  completionMessage.textContent = "";
  checkCompletionforStreak();
  totalTasks = 0;
  completedTasks = 0;
  updateTaskCounter();
  updateCompletedTaskCounter();
  listContainer.innerHTML = "";
  chrome.storage.sync.remove(["data", "totalTasks", "completedTasks"]);
  displayPastSevenDaysStats();
}

checkAndResetAtMidnight();
displayPastSevenDaysStats();
