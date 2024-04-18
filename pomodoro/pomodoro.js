document.addEventListener('DOMContentLoaded', () => {
    // Let's check if the browser supports notifications
  if ('Notification' in window) {
    // If notification permissions have neither been granted or denied
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      // ask the user for permission
      Notification.requestPermission().then(function(permission) {
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

  chrome.runtime.sendMessage({action:'pomOpen'});
  chrome.runtime.sendMessage({action:'initialize'});
  chrome.runtime.sendMessage({action:'buttonStatus'}); 
  chrome.runtime.sendMessage({action:'getMode'});
});


chrome.runtime.onMessage.addListener(function(message){
  if (chrome.runtime.lastError) {
    console.error('Error getting status:', chrome.runtime.lastError);
    return;
  }
  // Handle the response
  const status = message.action;
  //console.log('Received status:', status);

  if (status == 'mainButtonOn'){
    mainButtonOn();
  }
  else if (status == 'mainButtonOff'){
    mainButtonOff();
  }
  else if (status == 'updateClock')
  {
    getTimerFromStorage(updateClock);
  }
  else if (status =='contSwitchMode'){
    contSwitchMode(message.mode);
  }
  else if (status =='getMode'){
    updateMode(message.mode);
    console.log(message.mode);
  }
  else if (status =='setProgress'){
    getTimerFromStorage(setProgressBar);
  }
});

function mainButtonOn(){
  mainButton.dataset.action = 'stop';
  mainButton.textContent = 'stop';
  mainButton.classList.add('active');
}
function mainButtonOff(){
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


// const timer = {
//     pomodoro: 0.1,
//     shortBreak: 0.1,
//     longBreak: 0.1,
//     longBreakInterval:2,
//     sessions: 0,
// };
let interval;

const buttonSound = new Audio('../PomodoroTimer/button-sound.mp3');
const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
  buttonSound.play();
  const { action } = mainButton.dataset;
  if (action === 'start') {
    //startTimer();
    chrome.runtime.sendMessage({ action: 'startTimer'});
    mainButtonOn();
  } else {
    chrome.runtime.sendMessage({ action: 'stopTimer'});
    mainButtonOff();
  }
});



const modeButtons = document.querySelector('#js-mode-buttons')
modeButtons.addEventListener('click', handleMode);

function handleMode(event){
    const { mode } = event.target.dataset;

    if(!mode) return;

    //stopTimer();
    chrome.runtime.sendMessage({ action: 'stopTimer'});
    mainButtonOff();
    switchMode(mode);
    
};

function switchMode(mode) {
    // timer.mode = mode;
    // timer.remainingTime = {
    //   total: timer[mode] * 60,
    //   minutes: parseInt(timer[mode]),
    //   seconds: parseInt(timer[mode] * 60) % 60,
    // };

    chrome.runtime.sendMessage({action:'switchMode', mode})

    // document
    //   .querySelectorAll('button[data-mode]')
    //   .forEach(e => e.classList.remove('active'));
    // document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    // document.body.style.backgroundColor = `var(--${mode})`;
    // // document
    // // .getElementById('js-progress')
    // // .setAttribute('max', timer.remainingTime.total);
    // getTimerFromStorage(setProgressBar);
  
    // getTimerFromStorage(updateClock);
};

function contSwitchMode(mode){
  document
      .querySelectorAll('button[data-mode]')
      .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
    // document
    // .getElementById('js-progress')
    // .setAttribute('max', timer.remainingTime.total);
    getTimerFromStorage(setProgressBar);
  
    getTimerFromStorage(updateClock);
}

function updateMode(mode){
  document
      .querySelectorAll('button[data-mode]')
      .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
}

function setProgressBar(timer){
  //console.log("setprogressbar");
  //console.log(timer);
  document
    .getElementById('js-progress')
    .setAttribute('max', timer[timer.mode] * 60);
}
// function getRemainingTime(endTime) {
//     const currentTime = Date.parse(new Date());
//     const difference = endTime - currentTime;
  
//     const total = Number.parseInt(difference / 1000, 10);
//     const minutes = Number.parseInt((total / 60) % 60, 10);
//     const seconds = Number.parseInt(total % 60, 10);
  
//     return {
//       total,
//       minutes,
//       seconds,
//     };
//   };
// function startTimer() {
//     document.querySelector(`[data-sound="${timer.mode}"]`).play();
//     let { total } = timer.remainingTime;
//     const endTime = Date.parse(new Date()) + total * 1000;
  
//     if (timer.mode === 'pomodoro') timer.sessions++;

//     mainButton.dataset.action = 'stop';
//     mainButton.textContent = 'stop';
//     mainButton.classList.add('active');

//     interval = setInterval(function() {
//       timer.remainingTime = getRemainingTime(endTime);
//       updateClock();
  
//       total = timer.remainingTime.total;
//       if (total <= 0) {
//         clearInterval(interval);
        
//         switch (timer.mode) {
//             case 'pomodoro':
//               if (timer.sessions % timer.longBreakInterval === 0) {
//                 switchMode('longBreak');
//               } else {
//                 switchMode('shortBreak');
//               }
//               break;
//             default:
//               switchMode('pomodoro');
//           }

//           if (Notification.permission === 'granted') {
//             const text =
//               timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
//             new Notification(text);
//           }
    
//           startTimer();
//       }
//     }, 1000);
//   };

// function stopTimer() {
// clearInterval(interval);

// mainButton.dataset.action = 'start';
// mainButton.textContent = 'start';
// mainButton.classList.remove('active');
// };

function updateClock(timer) {
    //console.log("update Clock");
    //console.log(timer);
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
  