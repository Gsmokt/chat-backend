const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const socketio = require("socket.io");
const { createServer } = require("http");

const databaseConnect = require("./config/database");
const authRouter = require("./routes/authRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const messengerRoute = require("./routes/messengerRoute");

dotenv.config();

const httpServer = createServer(app);

const io = socketio(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({ credentials: true }));
app.use("/api/messenger", authRouter);
app.use("/api/messenger", messengerRoute);

const PORT = 5000;
app.get("/", (req, res) => {
  res.send("This is from backend Sever");
});

databaseConnect(process.env.DATABASE_URL);

let users = [];
const addUser = (userId, socketId, userInfo) => {
  const checkUser = users.some((u) => u.userId === userId);

  if (!checkUser) {
    users.push({ userId, socketId, userInfo });
  }
};
const userRemove = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId);
};

const findFriend = (id) => {
  return users.find((u) => u.userId === id);
};

const userLogout = (userId) => {
  users = users.filter((u) => u.userId !== userId);
};

io.on("connection", (socket) => {
  console.log("Socket is connecting...");
  socket.on("addUser", (userId, userInfo) => {
    addUser(userId, socket.id, userInfo);
    io.emit("getUser", users);

    const us = users.filter((u) => u.userId !== userId);
    const con = "new_user_add";
    for (var i = 0; i < us.length; i++) {
      socket.to(us[i].socketId).emit("new_user_add", con);
    }
  });
  socket.on("sendMessage", (data) => {
    const user = findFriend(data.reseverId);

    if (user !== undefined) {
      socket.to(user.socketId).emit("getMessage", data);
    }
  });

  socket.on("messageSeen", (msg) => {
    const user = findFriend(msg.senderId);
    if (user !== undefined) {
      socket.to(user.socketId).emit("msgSeenResponse", msg);
    }
  });

  socket.on("delivaredMessage", (msg) => {
    const user = findFriend(msg.senderId);
    if (user !== undefined) {
      socket.to(user.socketId).emit("msgDelivaredResponse", msg);
    }
  });
  socket.on("seen", (data) => {
    const user = findFriend(data.senderId);
    if (user !== undefined) {
      socket.to(user.socketId).emit("seenSuccess", data);
    }
  });

  socket.on("typingMessage", (data) => {
    const user = findFriend(data.reseverId);
    if (user !== undefined) {
      socket.to(user.socketId).emit("typingMessageGet", {
        senderId: data.senderId,
        reseverId: data.reseverId,
        msg: data.msg,
      });
    }
  });

  socket.on("logout", (userId) => {
    userLogout(userId);
  });

  socket.on("disconnect", () => {
    console.log("user is disconnect... ");
    userRemove(socket.id);
    io.emit("getUser", users);
  });
});

httpServer.listen(process.env.PORT || 5000);
