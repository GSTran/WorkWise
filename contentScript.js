function CloseTab() {
  alert("This URL is blocked by WorkWise");
  chrome.runtime.sendMessage({ CloseMe: true });
}

// Function to check if the current website is in the list of blocked websites
function checkBlockedWebsites() {
  chrome.storage.local.get("BlockedWebsites", (data) => {
    const blockedWebsites = data.BlockedWebsites || [];
    const currentWebsite = window.location.hostname;
    if (blockedWebsites.includes(currentWebsite)) {
      CloseTab();
    }
  });
}

// Call the function initially when the content script is loaded

chrome.storage.local.get("blacklistEnabled", function (data) {
  if (data.blacklistEnabled === 1) {
    checkBlockedWebsites();
  }
});




// Listen for changes in the blocked list and update the blocking behavior
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.BlockedWebsites) {
    checkBlockedWebsites();
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateBlockedWebsites") {
    checkBlockedWebsites(); // Update blocking behavior when the blocked list is updated
  }
});
