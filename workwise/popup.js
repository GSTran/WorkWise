document.addEventListener('DOMContentLoaded', function() {
    var mainPageButton = document.getElementById('mainPageButton');
  
    mainPageButton.addEventListener('click', function() {
      // Open main page when the button is clicked
      chrome.tabs.create({url: 'mainPage.html'});
    });
  });
  