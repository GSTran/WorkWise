document.addEventListener("DOMContentLoaded", function () {
  var checklistPageButton = document.getElementById("checkListPageButton");

  checklistPageButton.addEventListener("click", function () {
    // Open checklist page when the button is clicked
    chrome.tabs.create({ url: "../checklistPage/checklistPage.html" });
  });

  // var websiteTrackingButton = document.getElementById("websiteTrackingButton");

  // websiteTrackingButton.addEventListener("click", function () {
  //   // Open checklist page when the button is clicked
  //   chrome.tabs.create({ url: "../timeTrackingPage/timeTrackingPage.html" });
  // });
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === 'hidden') {
      // Popup is closed, do something
      chrome.notifications.create(
        {
          type: "basic",
          title: "jajaja",
          message: "bruh moment",
          iconUrl: "../img/cat.png"
        });
      console.log("Popup closed");
    }
  });
  

  window.addEventListener('beforeunload', function(event) {
    // Perform actions when the popup is being closed
    chrome.notifications.create(
      {
        type: "basic",
        title: "jajaja",
        message: "bruh moment",
        iconUrl: "../img/cat.png"
      }
    );
    console.log('Popup is closing');
    // You can do whatever you need to do here, like saving data or cleaning up resources
  });
  
  var pomodoroButton = document.getElementById("pomodoroButton");

  pomodoroButton.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "pomOpen" });
  });
});
