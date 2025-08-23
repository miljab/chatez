require("dotenv").config();
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../client/prismaClient");
const authenticateToken = require("../middlewares/authenticateToken");

router.post(
  "/signup",
  body("username")
    .isLength({ min: 5 })
    .withMessage("Username must be at least 5 characters long")
    .isLength({ max: 32 })
    .withMessage("Username cannot exceed 32 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores, and hyphens"
    )
    .custom(async (value) => {
      if (value) {
        const user = await prisma.user.findUnique({
          where: { username: value },
        });
        if (user) {
          return Promise.reject("Username is already taken");
        }
        return true;
      }
    }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isLength({ max: 64 })
    .withMessage("Password cannot exceed 64 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMap = {};
      errors.array().forEach((error) => {
        errorMap[error.path] = error.msg;
      });

      return res.status(400).json({ errors: errorMap });
    }
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });
      res.status(201).json({ message: "Account created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error during signup" });
    }
  }
);

router.post(
  "/login",
  body("username").isLength({ min: 1, max: 32 }),
  body("password").isLength({ min: 1, max: 64 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    try {
      const { username, password } = req.body;

      const user = await prisma.user.findUnique({
        omit: { password: false },
        where: { username },
      });

      if (!user) {
        return res.status(401).json({ message: "Wrong username or password" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Wrong username or password" });
      }

      const payload = {
        userId: user.id,
        username: user.username,
      };

      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
      });

      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
      });

      try {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await prisma.refreshToken.create({
          data: {
            userId: user.id,
            token: refreshToken,
            expiresAt: expiresAt,
          },
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });

        res.status(200).json({
          accessToken,
          user: {
            username,
            id: user.id,
            avatar: user.avatar,
            bio: user.bio,
            createdAt: user.createdAt,
          },
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating refresh token" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error logging in" });
    }
  }
);

router.get("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
        expiresAt: { gt: new Date() },
        revoked: false,
      },
    });

    if (!result) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await prisma.user.findUnique({
      where: { id: result.userId },
    });

    const payload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    res.status(200).json({
      accessToken,
      user: {
        username: user.username,
        id: user.id,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error refreshing token" });
  }
});

router.get("/logout", authenticateToken, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revoked: true },
    });

    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging out" });
  }
});

module.exports = router;
