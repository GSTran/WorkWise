document.addEventListener("DOMContentLoaded", function () {
  var checklistPageButton = document.getElementById("checkListPageButton");

  window.addEventListener("beforeunload", function (event) {
    // Perform actions when the popup is being closed
    chrome.notifications.create({
      type: "basic",
      title: "jajaja",
      message: "bruh moment",
      iconUrl: "../img/cat.png",
    });
    console.log("Popup is closing");
    // You can do whatever you need to do here, like saving data or cleaning up resources
  });
});
