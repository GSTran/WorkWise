// Function to send a message to background script
function sendMessageToBackground(message) {
  chrome.runtime.sendMessage(message);
}

// Function to request time spent on each website from background script
function requestTimeFromBackground() {
  sendMessageToBackground({ action: 'requestTime' });
}

var isTracking;

// Display time spent on each website
document.addEventListener('DOMContentLoaded', function() {
  requestTimeFromBackground();
  chrome.runtime.sendMessage({action:'timeTrackOpen'});
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === 'hidden') {
      chrome.runtime.sendMessage({action:'timeTrackClose'});
    }
  });

  chrome.runtime.sendMessage({action:'getTracking'});

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

var button = document.getElementById('toggleTracking');
// Handle button click to start or stop tracking
document.getElementById('toggleTracking').addEventListener('click', function() {
  var isTracking = (button.textContent === 'Start Tracking');
  
  if (isTracking) {
    sendMessageToBackground({ action: 'startTracking' });
    button.textContent = 'Stop Tracking';
    requestTimeFromBackground();
  } else {
    sendMessageToBackground({ action: 'stopTracking' });
    button.textContent = 'Start Tracking';
    requestTimeFromBackground();

    var websiteList = document.getElementById('websiteList');
    websiteList.innerHTML = '';
  }
});

chrome.runtime.onMessage.addListener(function (message) {
  var action = message.action;

  if(action === 'updateTrackingButton')
  {
    const tracking = message.tracking;
    if(tracking){
      button.textContent = 'Stop Tracking';
    }
  }
  else if (action==='updateTime'){
    displayTime(message.timeData, message.tracking);
  }
});

// Listen for messages from background script
// chrome.runtime.onMessage.addListener(function(message) {
//   console.log("upDateTime message received" + message.tracking);
//   if (message.action === 'updateTime') {
//     displayTime(message.timeData, message.tracking);
//   }
// });

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
  if (websiteData ==null){
    return;
  }

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
        listItem.appendChild(document.createElement('br'));

        var portionText = document.createElement('span');
        var proportion = (website.time / totalTime) * 100;
        portionText.textContent += "Portion: " + proportion.toFixed(2) + "%";
        listItem.appendChild(portionText);

        // Creating a progress bar element
        var progressBar = document.createElement('progress');
        progressBar.value = proportion;
        progressBar.max = 100;
        listItem.appendChild(progressBar);
    }
    websiteList.appendChild(listItem);

    // Push URL and time to respective arrays
    // urls.push(website.url);
    // times.push(website.time);
  });
  //Total Time element
  var listItem = document.createElement('li');
  listItem.textContent = 'Total Time: ' + formatTime(totalTime);
  //websiteList.appendChild(listItem);
  listItem.appendChild(document.createElement('br'));

  //Time Off Task element
  var offTaskItem = document.createElement('span');
  var propOffTask = timeOffTask/totalTime*100;
  offTaskItem.textContent = 'Time off Task: ' + propOffTask.toFixed(2) + "%";
  if(!tracking){
    var progressBar = document.createElement('progress');
    progressBar.value = propOffTask;
    progressBar.max = 100;
    offTaskItem.appendChild(progressBar);
    listItem.appendChild(offTaskItem);
  }
  websiteList.appendChild(listItem);

  //Clear when tracking stops
  if(!tracking){
    chrome.storage.local.set({ 'websiteData': null }, function() {
      console.log('Data has been cleared.');
    });
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
