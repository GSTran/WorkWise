document.addEventListener("DOMContentLoaded", function () {
  var mainPageButton = document.getElementById("mainPageButton");

  mainPageButton.addEventListener("click", function () {
    // Open main page when the button is clicked
    chrome.tabs.create({ url: "../mainPage/mainPage.html" });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var checklistPageButton = document.getElementById("checkListPageButton");

  checklistPageButton.addEventListener("click", function () {
    // Open checklist page when the button is clicked
    chrome.tabs.create({ url: "../checklistPage/checklistPage.html" });
  });
});

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", function () {
  var checklistPageButton = document.getElementById("createAccountPageButton");

  checklistPageButton.addEventListener("click", function () {
    // Open checklist page when the button is clicked
    chrome.tabs.create({ url: "../signupPage/signup.html" });
  });
=======
>>>>>>> Stashed changes
var checklistPageButton = document.getElementById("websiteTrackingButton");

checklistPageButton.addEventListener("click", function () {
  // Open checklist page when the button is clicked
  chrome.tabs.create({ url: "../timeTrackingPage/timeTrackingPage.html" });
<<<<<<< Updated upstream
=======
>>>>>>> 75744ec1dd760d38253b9ab419874148c85c43ec
>>>>>>> Stashed changes
});
