document.addEventListener('DOMContentLoaded', () => {
  //if the pomodoro page is closed, notify background
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === 'hidden') {
      chrome.runtime.sendMessage({action:'pomClose'});
    }
  });

  //notify the background that the pomodoro page is open
  //also update the page so that it accurately reflects the timer
  chrome.runtime.sendMessage({ action: 'pomOpen' });
  chrome.runtime.sendMessage({ action: 'initialize' });
  chrome.runtime.sendMessage({ action: 'buttonStatus' });
  chrome.runtime.sendMessage({ action: 'getMode' });

  //sets the notifcation slider on the page based on if notifications are on or not
  chrome.storage.local.get('timerNotify', function(data) {
    if (data.timerNotify)
      toggleNotifications.checked = true;
    else
      toggleNotifications.checked = false;
  });
});

//listens for messages from other files
chrome.runtime.onMessage.addListener(function (message) {
  if (chrome.runtime.lastError) {
    console.error('Error getting status:', chrome.runtime.lastError);
    return;
  }
  //gets the message's action and puts it in a variable
  const status = message.action;

  //sets main button (based on if timer is running)
  if (status == 'mainButtonOn') {
    mainButtonOn();
  }
  else if (status == 'mainButtonOff') {
    mainButtonOff();
  }
  //update the clock
  else if (status == 'updateClock') {
    getTimerFromStorage(updateClock);
  }
  //change page elements based on the timer's mode
  else if (status == 'contSwitchMode') {
    contSwitchMode(message.mode);
  }
  //update the timer's mode based on the mode from the message
  else if (status == 'getMode') {
    updateMode(message.mode);
    console.log(message.mode);
  }
  //update the progress bar based on the timer in the storage
  else if (status == 'setProgress') {
    getTimerFromStorage(setProgressBar);
  }
});

//for setting the button when the timer is running
function mainButtonOn() {
  mainButton.dataset.action = 'stop';
  mainButton.textContent = 'stop';
  mainButton.classList.add('active');
}
//setting the button when the timer is paused
function mainButtonOff() {
  mainButton.dataset.action = 'start';
  mainButton.textContent = 'start';
  mainButton.classList.remove('active');
}

//gets the timer in storage and passes it to a callback function to use
function getTimerFromStorage(callback) {
  chrome.storage.local.get('timer', (result) => {
    const timer = result.timer;
    callback(timer);
  });
}

//sound for when the main button is clicked
const buttonSound = new Audio('../PomodoroTimer/button-sound.mp3');
const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
  buttonSound.play();
  const { action } = mainButton.dataset;
  
  //starts or stops the timer based on the button's status
  if (action === 'start') {
    //startTimer();
    chrome.runtime.sendMessage({ action: 'startTimer' });
    mainButtonOn();
  } else {
    chrome.runtime.sendMessage({ action: 'stopTimer' });
    mainButtonOff();
  }
});

//listener for the reset button that sends a message to the background to reset the timer
const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'resetTimer' });
});

//listener for the "change time" button that sends the inputted timer values to the background to update the timer
const changeTimeButton = document.getElementById('changeTimeButton');
changeTimeButton.addEventListener('click', () => {
  //chrome.runtime.sendMessage({action:'stopTimer'});

  //get the input values
  var pomodoroInput = document.getElementById("pomodoroInput").value;
  var shortBreakInput = document.getElementById("shortBreakInput").value;
  var longBreakInput = document.getElementById("longBreakInput").value;
  var longBreakIntervalInput = document.getElementById("longBreakInterval").value;

  // Parse input values
  var pomodoro = parseFloat(pomodoroInput);
  var shortBreak = parseFloat(shortBreakInput);
  var longBreak = parseFloat(longBreakInput);
  var longBreakInterval = parseInt(longBreakIntervalInput);

  // Check if any parsed value is NaN or negative. Also checks if the long break interval is less than 1.
  if (isNaN(pomodoro) || isNaN(shortBreak) || isNaN(longBreak) || isNaN(longBreakInterval) || pomodoro<0.05 || shortBreak<0.05 || longBreak<0.05 || longBreakInterval < 1 ) {
    alert("Please enter valid integer values for all inputs.");
  } else {
    chrome.runtime.sendMessage({ action: 'updateTime', pomodoro, shortBreak, longBreak, longBreakInterval });
  }
});

//listener for the settings button. Hides or shows the menu.
const settingsButton = document.getElementById('settingsButton');
settingsButton.addEventListener('click', () => {
  var settingsMenu = document.getElementById("settingsMenu");
  settingsMenu.classList.toggle("hidden");
})

// Functionality for the notification toggle switch
var toggleNotifications = document.getElementById('pomoNotifyToggle');
toggleNotifications.addEventListener('click', function () {
  console.log(toggleNotifications.checked);
  // Check if the switch is checked
  if (toggleNotifications.checked) {
    console.log('Switch is ON');
    chrome.storage.local.set({ 'timerNotify': 1 }, function () {
      console.log('Notification setting saved');
      pomonotify();
    });
    // Call the pomonotify function if it's defined
  } else {
    console.log('Switch is OFF');
    chrome.storage.local.set({ 'timerNotify': 0 }, function () {
      console.log('Notification setting saved');
    });
  }
});


// Outputs a notification for when notifications are turned on
function pomonotify() {
  chrome.notifications.create(
    {
      type: "basic",
      title: "Pomodoro Timer",
      message: "Awesome! You will be notified at the start of each session.",
      iconUrl: "../img/cat.png"
    }
  );
}

// listener for the mode buttons above the timer
const modeButtons = document.querySelector('#js-mode-buttons')
modeButtons.addEventListener('click', handleMode);
function handleMode(event) {
  const { mode } = event.target.dataset;

  if (!mode) return;

  //stops the timer and changes the mode based on the button pressed
  chrome.runtime.sendMessage({ action: 'stopTimer' });
  mainButtonOff();
  switchMode(mode);

};

//sends a message to the background to switch the mode of the timer
function switchMode(mode) {
  chrome.runtime.sendMessage({ action: 'switchMode', mode })
};

//updates the timer for the pomodoro page after it is updated in the storage
function contSwitchMode(mode) {
  updateMode(mode);
  getTimerFromStorage(setProgressBar);

  getTimerFromStorage(updateClock);
}

//updates the UI of the pomodoro page to reflect the mode
function updateMode(mode) {
  document
    .querySelectorAll('button[data-mode]')
    .forEach(e => e.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
  document.body.style.backgroundColor = `var(--${mode})`;
}

//sets the progress bar's maximum value based on the timer's mode
function setProgressBar(timer) {
  document
    .getElementById('js-progress')
    .setAttribute('max', timer[timer.mode] * 60);
}

//updates the clock on the pomodoro timer page based on the remaining time in the timer
function updateClock(timer) {
  const { remainingTime } = timer;
  const minutes = `${remainingTime.minutes}`.padStart(2, '0');
  const seconds = `${remainingTime.seconds}`.padStart(2, '0');

  const min = document.getElementById('js-minutes');
  const sec = document.getElementById('js-seconds');
  min.textContent = minutes;
  sec.textContent = seconds;

  const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
  document.title = `${minutes}:${seconds} — ${text}`;

  const progress = document.getElementById('js-progress');
  progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
};

