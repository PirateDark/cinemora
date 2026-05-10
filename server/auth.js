import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "../lib/db.js";
import { User } from "../lib/models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "cinemora-jwt-secret-2024";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "saadshaban1995@gmail.com";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const BASE_URL = process.env.BASE_URL || "https://cinemora-theta.vercel.app";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://cinemora-theta.vercel.app";

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function sanitizeUser(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
  };
}

router.post("/register", async (req, res) => {
  try {
    await connectDB();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "جميع الحقول مطلوبة" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: "البريد الإلكتروني مستخدم بالفعل" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const role = email === ADMIN_EMAIL ? "admin" : "user";

    const user = await User.create({ name, email, password: hashedPassword, role });
    const token = generateToken(user);

    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, error: "فشل في إنشاء الحساب" });
  }
});

router.post("/login", async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: "بريد إلكتروني أو كلمة مرور غير صحيحة" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, error: "بريد إلكتروني أو كلمة مرور غير صحيحة" });
    }

    const token = generateToken(user);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "فشل في تسجيل الدخول" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "غير مصرح" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: "المستخدم غير موجود" });
    }

    res.json({ success: true, user: sanitizeUser(user) });
  } catch {
    res.status(401).json({ success: false, error: "انتهت الجلسة" });
  }
});

router.get("/google", (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ success: false, error: "Google OAuth غير مضبوط" });
  }

  const redirectUri = `${BASE_URL}/api/auth/callback/google`;

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile`;

  res.redirect(url);
});

router.get("/callback/google", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }

    const redirectUri = `${BASE_URL}/api/auth/callback/google`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();

    await connectDB();

    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.email });
      if (user) {
        user.googleId = profile.id;
        if (!user.avatar) user.avatar = profile.picture;
        await user.save();
      } else {
        const role = profile.email === ADMIN_EMAIL ? "admin" : "user";
        user = await User.create({
          email: profile.email,
          name: profile.name,
          googleId: profile.id,
          avatar: profile.picture,
          role,
        });
      }
    }

    const token = generateToken(user);
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }
});

router.get("/discord", (req, res) => {
  if (!DISCORD_CLIENT_ID) {
    return res.status(500).json({ success: false, error: "Discord OAuth غير مضبوط" });
  }

  const redirectUri = `${BASE_URL}/api/auth/callback/discord`;
  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`;

  res.redirect(url);
});

router.get("/callback/discord", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${FRONTEND_URL}/login?error=discord_auth_failed`);
    }

    const redirectUri = `${BASE_URL}/api/auth/callback/discord`;
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      return res.redirect(`${FRONTEND_URL}/login?error=discord_auth_failed`);
    }

    const profileRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();

    await connectDB();

    const email = profile.email;
    if (!email) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_email`);
    }

    let user = await User.findOne({ discordId: profile.id });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.discordId = profile.id;
        if (!user.avatar) {
          const avatarHash = profile.avatar;
          user.avatar = avatarHash
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${avatarHash}.png`
            : undefined;
        }
        await user.save();
      } else {
        const role = email === ADMIN_EMAIL ? "admin" : "user";
        const avatarHash = profile.avatar;
        user = await User.create({
          email,
          name: profile.global_name || profile.username,
          discordId: profile.id,
          avatar: avatarHash
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${avatarHash}.png`
            : undefined,
          role,
        });
      }
    }

    const token = generateToken(user);
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("Discord callback error:", error);
    res.redirect(`${FRONTEND_URL}/login?error=discord_auth_failed`);
  }
});

export default router;
