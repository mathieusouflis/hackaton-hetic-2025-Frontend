window.addEventListener("keydown", async (e) => {
  const selection = window.getSelection();
  const selectedText = selection ? selection.toString() : "";
  if (e.key.toLowerCase() === "b" && selectedText) {
    if (document.getElementById("custom-modal-overlay")) return;
    localStorage.setItem("textSelected", selectedText);

    // Create the overlay
    const overlay = document.createElement("iframe");
    overlay.src = chrome.runtime.getURL("index.html");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0,0,0,0.5)";
    overlay.style.zIndex = "9999";
    overlay.id = "custom-modal-overlay";
    document.body.appendChild(overlay);

    document.body.appendChild(overlay);
  }
});
