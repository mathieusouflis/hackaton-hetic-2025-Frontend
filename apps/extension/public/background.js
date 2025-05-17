chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureScreen") {
    chrome.tabs.captureVisibleTab({ format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Erreur de capture:", chrome.runtime.lastError);
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message,
        });
      } else {
        sendResponse({ success: true, imageData: dataUrl });
      }
    });

    return true;
  }
});
