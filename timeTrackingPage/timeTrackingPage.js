// Function to send a message to background script
function sendMessageToBackground(message) {
  chrome.runtime.sendMessage(message);
}

// Function to request time spent on each website from background script
function requestTimeFromBackground() {
  sendMessageToBackground({ action: 'requestTime' });
}

var isTracking;

//when the time tracking page is loaded
document.addEventListener('DOMContentLoaded', function() {
  //update the time tracking page with the current websites being tracked
  requestTimeFromBackground();

  //notify the background that the time tracking page is open
  chrome.runtime.sendMessage({action:'timeTrackOpen'});

  //notify the background that the time tracking page is closed
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === 'hidden') {
      chrome.runtime.sendMessage({action:'timeTrackClose'});
    }
  });

  //gets the tracking status to correctly set the tracking button
  chrome.runtime.sendMessage({action:'getTracking'});

});


var button = document.getElementById('toggleTracking');
// Handle button click to start or stop tracking
document.getElementById('toggleTracking').addEventListener('click', function() {
  var isTracking = (button.textContent === 'Start Tracking');
  
  // Sets tracking button text and tracks time
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

//listen for messages from background
chrome.runtime.onMessage.addListener(function (message) {
  var action = message.action;

  //sets the tracking button based on if website activity is being tracked or not
  if(action === 'updateTrackingButton')
  {
    const tracking = message.tracking;
    if(tracking){
      button.textContent = 'Stop Tracking';
    }
  }
  //updates the textbox on the time tracking page to include the websites that have been tracked
  else if (action==='updateTime'){
    displayTime(message.timeData, message.tracking);
  }
});

//gets the blacklisted websites from the storage adn returns them to the callling function
function getBlacklist() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('BlockedWebsites', function(data) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(data.BlockedWebsites);
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
    // wait for the blacklisted websites to be loaded
    blacklist = await getBlacklist();

    //Debugging statements
  //   console.log(timeData);
  //   console.log(timeData.websiteData);
  } catch (error) {
    console.error('Error retrieving blacklist:', error);
  }

  //returns if there is no website data to be displayed
  var websiteData = timeData.websiteData;
  if (websiteData ==null){
    return;
  }

  // Calculate total time spent on all websites
  websiteData.forEach(function(website) {
    totalTime += website.time;
    //calculate the total time spent on blacklisted websites
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
    //creates a list item for each website that will contain all of the related data
    var listItem = document.createElement('li');

    //adds the time spent on that website to the list element
    listItem.textContent = website.url + ': ' + formatTime(website.time);
    if (!tracking) {
        listItem.appendChild(document.createElement('br'));

        //adds the proportion of the total time spent on that website to the list element
        var portionText = document.createElement('span');
        var proportion = (website.time / totalTime) * 100;
        portionText.textContent += "Portion: " + proportion.toFixed(2) + "%";
        listItem.appendChild(portionText);

        // adds a progress bar for a visual representation of the proportion
        var progressBar = document.createElement('progress');
        progressBar.value = proportion;
        progressBar.max = 100;
        listItem.appendChild(progressBar);
    }
    //adds the current list item to the website list
    websiteList.appendChild(listItem);
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
  
  //add a progress bar for the time spent off task
  if(!tracking){
    var progressBar = document.createElement('progress');
    progressBar.value = propOffTask;
    progressBar.max = 100;
    offTaskItem.appendChild(progressBar);
    listItem.appendChild(offTaskItem);
  }
  websiteList.appendChild(listItem);

  //Clear the website data in the storage when tracking stops
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
