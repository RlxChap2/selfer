const { contextBridge, ipcRenderer } = require("electron");

// Expose an API to the renderer process via contextBridge
contextBridge.exposeInMainWorld("electronAPI", {
  // Method to send login token to the main process
  login: (token) => ipcRenderer.send("login", token),

  // Event listener for when the bot is ready
  onBotReady: (callback) =>
    ipcRenderer.on("bot-ready", (_, data) => callback(data)),

  // Method to send event code submission to the main process
  sendEventCode: (eventData) =>
    ipcRenderer.send("submit-event-code", eventData),
});
