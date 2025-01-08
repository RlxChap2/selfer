// Login Button Event Listener
document.getElementById("loginBtn").addEventListener("click", () => {
  const token = document.getElementById("tokenInput").value.trim();
  const statusElement = document.getElementById("status");

  if (token) {
    window.electronAPI.login(token);
    statusElement.innerText = "Logging in...";
  } else {
    statusElement.innerText = "Please enter a valid token.";
  }
});

// Handle Bot Ready Event
window.electronAPI.onBotReady((data) => {
  const statusElement = document.getElementById("status");
  const loginContainer = document.getElementById("login-container");
  const userInfoContainer = document.getElementById("user-info-container");
  const eventContainer = document.getElementById("event-container");

  if (data.error) {
    statusElement.innerText = data.error;
  } else {
    // Hide Login Section
    loginContainer.classList.add("hidden");

    // Show User Info
    userInfoContainer.classList.remove("hidden");
    userInfoContainer.innerHTML = `
      <div id="userInfo">
        <img src="${data.avatar}" alt="Avatar" class="avatar" />
        <p><strong>Username:</strong> ${data.username}#${data.discriminator}</p>
        <p><strong>ID:</strong> ${data.id}</p>
      </div>
    `;

    // Show Event Editor
    eventContainer.classList.remove("hidden");
    statusElement.innerText = ""; // Clear previous status
  }
});

// Submit Event Code
document.getElementById("submitCode").addEventListener("click", () => {
  const event = document.getElementById("event").value.trim();
  const eventCode = document.getElementById("eventCode").value.trim();
  const statusElement = document.getElementById("code-status");

  if (event && eventCode) {
    // Send event and code to the main process
    window.electronAPI.sendEventCode({ event, code: eventCode });
    statusElement.innerText = "Event code submitted successfully!";
  } else {
    statusElement.innerText = "Please select an event and write the code.";
  }
});
