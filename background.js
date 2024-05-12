// Variable to keep track of tab tracking status
var trackingEnabled = false;
//Variable to see if timeTrackingPage is open or not
var trackingOpen = false;
// Variable to store start time for each website
var startTimeMap = {};

// Listen for tab changes, updated time spent on previous website when changing tabs
chrome.tabs.onActivated.addListener(function (activeInfo) {
  if (trackingEnabled) {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      //get the active tab and time
      var currentTab = tabs[0];
      var url = extractDomain(currentTab.url);
      var currentTime = new Date().getTime();

      // If there was a previous tab being tracked, calculate and call function to update the time spent on that tab in the storage
      if (Object.keys(startTimeMap).length > 0) {
        var previousTabUrl = Object.keys(startTimeMap)[0];
        var previousStartTime = startTimeMap[previousTabUrl];
        var elapsedTime = currentTime - previousStartTime;
        trackTimeOnWebsite(previousTabUrl, elapsedTime);
        delete startTimeMap[previousTabUrl];
      }

      // Store the start time for the current tab
      startTimeMap[url] = currentTime;
    });
  }
});

// Function to extract domain name from URL
function extractDomain(url) {
  var domain;
  // Find & remove protocol (http, ftp, etc.) and get domain
  if (url.indexOf("://") > -1) {
    domain = url.split("/")[2];
  } else {
    domain = url.split("/")[0];
  }
  // Find & remove port number
  domain = domain.split(":")[0];
  return domain;
}

//add the elapsed time to the time spent on the specified website and update the storage
function trackTimeOnWebsite(url, elapsedTime) {
  var key = "websiteData";

  // Retrieve stored time for all websites
  chrome.storage.local.get(key, function (data) {
    var websiteDataArray = data[key] || [];
    // console.log("data:");
    // console.log(data);

    // Find the website data in the array or create a new entry if it doesn't exist
    var websiteIndex = websiteDataArray.findIndex(function (website) {
      return website.url === url;
    });

    if (websiteIndex === -1) {
      // If the website is not found in the array, create a new entry
      websiteDataArray.push({ url: url, time: elapsedTime });
    } else {
      // If the website is found in the array, update its time
      websiteDataArray[websiteIndex].time += elapsedTime;
    }

    // Update the stored data with the updated website data array
    var newData = {};
    newData[key] = websiteDataArray;
    chrome.storage.local.set(newData, function () {
      // Code for testing 
      //console.log("Data right after setting:");
      // console.log(websiteDataArray);
    });

    // Send the updated website data to update the popup if it's open
    if (trackingOpen) {
      sendTimeData();
    }

  });
}

// Listen for messages from popup for website tracking
chrome.runtime.onMessage.addListener(function (message, sender) {
  var action = message.action;

  if (action === "startTracking") {
    trackingEnabled = true;

    //starts tracking the time of the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTab = tabs[0];
      var url = extractDomain(currentTab.url);
      var currentTime = new Date().getTime();

      // Store the start time for the current tab
      startTimeMap[url] = currentTime;
    });

  } else if (action === "stopTracking") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTime = new Date().getTime();

      // If there was a previous tab being tracked, calculate and update its time
      if (Object.keys(startTimeMap).length > 0) {
        var previousTabUrl = Object.keys(startTimeMap)[0];
        var previousStartTime = startTimeMap[previousTabUrl];
        var elapsedTime = currentTime - previousStartTime;
        trackTimeOnWebsite(previousTabUrl, elapsedTime);
        delete startTimeMap[previousTabUrl];
      }
      // Clear startTimeMap when tracking is stopped
      startTimeMap = {};

      trackingEnabled = false;
    });
  } else if (action === "requestTime") {
    // Respond to the request with the time data
    sendTimeData();
  } else if (action === "timeTrackOpen") {
    //updates variable to indicate if time tracking page is open
    trackingOpen = true;
  } else if (action === "timeTrackClose") {
    //updates variable to indicate if time tracking page is closed
    trackingOpen = false;
  } else if (action === "getTracking") {
    //when the time tracking page is opened, make sure that the button reflects if currently tracking
    chrome.runtime.sendMessage({
      action: "updateTrackingButton",
      tracking: trackingEnabled,
    });
  }
});

// Function to send time data to the requesting script
function sendTimeData() {
  // Retrieve all time data from storage
  chrome.storage.local.get("websiteData", function (data) {
    // Send the time data back to the time tracking page
    chrome.runtime.sendMessage({
      action: "updateTime",
      timeData: data,
      tracking: trackingEnabled,
    });
  });
}

//CODE FOR POMODORO TIMER

var firstTime = true;

const timer = {
  //length of timer modes in minutes
  pomodoro: 0.2,
  shortBreak: 0.1,
  longBreak: 0.4,
  //pomodoros until a long break
  longBreakInterval: 2,
  //keeps track of pomodoro sessions
  sessions: 0,
};
//puts the timer into the storage
updateTimerInStorage(timer);

let interval;
var pomIsOpen = false;
var timerRunning = false;

