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
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      omit: { password: false },
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
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
        user: { username, id: user.id },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating refresh token" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging in" });
  }
});

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
      user: { username: user.username, id: user.id },
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
