// Variable to keep track of tab tracking status
var trackingEnabled = false;
// Variable to store start time for each website
var startTimeMap = {};

// Listen for tab changes
chrome.tabs.onActivated.addListener(function(activeInfo) {
  if (trackingEnabled) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      var currentTab = tabs[0];
      var url = extractDomain(currentTab.url);
      var currentTime = new Date().getTime();

      // If there was a previous tab being tracked, calculate and update its time
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
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }
  // Find & remove port number
  domain = domain.split(':')[0];
  return domain;
}

//Function to track time spent on a website
function trackTimeOnWebsite(url, elapsedTime) {
  // Retrieve stored time for this website
  chrome.storage.local.get(url, function(data) {
    var totalTime = data[url] || 0;

    // Update the total time spent on this website
    var newData = {};
    newData[url] = totalTime + elapsedTime;
    chrome.storage.local.set(newData);

    sendTimeData();
  });
}

// Listen for messages from popup for website tracking
chrome.runtime.onMessage.addListener(function(message, sender) {
  var action = message.action;

  if (action === 'startTracking') {
    trackingEnabled = true;
  } else if (action === 'stopTracking') {
    trackingEnabled = false;
    // Clear startTimeMap when tracking is stopped
    startTimeMap = {};
  }
  else if (action === 'requestTime') {
    // Respond to the request with the time data
    sendTimeData();
  }
  
});


// Function to send time data to the requesting script
function sendTimeData() {
  // Retrieve all time data from storage
  chrome.storage.local.get(null, function(data) {
    // Send the time data back to the requesting script
    chrome.runtime.sendMessage({ action: 'updateTime', timeData: data,tracking:trackingEnabled });
  });
}


//CODE FOR POMODORO TIMER

var firstTime = true;

const timer = {
  pomodoro: 0.2,
  shortBreak: 0.2,
  longBreak: 0.4,
  longBreakInterval:2,
  sessions: 0,
};
updateTimerInStorage(timer);

let interval;
var pomIsOpen = false;
var timerRunning = false;

//Listen for messages from popup for pomodoro timer
chrome.runtime.onMessage.addListener(function(message) {
  var action = message.action;
  if (action === 'startTimer'){
    startTimer();
  }
  else if (action === 'stopTimer'){
    stopTimer();
  }
  else if (action === 'pomOpen'){
    pomIsOpen=true;
  }
  else if(action === 'pomClose'){
    pomIsOpen=false;
  }
  else if (action ==='buttonStatus'){
    if(timerRunning){
      chrome.runtime.sendMessage({action: 'mainButtonOn'});
    }
    else{
      chrome.runtime.sendMessage({action: 'mainButtonOff'});
    }
  }
  else if(action ==='switchMode'){
      switchMode(message.mode);
  }
  else if (action ==='getMode'){
      chrome.runtime.sendMessage({action: 'getMode', mode:timer.mode});
  }
  else if (action ==='initialize'){
    if(firstTime){
      switchMode('pomodoro');
      firstTime = false;
    }
    else {
      chrome.runtime.sendMessage({action:'updateClock'});
      chrome.runtime.sendMessage({action:'setProgress'});
    }

  }
});

// Listener for when a window is removed (closed)
chrome.windows.onRemoved.addListener((windowId) => {
  // Retrieve information about the closed window
  chrome.windows.get(windowId, { populate: false }, (closedWindow) => {
      if (chrome.runtime.lastError) {
          console.error(`Error retrieving window with ID ${windowId}:`, chrome.runtime.lastError);
          return;
      }

      if (closedWindow && closedWindow.type === 'popup') {  
        pomisOpen = false; 
      }
  });
});

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
async function playSound(source) {
  await createOffscreen();
  console.log(chrome.offscreen.hasDocument());
  await chrome.runtime.sendMessage({ action: 'play', mode: source});
}

// Create the offscreen document if it doesn't already exist
async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
      url: './pomodoro/pomodoroOffscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'playing audio'
  });
  console.log("offscreen doc created");
}

async function switchMode(mode){
  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: parseInt(timer[mode]),
    seconds: parseInt(timer[mode] * 60) % 60,
  };
  await updateTimerInStorage(timer);

  chrome.runtime.sendMessage({action:'contSwitchMode', mode});
};

function startTimer() {
  console.log("Sound request sent");
  timerRunning=true;
  let { total } = timer.remainingTime;
  const endTime = Date.parse(new Date()) + total * 1000;

  if (timer.mode === 'pomodoro') timer.sessions++;

  interval = setInterval(async function() {
  timer.remainingTime = getRemainingTime(endTime);
  if(pomIsOpen){
    await updateTimerInStorage(timer);
    chrome.runtime.sendMessage({action:'updateClock'});
   } 
     
     total = timer.remainingTime.total;
     console.log("Total: " + total + pomIsOpen);
     if (total <= 0) {
       clearInterval(interval);
      
       switch (timer.mode) {
         case 'pomodoro':
             if (timer.sessions % timer.longBreakInterval === 0) {
               switchMode('longBreak');
             } else {
               switchMode('shortBreak');
             }
             break;
             default:
             switchMode('pomodoro');
         }

        if (Notification.permission === 'granted') {
          const text =
            timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
          new Notification(text);
        }

        playSound(timer.mode);
  
       startTimer();
      }
    }, 1000);
};

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
};

function stopTimer() {
clearInterval(interval);
updateTimerInStorage(timer);
timerRunning = false;
if(pomIsOpen)
  chrome.runtime.sendMessage({action:'mainButtonOff'});
};