//Listen for messages from popup for pomodoro timer
chrome.runtime.onMessage.addListener(function (message) {
  var action = message.action;
  if (action === "startTimer") {
    startTimer();
  } else if (action === "stopTimer") {
    stopTimer();
  } else if (action === "resetTimer") {
    stopTimer();
    timer.sessions = 0;
    switchMode("pomodoro");
  } 
  //the following listen for if the pomodoro timer page is open
  else if (action === "pomOpen") {
    pomIsOpen = true;
  } else if (action === "pomClose") {
    pomIsOpen = false;
  } 
  //make sure that the start/stop button reflects timer status
  else if (action === "buttonStatus") {
    if (timerRunning) {
      chrome.runtime.sendMessage({ action: "mainButtonOn" });
    } else {
      chrome.runtime.sendMessage({ action: "mainButtonOff" });
    }
  } 
  //switches the timer mode in the backend
  else if (action === "switchMode") {
    switchMode(message.mode);
  } 
  //updates the timer in the front end for the current mode
  else if (action === "getMode") {
    chrome.runtime.sendMessage({ action: "getMode", mode: timer.mode });
  } 
  //initializes the timer with required attributes
  else if (action === "initialize") {
    if (firstTime) {
      switchMode("pomodoro");
      firstTime = false;
    } 
    //whenever the pomodoro timer page is open, set the progress and remaining time for the timer
    else {
      chrome.runtime.sendMessage({ action: "updateClock" });
      chrome.runtime.sendMessage({ action: "setProgress" });
    }
  } 
  //sets the attributes of the timer when user changes it in the frontend
  else if (action === "updateTime") {
    stopTimer();
    timer.pomodoro = message.pomodoro;
    timer.shortBreak = message.shortBreak;
    timer.longBreak = message.longBreak;

    //makes sure that the long break interval is at least 1
    var longBreakInterval = message.longBreakInterval;
    if (longBreakInterval <= 0) {
      timer.longBreakInterval = 1;
    } else {
      timer.longBreakInterval = longBreakInterval;
    }

    //refreshes the timer's current mode 
    var currentMode = timer.mode;
    switchMode(currentMode);
  }
});

//sets timer in storage so the front end can access it
function updateTimerInStorage(newTimer) {
  chrome.storage.local.set({ timer: newTimer }, () => {
    //console.log('Timer updated in storage:', newTimer);
  });
}

//Source: https://stackoverflow.com/a/70402480
/**
 * Plays audio files from extension service workers
 * @param {string} source - path of the audio file
 * @param {number} volume - volume of the playback
 */

//works with following function to play the sounds for the mode change
async function playSound(source) {
  await createOffscreen();
  //console.log(chrome.offscreen.hasDocument());
  await chrome.runtime.sendMessage({ action: "play", mode: source });
}

// Create the offscreen document if it doesn't already exist
async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: "./pomodoro/pomodoroOffscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "playing audio",
  });
  //console.log("offscreen doc created");
}

//switches the timer mode in the backend and sends a message for the frontend to update
async function switchMode(mode) {
  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: parseInt(timer[mode]),
    seconds: parseInt(timer[mode] * 60) % 60,
  };
  await updateTimerInStorage(timer);

  if (pomIsOpen) {
    chrome.runtime.sendMessage({ action: "contSwitchMode", mode });
  }
}

// Starts pomodoro timer
function startTimer() {
  //console.log("Sound request sent");
  timerRunning = true;
  let { total } = timer.remainingTime;
  const endTime = Date.parse(new Date()) + total * 1000;

  if (timer.mode === "pomodoro") timer.sessions++;

  //interval for updating the timer as it counts down
  interval = setInterval(async function () {
    timer.remainingTime = getRemainingTime(endTime);
    await updateTimerInStorage(timer);
    //if timer is open in popup update it
    if (pomIsOpen) {
      chrome.runtime.sendMessage({ action: "updateClock" });
    }

    total = timer.remainingTime.total;
    //console.log("Total: " + total + pomIsOpen);
    if (total <= 0) {
      clearInterval(interval);

      //switches timer mode whenever the timer reaches 0
      switch (timer.mode) {
        case "pomodoro":
          if (timer.sessions % timer.longBreakInterval === 0) {
            switchMode("longBreak");
          } else {
            switchMode("shortBreak");
          }
          break;
        default:
          switchMode("pomodoro");
      }

      // Output a desktop notification whenever the timers switch if 
      // timerNotify is toggled to on
      chrome.storage.local.get("timerNotify", function (data) {
        if (data.timerNotify === 1) {
          const text =
            timer.mode === "pomodoro" ? "Get back to work!" : "Take a break!";
          pomonotify(text);
        }
      });

      //plays the sound for switching mode
      playSound(timer.mode);

      //start the timer after switching to next mode
      startTimer();
    }
  }, 1000);
}

//sends a notification to the user ( use for switching modes)
function pomonotify(text) {
  chrome.notifications.create({
    type: "basic",
    title: "Pomodoro Timer",
    message: text,
    iconUrl: "../img/cat.png",
  });
}

//gets remaining time in timer in minutes and seconds and returns those values
function getRemainingTime(endTime) {
  const currentTime = Date.parse(new Date());
  const difference = endTime - currentTime;

  const total = Number.parseInt(difference / 1000, 10);
  const minutes = Number.parseInt((total / 60) % 60, 10);
  const seconds = Number.parseInt(total % 60, 10);

  return {
    total,
    minutes,
    seconds,
  };
}

//function to stop timer which clears the iterval, updates the timer in storage, and sends a message to update the UI
function stopTimer() {
  clearInterval(interval);
  updateTimerInStorage(timer);
  timerRunning = false;
  if (pomIsOpen) chrome.runtime.sendMessage({ action: "mainButtonOff" });
}

//closes blacklisted tabs
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.CloseMe) {
    chrome.tabs.remove(sender.tab.id);
  }
});
