document.addEventListener("DOMContentLoaded", function () {
  var mainPageButton = document.getElementById("mainPageButton");

  mainPageButton.addEventListener("click", function () {
    // Open main page when the button is clicked
    chrome.tabs.create({ url: "mainPage.html" });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var checklistPageButton = document.getElementById("checkListPageButton");

  checklistPageButton.addEventListener("click", function () {
    // Open checklist page when the button is clicked
    chrome.tabs.create({ url: "checklistPage.html" });
  });
});
