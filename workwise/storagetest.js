document.addEventListener('DOMContentLoaded', function() {
    const websiteInput = document.getElementById('websiteInput');
    const recordBtn = document.getElementById('recordBtn');
    const recordedList = document.getElementById('recordedList');

    // Chrome storage api, should be synced
    chrome.storage.sync.get('websites', function(data) {
        const websites = data.websites || [];
        websites.forEach(function(website) {
            const li = document.createElement('li');
            li.textContent = website;
            recordedList.appendChild(li);
        });
    });

    // Records websites
    recordBtn.addEventListener('click', function() {
        const website = websiteInput.value.trim();
        if (website !== '') {
            const li = document.createElement('li');
            li.textContent = website;
            recordedList.appendChild(li);

            chrome.storage.sync.get('websites', function(data) {
                const websites = data.websites || [];
                websites.push(website);
                chrome.storage.sync.set({ 'websites': websites });
            });

            websiteInput.value = '';
        }
    });
});
