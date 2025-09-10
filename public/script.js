const socket = io();

let username = localStorage.getItem("username") || "";
let avatar = localStorage.getItem("avatar") || "";

// Elements
const setupDiv = document.getElementById("setup");
const chatDiv = document.getElementById("chat");
const usernameInput = document.getElementById("usernameInput");
const avatarInput = document.getElementById("avatarInput");
const joinBtn = document.getElementById("joinBtn");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

// Join chat
joinBtn.onclick = () => {
  username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter your name");
    return;
  }

  // Handle avatar upload
  if (avatarInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatar = e.target.result;
      saveAndEnter();
    };
    reader.readAsDataURL(avatarInput.files[0]);
  } else {
    saveAndEnter();
  }
};

function saveAndEnter() {
  localStorage.setItem("username", username);
  localStorage.setItem("avatar", avatar);

  setupDiv.style.display = "none";
  chatDiv.style.display = "flex";
}

// Send message
form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", {
      username,
      avatar,
      message: input.value
    });
    input.value = "";
  }
});

// Receive chat history
socket.on("chat history", (history) => {
  messages.innerHTML = "";
  history.forEach(addMessage);
});

// Receive new message
socket.on("chat message", (msg) => {
  addMessage(msg);
});

// Display message
function addMessage(msg) {
  const li = document.createElement("li");

  const avatarImg = msg.avatar
    ? `<img src="${msg.avatar}" class="avatar" />`
    : `<div class="avatar placeholder">${msg.username[0]}</div>`;

  li.innerHTML = `
    ${avatarImg}
    <div class="msg-content">
      <strong>${msg.username}</strong><br />
      ${msg.message}
    </div>
  `;

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}
