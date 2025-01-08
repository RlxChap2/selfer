const { app, BrowserWindow, ipcMain } = require("electron");
const { Client } = require("discord.js-selfbot-v13");

let mainWindow;
let client;

// Initialize the main application window and set up events
app.whenReady().then(() => {
  mainWindow = createMainWindow();
  mainWindow.loadFile("views/index.html");

  // Handle login events from the renderer process
  ipcMain.on("login", (_, token) => {
    handleLogin(token);
  });

  // Handle event code submissions from the renderer process
  ipcMain.on("submit-event-code", (_, { event, code }) => {
    handleEventCodeSubmission(event, code);
  });
});

// Create the main browser window
function createMainWindow() {
  return new BrowserWindow({
    width: 1300,
    height: 800,
    icon: `${__dirname}/views/icon.png`,
    webPreferences: {
      preload: `${__dirname}/views/preload.js`,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
}

// Handle login with the provided token
function handleLogin(token) {
  // Destroy previous client instance if it exists
  if (client) client.destroy();

  // Create a new Discord client
  client = new Client();

  client.on("ready", () => {
    const userInfo = getUserInfo();
    sendBotReadyMessage(userInfo);
  });

  // Attempt to log in with the provided token
  client.login(token).catch((err) => {
    console.error("Login Error:", err);
    sendBotReadyMessage({
      error: "Failed to log in. Please check your token.",
    });
  });
}

// Get user information from the Discord client
function getUserInfo() {
  return {
    username: client.user.username,
    discriminator: client.user.discriminator,
    avatar: client.user.displayAvatarURL({ dynamic: true }),
    id: client.user.id,
  };
}

// Send a message to the renderer process when the bot is ready
function sendBotReadyMessage(message) {
  mainWindow.webContents.send("bot-ready", message);
}

// Handle event code submissions and bind them to the Discord client
function handleEventCodeSubmission(event, code) {
  if (!client) {
    sendBotReadyMessage({
      error: "Bot is not logged in. Please log in first.",
    });
    return;
  }

  try {
    client.on(event, async (...args) => {
      executeEventCode(event, code, args);
    });
    sendBotReadyMessage({
      success: `Event "${event}" is now being handled.`,
    });
  } catch (err) {
    console.error("Event Code Error:", err);
    sendBotReadyMessage({
      error: "Failed to handle the event. Please check your code.",
    });
  }
}

// Execute the event code and handle errors
function executeEventCode(event, code, args) {
  try {
    const [message, interaction] = args;
    eval(code);
  } catch (err) {
    console.error(`Event Execution Error (${event}):`, err);
    sendBotReadyMessage({
      error: `Error in executing the "${event}" event. Check your code.`,
    });
  }
}

// Handle app window closing event (for macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
