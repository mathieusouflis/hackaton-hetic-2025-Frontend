class SelectionTooltip {
  constructor() {
    this.tooltip = null;
    this.actions = [
      { icon: "💾", label: "Sauvegarder", action: "save" },
      { icon: "❌", label: "Annuler", action: "cancel" },
    ];
    this.ignoreNextClick = false;
    this.selectedText = null;
    this.initTooltip();
  }

  initTooltip() {
    
    this.tooltip = document.createElement("div");
    this.tooltip.className = "selection-tooltip";
    this.tooltip.style.cssText = `
      position: absolute;
      display: none;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 3px 14px rgba(0, 0, 0, 0.2);
      padding: 10px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      display: flex;
      gap: 12px;
      align-items: center;
      transition: all 0.15s ease;
      border: 1px solid #eaeaea;
      opacity: 0;
      transform: translateY(8px);
    `;

    
    this.actions.forEach((action) => {
      const button = document.createElement("button");
      button.className = "tooltip-action";
      button.setAttribute("data-action", action.action);
      button.style.cssText = `
        background-color: ${action.action === "save" ? "#f0f9ff" : "#fff5f5"};
        border: 1px solid ${action.action === "save" ? "#bae6fd" : "#fecaca"};
        color: ${action.action === "save" ? "#0284c7" : "#ef4444"};
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px 16px;
        border-radius: 6px;
        transition: all 0.2s ease;
      `;

      button.innerHTML = `
        <span style="font-size: 20px;">${action.icon}</span>
        <span style="font-size: 12px;">${action.label}</span>
      `;

      button.addEventListener("mouseenter", () => {
        if (action.action === "save") {
          button.style.backgroundColor = "#e0f2fe";
          button.style.borderColor = "#7dd3fc";
        } else {
          button.style.backgroundColor = "#fee2e2";
          button.style.borderColor = "#fca5a5";
        }
      });

      button.addEventListener("mouseleave", () => {
        if (action.action === "save") {
          button.style.backgroundColor = "#f0f9ff";
          button.style.borderColor = "#bae6fd";
        } else {
          button.style.backgroundColor = "#fff5f5";
          button.style.borderColor = "#fecaca";
        }
      });

      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Bouton cliqué:", action.action);
        this.handleAction(action.action);
      });

      this.tooltip.appendChild(button);
    });

    
    document.body.appendChild(this.tooltip);

    
    document.addEventListener("click", (e) => {
      if (this.ignoreNextClick) {
        this.ignoreNextClick = false;
        return;
      }
      
      if (!this.tooltip.contains(e.target)) {
        this.hideTooltip();
      }
    });
  }

  showTooltip(x, y, selectedText) {
    console.log("Showing tooltip with text:", selectedText);
    this.selectedText = selectedText;
    this.tooltip.style.display = "flex";

    
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y + 10;

    if (adjustedX + tooltipRect.width > windowWidth) {
      adjustedX = windowWidth - tooltipRect.width - 10;
    }

    if (adjustedY + tooltipRect.height > windowHeight) {
      adjustedY = y - tooltipRect.height - 10;
    }

    this.tooltip.style.left = `${adjustedX}px`;
    this.tooltip.style.top = `${adjustedY}px`;

    setTimeout(() => {
      this.tooltip.style.opacity = "1";
      this.tooltip.style.transform = "translateY(0)";
    }, 10);
  }

  hideTooltip() {
    this.tooltip.style.opacity = "0";
    this.tooltip.style.transform = "translateY(8px)";
    setTimeout(() => {
      this.tooltip.style.display = "none";
    }, 200);
  }

  handleAction(action) {
    console.log("handleAction called with:", action);
    console.log("Current selectedText:", this.selectedText);

    switch (action) {
      case "save":
        console.log("Saving text:", this.selectedText);
        if (this.selectedText) {
          try {
            if (chrome && chrome.storage) {
              chrome.storage.local.set({ selectedText: this.selectedText }, function () {
                console.log("Text saved to storage from tooltip");
              });
            } else {
              localStorage.setItem("textSelected", this.selectedText);
            }
            this.openOverlay(this.selectedText);
          } catch (e) {
            showNotification("Extension context invalidé. Recharge la page.");
            console.error("Extension context invalidated:", e);
          }
        } else {
          console.error("No text selected!");
        }
        break;

      case "cancel":
        this.hideTooltip();
        break;
    }
  }

  openOverlay(selectedText) {
    console.log("Opening overlay with text:", selectedText);

    const existingOverlay = document.getElementById("custom-modal-overlay");
    if (existingOverlay) {
      existingOverlay.remove();
    }

    try {
      const overlay = document.createElement("iframe");
      overlay.src = chrome.runtime.getURL("index.html");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.border = "none";
      overlay.style.background = "rgba(0,0,0,0.5)";
      overlay.style.zIndex = "2147483647";
      overlay.id = "custom-modal-overlay";
      console.log("Ajout de l'iframe au DOM", overlay);
      document.body.appendChild(overlay);

      overlay.addEventListener("load", () => {
        console.log("Overlay loaded, sending text:", selectedText);
        try {
          overlay.contentWindow.postMessage(
            {
              type: "FROM_CONTENT_SCRIPT",
              text: selectedText,
            },
            "*"
          );
        } catch (error) {
          showNotification("Impossible d'envoyer le texte au modal.");
          console.error("Error sending message to iframe:", error);
        }
      });

      overlay.addEventListener("error", (error) => {
        showNotification("Erreur lors du chargement du modal.");
        console.error("Error loading iframe:", error);
      });
    } catch (e) {
      showNotification("Extension context invalidé. Recharge la page.");
      console.error("Extension context invalidated:", e);
    }
  }
}


