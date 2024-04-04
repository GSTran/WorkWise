// Function to send a message to background script
function sendMessageToBackground(message) {
  chrome.runtime.sendMessage(message);
}

// Function to request time spent on each website from background script
function requestTimeFromBackground() {
  sendMessageToBackground({ action: 'requestTime' });
}

// Display time spent on each website
document.addEventListener('DOMContentLoaded', function() {
  requestTimeFromBackground();

  var saveButton = document.getElementById('saveButton');
  var loadButton = document.getElementById('loadButton');
  var dataButton = document.getElementById('getData');
  var clearButton = document.getElementById('clearData');

  // Clear Data 
  clearButton.addEventListener('click', function() {
    chrome.storage.local.clear(function() {
      console.log('Data cleared from chrome.storage.local');
    });
    // Retrieve all data from local storage
    chrome.storage.local.get(null, function(data) {
    console.log('Local Storage Data:', data);
   });
  });
  // Save data to local storage when save button is clicked
  dataButton.addEventListener('click', function() {
    // Retrieve all data from local storage
    chrome.storage.local.get(null, function(data) {
    console.log('Local Storage Data:', data);
  });

    
  });

  // Save data to local storage when save button is clicked
  saveButton.addEventListener('click', function() {
    var data = { message: 'Hello, world!' };
    chrome.storage.local.set({ 'myData': data }, function() {
      console.log('Data saved:', data);
    });
    
  });

  // Load data from local storage when load button is clicked
  loadButton.addEventListener('click', function() {
    chrome.storage.local.get('myData', function(result) {
      var data = result.myData;
      console.log('Data loaded:', data);
      alert(data ? data.message : 'No data found!');
    });
  });
});

// Handle button click to start or stop tracking
document.getElementById('toggleTracking').addEventListener('click', function() {
  var button = document.getElementById('toggleTracking');
  var isTracking = (button.textContent === 'Start Tracking');
  
  if (isTracking) {
    sendMessageToBackground({ action: 'startTracking' });
    button.textContent = 'Stop Tracking';
  } else {
    sendMessageToBackground({ action: 'stopTracking' });
    button.textContent = 'Start Tracking';
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(message) {
  if (message.action === 'updateTime') {
    displayTime(message.timeData);
  }
});

// Display time spent on each website
function displayTime(timeData) {
  var websiteList = document.getElementById('websiteList');
  websiteList.innerHTML = '';

  console.log("timeData");
  console.log(timeData );
  // chrome.storage.local.get('websiteData', function(data) {
  //   // Optional code to execute after setting data in local storage
  //   console.log("Data right afta");
  //   console.log(data);
  // });
  // Iterate through each website in timeData and display it
  Object.keys(timeData).forEach(function(url) {
    var listItem = document.createElement('li');
    listItem.textContent = url + ': ' + formatTime(timeData[url]);
    websiteList.appendChild(listItem);
  });
}

// Format time in HH:MM:SS format
function formatTime(milliseconds) {
  var seconds = Math.floor(milliseconds / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);

  seconds %= 60;
  minutes %= 60;

  return hours.toString().padStart(2, '0') + ':' +
         minutes.toString().padStart(2, '0') + ':' +
         seconds.toString().padStart(2, '0');
}
