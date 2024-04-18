// chrome.runtime.onMessage.addListener(function(message, sender) {
//   if (message.action === 'play') {
//     document.querySelector(`[data-sound="${message.mode}"]`).play();
//   }
// });

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(message) {
  if (message.action ==='play'){
    playAudio(message.mode);
  }
});

// Play sound with access to DOM APIs
function playAudio(mode) {
  document.querySelector(`[data-sound="${mode}"]`).play();
}

console.log('Offscreen document is ready');