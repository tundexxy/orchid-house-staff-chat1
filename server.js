// server.js
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// serve files from /public
app.use(express.static(path.join(__dirname, "public")));

const users = new Map(); // socket.id -> username

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  // user joins with a chosen name
  socket.on("join", (username) => {
    const cleanName = String(username || "Anonymous").trim().slice(0, 30);
    users.set(socket.id, cleanName);
    socket.broadcast.emit("system", `${cleanName} joined Orchid House Staff Chat`);
    io.to(socket.id).emit("onlineUsers", Array.from(users.values()));
  });

  // incoming chat message
  socket.on("chat", (text) => {
    const user = users.get(socket.id) || "Anonymous";
    const message = {
      user,
      text: String(text || "").slice(0, 1000),
      ts: Date.now(),
    };
    io.emit("chat", message);
  });

  // typing indicator
  socket.on("typing", (isTyping) => {
    const user = users.get(socket.id) || "Someone";
    socket.broadcast.emit("typing", { user, isTyping: !!isTyping });
  });

  socket.on("disconnect", () => {
    const name = users.get(socket.id);
    users.delete(socket.id);
    if (name) {
      socket.broadcast.emit("system", `${name} left Orchid House Staff Chat`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🌸 Orchid House Staff Chat running on http://localhost:${PORT}`);
});
