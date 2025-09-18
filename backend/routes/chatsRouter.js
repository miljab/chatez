const express = require("express");
const router = express.Router();
const prisma = require("../client/prismaClient");
const authenticateToken = require("../middlewares/authenticateToken");

router.get("/chats", authenticateToken, async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: { id: req.user.id },
        },
      },
      omit: {
        owner: true,
      },
      include: {
        members: true,
      },
    });

    res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching chats" });
  }
});

router.post("/chats/new", authenticateToken, async (req, res) => {
  try {
    const users = req.body.users;

    const isGroup = users.length > 1;

    const members = users.map((user) => ({
      id: user.id,
    }));
    members.push({ id: req.user.id });

    console.log(members);

    if (!isGroup) {
      const existingChat = await prisma.chat.findFirst({
        where: {
          isGroup: false,
          AND: [
            {
              members: {
                some: {
                  id: members[0].id,
                },
              },
            },
            {
              members: {
                some: {
                  id: members[1].id,
                },
              },
            },
          ],
        },
      });

      if (existingChat) return res.status(200).json(existingChat);
    }

    const newChat = await prisma.chat.create({
      data: {
        isGroup: isGroup,
        ownerId: isGroup ? req.user.id : null,
        members: {
          connect: members,
        },
      },
    });

    res.status(200).json(newChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating chat" });
  }
});

router.get("/messages/:chatId", authenticateToken, async (req, res) => {
  try {
    const chatId = req.params.chatId;

    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        members: true,
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    } else {
      const membersId = chat.members.map((member) => member.id);

      if (!membersId.includes(req.user.id))
        return res.status(403).json({ message: "Access forbidden" });
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        author: true,
        chat: true,
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching messages" });
  }
});

router.post("/user", authenticateToken, async (req, res) => {
  try {
    const username = req.body.username;

    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(200);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error user search" });
  }
});

module.exports = router;
