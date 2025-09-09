const socket = io(); // connects to same host/port as served page

const statusEl = document.getElementById("status");
const usernamePanel = document.getElementById("usernamePanel");
const chatPanel = document.getElementById("chatPanel");
const usernameInput = document.getElementById("username");
const joinBtn = document.getElementById("joinBtn");

const messagesEl = document.getElementById("messages");
const typingEl = document.getElementById("typing");
const form = document.getElementById("form");
const input = document.getElementById("input");

let myName = null;
let typingTimeout = null;

socket.on("connect", () => {
  statusEl.textContent = "Connected";
});

socket.on("disconnect", () => {
  statusEl.textContent = "Disconnected";
});

// system announcements
socket.on("system", (text) => {
  const li = document.createElement("li");
  li.className = "system";
  li.textContent = text;
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

// online users (optional)
socket.on("onlineUsers", (names) => {
  console.log("Online:", names);
});

// incoming chat message
socket.on("chat", (msg) => {
  addMessage(msg.user, msg.text, msg.ts);
});

// typing indicator
socket.on("typing", ({ user, isTyping }) => {
  if (isTyping) {
    typingEl.textContent = `${user} is typing…`;
  } else {
    typingEl.textContent = "";
  }
});

joinBtn.addEventListener("click", joinChat);
usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") joinChat();
});

function joinChat() {
  const name = usernameInput.value.trim() || "Anonymous";
  myName = name;
  socket.emit("join", name);
  usernamePanel.classList.add("hidden");
  chatPanel.classList.remove("hidden");
  input.focus();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  socket.emit("chat", text);
  input.value = "";
  socket.emit("typing", false);
});

input.addEventListener("input", () => {
  socket.emit("typing", true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("typing", false);
  }, 800);
});

function addMessage(user, text, ts) {
  const li = document.createElement("li");
  li.className = "message";

  const meta = document.createElement("div");
  meta.className = "meta";
  const when = new Date(ts || Date.now()).toLocaleTimeString();
  meta.textContent = `${user} • ${when}`;

  const body = document.createElement("div");
  body.className = "text";
  body.textContent = text;

  li.appendChild(meta);
  li.appendChild(body);
  messagesEl.appendChild(li);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
