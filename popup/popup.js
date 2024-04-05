document.addEventListener("DOMContentLoaded", function () {
  var mainPageButton = document.getElementById("mainPageButton");
  var checklistPageButton = document.getElementById("checkListPageButton");
  var createAccountPageButton = document.getElementById(
    "createAccountPageButton"
  );
  var websiteTrackingButton = document.getElementById("websiteTrackingButton");

  mainPageButton.addEventListener("click", function () {
    // Open main page when the button is clicked
    chrome.tabs.create({ url: "../mainPage/mainPage.html" });
  });

  checklistPageButton.addEventListener("click", function () {
    // Open checklist page when the button is clicked
    chrome.tabs.create({ url: "../checklistPage/checklistPage.html" });
  });

  createAccountPageButton.addEventListener("click", function () {
    // Open create account page when the button is clicked
    chrome.tabs.create({ url: "../signupPage/signup.html" });
  });

  websiteTrackingButton.addEventListener("click", function () {
    // Open time tracking page when the button is clicked
    chrome.tabs.create({ url: "../timeTrackingPage/timeTrackingPage.html" });
  });
});
