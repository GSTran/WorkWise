var WebsiteUrl;
var WebsiteHostName;

var toggleBlock = document.getElementById("toggleBlock");

// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   WebsiteUrl = tabs[0].url;
//   WebsiteHostName = new URL(tabs[0].url).hostname;

//   document.getElementById("url").innerText = WebsiteHostName;
// });

function ShowError(text) {
  var div = document.createElement("div");
  div.setAttribute("id", "ERRORcontainer");
  div.innerHTML = `
                <div class="ERROR">
                    <p>${text}</p>     
                </div>`;
  document.getElementsByClassName("bottomItem")[0].appendChild(div);

  setTimeout(() => {
    document.getElementById("ERRORcontainer").remove();
  }, 3000);
}

// Function to retrieve blocked websites from local storage and display them
function displayBlockedWebsites() {
  chrome.storage.local.get("BlockedWebsites", (data) => {
    const blockedWebsites = data.BlockedWebsites || [];
    const blockedWebsitesList = document.getElementById("blockedWebsitesList");
    blockedWebsitesList.innerHTML = ""; // Clear existing list
    blockedWebsites.forEach((website) => {
      const listItem = document.createElement("li");
      listItem.textContent = website;

      // Create remove button
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.classList.add("removeBtn");
      removeBtn.addEventListener("click", () => removeBlockedWebsite(website));

      listItem.appendChild(removeBtn);
      blockedWebsitesList.appendChild(listItem);
    });
  });
}

// Event listener for remove button
function removeBlockedWebsite(website) {
  chrome.storage.local.get("BlockedWebsites", (data) => {
    const blockedWebsites = data.BlockedWebsites || [];
    const updatedBlockedWebsites = blockedWebsites.filter(
      (item) => item !== website
    );
    chrome.storage.local.set(
      { BlockedWebsites: updatedBlockedWebsites },
      () => {
        displayBlockedWebsites(); // Update displayed list
      }
    );
  });
}

// Display blocked websites when popup is opened
displayBlockedWebsites();

// Event listener for the addBtn
document.getElementById("addBtn").addEventListener("click", () => {
  const websiteInput = document.getElementById("websiteInput").value.trim();
  if (websiteInput) {
    addToBlockedWebsites(websiteInput);
    document.getElementById("websiteInput").value = "";
  } else {
    ShowError("Please enter a website to block");
  }
});

// Function to add a website to the list of blocked websites
function addToBlockedWebsites(website) {
  chrome.storage.local.get("BlockedWebsites", (data) => {
    const blockedWebsites = data.BlockedWebsites || [];
    const updatedBlockedWebsites = [...blockedWebsites, website];
    chrome.storage.local.set(
      { BlockedWebsites: updatedBlockedWebsites },
      () => {
        displayBlockedWebsites(); // Update displayed list
      }
    );
  });
}
