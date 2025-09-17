const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/authRouter");
const chatRouter = require("./routes/chatsRouter");
const prisma = require("./client/prismaClient");

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api", authRouter);
app.use("/api", chatRouter);

const chatRooms = new Map();

wss.on("connection", (ws) => {
  let currentChatId = null;

  ws.on("message", async (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "join") {
      currentChatId = data.chatId;
      if (!chatRooms.has(currentChatId)) {
        chatRooms.set(currentChatId, new Set());
      }

      chatRooms.get(currentChatId).add(ws);
    } else {
      try {
        const newMessage = await prisma.message.create({
          data: {
            text: data.text,
            chatId: data.chatId,
            authorId: data.authorId,
          },
          include: {
            author: true,
          },
        });

        if (chatRooms.has(newMessage.chatId)) {
          chatRooms.get(newMessage.chatId).forEach((client) => {
            if (client.readyState === ws.OPEN) {
              client.send(JSON.stringify(newMessage));
            }
          });
        }
      } catch (error) {
        console.error("Error saving or broadcasting message", error);
      }
    }
  });

  ws.on("close", () => {
    if (currentChatId && chatRooms.has(currentChatId)) {
      chatRooms.get(currentChatId).delete(ws);
      if (chatRooms.get(currentChatId).size === 0) {
        chatRooms.delete(currentChatId);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Express app listening on port ${PORT}!`)
);