function showNotification(message) {
  const notification = document.createElement("div");
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: rgba(0, 128, 0, 0.8);
    color: white;
    padding: 12px;
    border-radius: 5px;
    z-index: 2147483646;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    transition: opacity 0.5s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 500);
  }, 3000);
}


const selectionTooltip = new SelectionTooltip();


document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  const selectedText = selection ? selection.toString().trim() : "";

  if (!selectedText) {
    selectionTooltip.hideTooltip();
    return;
  }
});


document.addEventListener("mouseup", (e) => {
  const selection = window.getSelection();
  const selectedText = selection ? selection.toString().trim() : "";

  if (selectedText) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    selectionTooltip.ignoreNextClick = true;
    
    selectionTooltip.showTooltip(
      (rect.left + rect.right) / 2,
      rect.bottom + window.scrollY,
      selectedText
    );
    
    e.stopPropagation();
  }
});


document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "b") {
    e.preventDefault();
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : "";
    if (selectedText) {
      selectionTooltip.openOverlay(selectedText);
    }
  }
});


window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLOSE_MODAL") {
    const overlay = document.getElementById("custom-modal-overlay");
    if (overlay) {
      overlay.remove();
    }
  }
});

console.log("📚 Extension activée. Sélectionnez du texte pour voir le tooltip ou utilisez Ctrl+B.");



window.addEventListener("keydown", async (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString() : "";

    if (selectedText) {
      if (document.getElementById("custom-modal-overlay")) return;

      if (chrome && chrome.storage) {
        chrome.storage.local.set({ selectedText: selectedText }, function () {
          console.log("Text saved to storage with keyboard shortcut");
        });
      } else {
        localStorage.setItem("textSelected", selectedText);
      }

      
      const overlay = document.createElement("iframe");
      overlay.src = chrome.runtime.getURL("./index.html");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.border = "none";
      overlay.style.background = "transparent";
      overlay.style.zIndex = "2147483647";
      overlay.id = "custom-modal-overlay";
      document.body.appendChild(overlay);

      
      overlay.addEventListener("load", () => {
        overlay.contentWindow.postMessage(
          {
            type: "FROM_CONTENT_SCRIPT",
            text: selectedText,
          },
          "*"
        );
      });
    }
  }
});


window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLOSE_MODAL") {
    const overlay = document.getElementById("custom-modal-overlay");
    if (overlay) {
      overlay.remove();
    }
  }
});
