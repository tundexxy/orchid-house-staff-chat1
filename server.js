const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 🟣 Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://orchidstaff:orchid123@cluster0.snz31sr.mongodb.net/orchidchat?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Schema for saving messages
const chatSchema = new mongoose.Schema({
  username: String,
  avatar: String,   // profile picture (base64 string)
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model("Chat", chatSchema);

app.use(express.static("public"));

// Socket.io handling
io.on("connection", async (socket) => {
  console.log("a user connected", socket.id);

  // Load chat history (last 100 messages)
  const history = await Chat.find().sort({ timestamp: 1 }).limit(100);
  socket.emit("chat history", history);

  // Save new message
  socket.on("chat message", async (msg) => {
    const newMsg = new Chat({
      username: msg.username,
      avatar: msg.avatar,
      message: msg.message,
    });
    await newMsg.save();

    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🌸 Orchid House Staff Chat running on http://localhost:${PORT}`);
});
