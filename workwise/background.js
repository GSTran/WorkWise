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

// Listen for messages from popup or other content scripts
chrome.runtime.onMessage.addListener(function(message, sender) {
  if (message.action === 'startTracking') {
    trackingEnabled = true;
  } else if (message.action === 'stopTracking') {
    trackingEnabled = false;
    // Clear startTimeMap when tracking is stopped
    startTimeMap = {};
  }
  else if (message.action === 'requestTime') {
    // Respond to the request with the time data
    sendTimeData();
    return true; // Indicates that the response will be sent asynchronously
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

