document.addEventListener('DOMContentLoaded', () => {
  // Let's check if the browser supports notifications
  if ('Notification' in window) {
    // If notification permissions have neither been granted or denied
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      // ask the user for permission
      Notification.requestPermission().then(function (permission) {
        // If permission is granted
        if (permission === 'granted') {
          // Create a new notification
          new Notification(
            'Awesome! You will be notified at the start of each session'
          );
        }
      });
    }
  }

  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === 'hidden') {
      chrome.runtime.sendMessage({action:'pomClose'});
    }
  });

  chrome.runtime.sendMessage({ action: 'pomOpen' });
  chrome.runtime.sendMessage({ action: 'initialize' });
  chrome.runtime.sendMessage({ action: 'buttonStatus' });
  chrome.runtime.sendMessage({ action: 'getMode' });

  chrome.storage.local.get('timerNotify', function(data) {
    if (data.timerNotify)
      toggleNotifications.checked = true;
    else
      toggleNotifications.checked = false;
  });
});


chrome.runtime.onMessage.addListener(function (message) {
  if (chrome.runtime.lastError) {
    console.error('Error getting status:', chrome.runtime.lastError);
    return;
  }
  // Handle the response
  const status = message.action;

  if (status == 'mainButtonOn') {
    mainButtonOn();
  }
  else if (status == 'mainButtonOff') {
    mainButtonOff();
  }
  else if (status == 'updateClock') {
    getTimerFromStorage(updateClock);
  }
  else if (status == 'contSwitchMode') {
    contSwitchMode(message.mode);
  }
  else if (status == 'getMode') {
    updateMode(message.mode);
    console.log(message.mode);
  }
  else if (status == 'setProgress') {
    getTimerFromStorage(setProgressBar);
  }
});

function mainButtonOn() {
  mainButton.dataset.action = 'stop';
  mainButton.textContent = 'stop';
  mainButton.classList.add('active');
}
function mainButtonOff() {
  mainButton.dataset.action = 'start';
  mainButton.textContent = 'start';
  mainButton.classList.remove('active');
}

function getTimerFromStorage(callback) {
  chrome.storage.local.get('timer', (result) => {
    const timer = result.timer;
    callback(timer);
  });
}

const buttonSound = new Audio('../PomodoroTimer/button-sound.mp3');
const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
  buttonSound.play();
  const { action } = mainButton.dataset;
  if (action === 'start') {
    //startTimer();
    chrome.runtime.sendMessage({ action: 'startTimer' });
    mainButtonOn();
  } else {
    chrome.runtime.sendMessage({ action: 'stopTimer' });
    mainButtonOff();
  }
});

const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'resetTimer' });
});

const changeTimeButton = document.getElementById('changeTimeButton');
changeTimeButton.addEventListener('click', () => {
  //chrome.runtime.sendMessage({action:'stopTimer'});

  var pomodoroInput = document.getElementById("pomodoroInput").value;
  var shortBreakInput = document.getElementById("shortBreakInput").value;
  var longBreakInput = document.getElementById("longBreakInput").value;
  var longBreakIntervalInput = document.getElementById("longBreakInterval").value;

  // Parse input values
  var pomodoro = parseFloat(pomodoroInput);
  var shortBreak = parseFloat(shortBreakInput);
  var longBreak = parseFloat(longBreakInput);
  var longBreakInterval = parseInt(longBreakIntervalInput);

  // Check if any parsed value is NaN
  if (isNaN(pomodoro) || isNaN(shortBreak) || isNaN(longBreak) || isNaN(longBreakInterval)) {
    alert("Please enter valid integer values for all inputs.");
  } else {
    chrome.runtime.sendMessage({ action: 'updateTime', pomodoro, shortBreak, longBreak, longBreakInterval });
  }

});

const settingsButton = document.getElementById('settingsButton');
settingsButton.addEventListener('click', () => {
  var settingsMenu = document.getElementById("settingsMenu");
  settingsMenu.classList.toggle("hidden");
})

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


const modeButtons = document.querySelector('#js-mode-buttons')
modeButtons.addEventListener('click', handleMode);
function handleMode(event) {
  const { mode } = event.target.dataset;

  if (!mode) return;

  chrome.runtime.sendMessage({ action: 'stopTimer' });
  mainButtonOff();
  switchMode(mode);

};

function switchMode(mode) {
  chrome.runtime.sendMessage({ action: 'switchMode', mode })
};

function contSwitchMode(mode) {
  document
    .querySelectorAll('button[data-mode]')
    .forEach(e => e.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
  document.body.style.backgroundColor = `var(--${mode})`;
  getTimerFromStorage(setProgressBar);

  getTimerFromStorage(updateClock);
}

function updateMode(mode) {
  document
    .querySelectorAll('button[data-mode]')
    .forEach(e => e.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
  document.body.style.backgroundColor = `var(--${mode})`;
}

function setProgressBar(timer) {
  document
    .getElementById('js-progress')
    .setAttribute('max', timer[timer.mode] * 60);
}

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

