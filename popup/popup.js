document.addEventListener("DOMContentLoaded", function () {
  var checklistPageButton = document.getElementById("checkListPageButton");

  checklistPageButton.addEventListener("click", function () {
    // Open checklist page when the button is clicked
    chrome.tabs.create({ url: "../checklistPage/checklistPage.html" });

  });

  var websiteTrackingButton = document.getElementById("websiteTrackingButton");

  websiteTrackingButton.addEventListener("click", function () {
    // Open checklist page when the button is clicked
    chrome.tabs.create({ url: "../timeTrackingPage/timeTrackingPage.html" });

  var pomodoroButton = document.getElementById("pomodoroButton");

  pomodoroButton.addEventListener("click", function () {
    chrome.runtime.sendMessage({action:'pomOpen'})
  });

  
});

});
