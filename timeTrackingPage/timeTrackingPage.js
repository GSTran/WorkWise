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
  //requestTimeFromBackground();

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
  chrome.storage.local.get('blacklist', function(data){
    console.log('Blacklist:',data);
    console.log('Blacklist:',data.blacklist);
  }); 
    
  });

  // Save data to local storage when save button is clicked
  saveButton.addEventListener('click', function() {
    var data = { message: 'Hello, world!' };
    var blacklist = ["www.youtube.com","www.reddit.com","sjsu.instructure.com"];
    chrome.storage.local.set({'blacklist':blacklist});
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
    requestTimeFromBackground();
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(message) {
  console.log("upDateTime message received" + message.tracking);
  if (message.action === 'updateTime') {
    displayTime(message.timeData, message.tracking);
  }
});

function getBlacklist() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('blacklist', function(data) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(data.blacklist);
      }
    });
  });
}

// Display time spent on each website
async function displayTime(timeData, tracking) {
  var websiteList = document.getElementById('websiteList');
  websiteList.innerHTML = '';

  // Create arrays to hold website URLs and times
  var urls = [];
  var times = [];
  var totalTime = 0;
  var timeOffTask = 0;
  var blacklist;

  try {
    // Wait for the storage query to complete using async/await
    blacklist = await getBlacklist();
    console.log('Blacklist:', blacklist);

    // Further processing using blacklist
    console.log(timeData);
    console.log(timeData.websiteData);
  } catch (error) {
    console.error('Error retrieving blacklist:', error);
  }

  var websiteData = timeData.websiteData;
  
  // Calculate total time spent on all websites
  websiteData.forEach(function(website) {
    totalTime += website.time;
    if (blacklist){
      blacklist.forEach(function(blackListedWebsite){
        if (blackListedWebsite == website.url){
          timeOffTask += website.time;
          return;
        }
      })
    }
  });

  // Iterate through each website in timeData and display it
  websiteData.forEach(function(website) {
    var listItem = document.createElement('li');
    listItem.textContent = website.url + ': ' + formatTime(website.time);
    if (!tracking) {
      listItem.textContent += " Portion: " + ((website.time / totalTime) * 100).toFixed(2) + "%";
    }
    websiteList.appendChild(listItem);

    // Push URL and time to respective arrays
    urls.push(website.url);
    times.push(website.time);
  });

  var listItem = document.createElement('li');
  listItem.textContent = 'Total Time: ' + formatTime(totalTime);
  websiteList.appendChild(listItem);
  var listItem = document.createElement('li');
  listItem.textContent = 'Time off Task: ' + (timeOffTask/totalTime*100).toFixed(2) + "%";
  websiteList.appendChild(listItem);

  if(!tracking){
    chrome.storage.local.clear();
  }
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
