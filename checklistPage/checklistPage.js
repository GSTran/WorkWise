// const inputBox = document.getElementById("input-box");
// const listContainer = document.getElementById("list-container");
// const addTaskBtn = document.getElementById("add-task-btn");
// const taskCounter = document.getElementById("task-counter");
// const completedTaskCounter = document.getElementById("completed-task-counter");
// const completionMessage = document.getElementById("completion-message"); // Define the completion message elementc

// let totalTasks = 0; // Initialize total tasks counter
// let completedTasks = 0; // Initialize completed tasks counter

// let hrs = document.getElementById("hrs");
// let min = document.getElementById("min");
// let sec = document.getElementById("sec");

// let currentTime = new Date();
// console.log(currentTime.getHours());
// console.log(currentTime.getMinutes);
// console.log(currentTime.getSeconds);

// //---------------------------------------------------------------------------------------------------------------------------------------------------------------------

// function addTask() {
//   // Check if the input box is empty
//   if (inputBox.value === "") {
//     // If there is no text
//     alert("Goober write something!");
//   } else {
//     // Create a new list item
//     let li = document.createElement("li");
//     // Set the content of the list item to the value of the input box
//     li.innerHTML = inputBox.value;
//     // Append the list item to the list container
//     listContainer.appendChild(li);
//     let span = document.createElement("span");
//     span.innerHTML = "\u00d7";
//     li.appendChild(span);

//     // Increment the total tasks counter
//     totalTasks++;

//     // Update the task counter display
//     updateTaskCounter();
//   }
//   inputBox.value = "";
//   saveData();
// }

// addTaskBtn.addEventListener("click", addTask);

// listContainer.addEventListener(
//   "click",
//   function (e) {
//     if (e.target.tagName === "LI") {
//       e.target.classList.toggle("checked");
//       if (e.target.classList.contains("checked")) {
//         // Increment completed tasks counter if the task is marked as completed
//         completedTasks++;
//       } else {
//         // Decrement completed tasks counter if the task is marked as incomplete
//         completedTasks--;
//       }
//       saveData();
//       updateCompletedTaskCounter();
//     } else if (e.target.tagName === "SPAN") {
//       e.target.parentElement.remove();
//       // Decrement the total tasks counter
//       totalTasks--;
//       // If the task is marked as completed, decrement the completed tasks counter
//       if (e.target.parentElement.classList.contains("checked")) {
//         completedTasks--;
//       }
//       // Update the task counter displays
//       updateTaskCounter();
//       updateCompletedTaskCounter();
//       saveData();
//     }
//   },
//   false
// );

// function saveData() {
//   localStorage.setItem("data", listContainer.innerHTML);
// }

// function showTask() {
//   listContainer.innerHTML = localStorage.getItem("data");
// }

// showTask();

// // Function to update the task counter display
// function updateTaskCounter() {
//   // Ensure totalTasks doesn't go negative
//   if (totalTasks < 0) {
//     totalTasks = 0;
//   }
//   taskCounter.textContent = totalTasks;
//   localStorage.setItem("totalTasks", totalTasks); // Store the totalTasks count in localStorage
// }

// // Function to update the completed task counter display
// function updateCompletedTaskCounter() {
//   // Ensure completedTasks doesn't go negative
//   if (completedTasks < 0) {
//     completedTasks = 0;
//   }
//   completedTaskCounter.textContent = completedTasks;
//   localStorage.setItem("completedTasks", completedTasks); // Store the completedTasks count in localStorage
//   // Check if all tasks are completed
//   if (completedTasks === totalTasks && totalTasks > 0) {
//     // Display completion message on the webpage
//     completionMessage.textContent = "Hooray! All tasks completed!";
//   } else {
//     // If not all tasks are completed, clear the completion message
//     completionMessage.textContent = "";
//   }
// }

// //---------------------------------------------------------------------------------------------------------------------------------------------------------------------

// // Function to load the task counts from localStorage
// function loadTaskCounts() {
//   const savedTotalTasks = localStorage.getItem("totalTasks");
//   const savedCompletedTasks = localStorage.getItem("completedTasks");
//   if (savedTotalTasks !== null && savedCompletedTasks !== null) {
//     totalTasks = parseInt(savedTotalTasks);
//     completedTasks = parseInt(savedCompletedTasks);
//     updateTaskCounter(); // Update the task counter display with the loaded totalTasks count
//     updateCompletedTaskCounter(); // Update the completed task counter display with the loaded completedTasks count
//   }
// }

// // Call the function to load the task counts when the page loads
// loadTaskCounts();

// //---------------------------------------------------------------------------------------------------------------------------------------------------------------------

// // Function to reset everything when it's past midnight
// function resetAtMidnight() {
//   const now = new Date();
//   const hours = now.getHours();
//   const minutes = now.getMinutes();
//   const seconds = now.getSeconds();

//   // Check if it's past midnight (12:00 AM)
//   if (hours === 0 && minutes === 0 && seconds === 0) {
//     // Reset counters
//     totalTasks = 0;
//     completedTasks = 0;
//     updateTaskCounter();
//     updateCompletedTaskCounter();

//     // Clear task list
//     listContainer.innerHTML = "";

//     // Clear localStorage
//     localStorage.removeItem("data");
//     localStorage.removeItem("totalTasks");
//     localStorage.removeItem("completedTasks");
//   }
// }

// // Call resetAtMidnight function every second
// setInterval(resetAtMidnight, 1000);

const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const addTaskBtn = document.getElementById("add-task-btn");
const taskCounter = document.getElementById("task-counter");
const completedTaskCounter = document.getElementById("completed-task-counter");
const completionMessage = document.getElementById("completion-message");

let totalTasks = 0;
let completedTasks = 0;

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------

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
    } else if (e.target.tagName === "SPAN") {
      e.target.parentElement.remove();
      totalTasks--;
      if (e.target.parentElement.classList.contains("checked")) {
        completedTasks--;
      }
      updateTaskCounter();
      updateCompletedTaskCounter();
      saveData();
    }
  },
  false
);

function saveData() {
  chrome.storage.local.set({ data: listContainer.innerHTML });
}

function showTask() {
  chrome.storage.local.get("data", function (result) {
    listContainer.innerHTML = result.data || "";
  });
}

showTask();

function updateTaskCounter() {
  if (totalTasks < 0) {
    totalTasks = 0;
  }
  taskCounter.textContent = totalTasks;
  chrome.storage.local.set({ totalTasks: totalTasks });
}

function updateCompletedTaskCounter() {
  if (completedTasks < 0) {
    completedTasks = 0;
  }
  completedTaskCounter.textContent = completedTasks;
  chrome.storage.local.set({ completedTasks: completedTasks }, function () {
    if (completedTasks === totalTasks && totalTasks > 0) {
      completionMessage.textContent = "Hooray! All tasks completed!";
    } else {
      completionMessage.textContent = "";
    }
  });
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------

function loadTaskCounts() {
  chrome.storage.local.get(["totalTasks", "completedTasks"], function (result) {
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

loadTaskCounts();

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------

function resetAtMidnight() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  if (hours === 0 && minutes === 0 && seconds === 0) {
    totalTasks = 0;
    completedTasks = 0;
    updateTaskCounter();
    updateCompletedTaskCounter();

    listContainer.innerHTML = "";

    chrome.storage.local.remove(["data", "totalTasks", "completedTasks"]);
  }
}

setInterval(resetAtMidnight, 1000);
