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
// // Listen for window focus change
// chrome.windows.onFocusChanged.addListener(function(windowId) {
//   if (trackingEnabled) {
//     if (windowId === chrome.windows.WINDOW_ID_NONE) {
//       // When window loses focus, calculate and update the time for the active tab
//       chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//         var currentTab = tabs[0];
//         var url = currentTab.url;
//         var currentTime = new Date().getTime();
        
//         if (startTimeMap[url]) {
//           var startTime = startTimeMap[url];
//           var elapsedTime = currentTime - startTime;
//           trackTimeOnWebsite(url, elapsedTime);
//           delete startTimeMap[url];
//         }
//       });
//     } else {
//       // When window gains focus again, start tracking time for active tab
//       chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//         var currentTab = tabs[0];
//         var url = currentTab.url;
//         startTimeMap[url] = new Date().getTime();
//       });
//     }
//   }
// });

//Function to track time spent on a website
function trackTimeOnWebsite(url, elapsedTime) {
  // Retrieve stored time for this website
  chrome.storage.local.get(url, function(data) {
    var totalTime = data[url] || 0;

    // Update the total time spent on this website
    var newData = {};
    newData[url] = totalTime + elapsedTime;
    chrome.storage.local.set(newData);

    chrome.storage.local.get(null, function(data) {
      // Send the time data back to the requesting script
      chrome.runtime.sendMessage({ action: 'updateTime', timeData: data });
    });
  });
}
// function trackTimeOnWebsite(url, elapsedTime) {
//   var key = 'websiteData';
  
//   // Retrieve stored time for all websites
//   chrome.storage.local.get(key, function(data) {
//     var websiteData = data || {};
//     console.log("website Data before adding");
//     console.log(websiteData);

//     // Update the total time spent on this website
//     websiteData[url] = (websiteData[url] || 0) + elapsedTime;
//     websiteData["hello"] = "Sata Andagi"
//     console.log("website Data after adding");
//     console.log(websiteData);

//     // Update the stored data with the updated website data
//     chrome.storage.local.set({'websiteData':websiteData);

//     printData();

//     // Send the updated website data back to the requesting script
//     chrome.runtime.sendMessage({ action: 'updateTime', timeData: websiteData });
//   });
// }

// function printData(){
//   chrome.storage.local.get('websiteData', function(data) {
//     // Optional code to execute after setting data in local storage
//     console.log("Data right afta");
//     console.log(data);
//   });
// }


//Function to send an updateTime message to the timeTrackingPage


// Listen for messages from popup or other content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'startTracking') {
    trackingEnabled = true;
  } else if (message.action === 'stopTracking') {
    trackingEnabled = false;
    // Clear startTimeMap when tracking is stopped
    startTimeMap = {};
  }
  else if (message.action === 'requestTime') {
    // Respond to the request with the time data
    sendTimeData(sendResponse);
    return true; // Indicates that the response will be sent asynchronously
  }
});

// Function to send time data to the requesting script
function sendTimeData(sendResponse) {
  // Retrieve all time data from storage
  chrome.storage.local.get(null, function(data) {
    // Send the time data back to the requesting script
    sendResponse({ action: 'updateTime', timeData: data });
    console.log("Responded to requestTime message")
  });
}

