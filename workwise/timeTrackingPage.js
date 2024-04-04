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

  // Create arrays to hold website URLs and times
  var urls = [];
  var times = [];

  // Iterate through each website in timeData and display it
  Object.keys(timeData).forEach(function(url) {
    var listItem = document.createElement('li');
    listItem.textContent = url + ': ' + formatTime(timeData[url]);
    websiteList.appendChild(listItem);

    // Push URL and time to respective arrays
    urls.push(url);
    times.push(timeData[url]);
  });

  // Update pie chart
  updatePieChart(urls, times);
}

// Function to update the pie chart
function updatePieChart(labels, data) {
  // Get the canvas element
  var ctx = document.getElementById('pieChart').getContext('2d');

  // If the chart already exists, destroy it
  if (window.myPieChart) {
    window.myPieChart.destroy();
  }

  // Create a new pie chart
  window.myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Time Spent',
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(231,233,237,0.6)',
          'rgba(254,97,132,0.6)',
          'rgba(54,162,235,0.6)',
          'rgba(0,255,65,0.6)',
          'rgba(255,206,86,0.6)',
          'rgba(75,192,192,0.6)',
          'rgba(153,102,255,0.6)',
          'rgba(255,159,64,0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(231,233,237,1)',
          'rgba(254,97,132,1)',
          'rgba(54,162,235,1)',
          'rgba(0,255,65,1)',
          'rgba(255,206,86,1)',
          'rgba(75,192,192,1)',
          'rgba(153,102,255,1)',
          'rgba(255,159,64,1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: 'Time Spent on Websites'
      }
    }
  });
}

// Helper function to format time
function formatTime(time) {
  // Your formatting logic here
  return time;
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
