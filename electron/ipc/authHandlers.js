const crypto = require("crypto");
const { ipcMain } = require("electron");
const { getDatabase } = require("../db/database");
const { sendVerificationEmail } = require("../services/emailService");

let currentUserId = null;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [salt, original] = storedHash.split(":");
  const candidate = crypto.scryptSync(password, salt, 64);
  const originalBuffer = Buffer.from(original, "hex");

  if (candidate.length !== originalBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidate, originalBuffer);
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarColor: user.avatar_color,
    createdAt: user.created_at,
    lastLogin: user.last_login
  };
}

function logAction(userId, action, details) {
  const db = getDatabase();
  db.prepare(
    `INSERT INTO logs (user_id, action, details, timestamp) VALUES (?, ?, ?, ?)`
  ).run(userId, action, details ? JSON.stringify(details) : null, new Date().toISOString());
}

function calculateLoginStreak(lastLoginISO, existingStreak) {
  if (!lastLoginISO) {
    return 1;
  }

  const current = new Date();
  const last = new Date(lastLoginISO);
  const oneDayMs = 24 * 60 * 60 * 1000;
  const currentDate = new Date(current.getFullYear(), current.getMonth(), current.getDate()).getTime();
  const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
  const diffDays = Math.floor((currentDate - lastDate) / oneDayMs);

  if (diffDays <= 0) {
    return existingStreak || 1;
  }

  if (diffDays === 1) {
    return (existingStreak || 0) + 1;
  }

  return 1;
}

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function registerAuthHandlers() {
  ipcMain.handle("auth:register", async (_event, payload) => {
    const db = getDatabase();
    const { username, email, password } = payload;
    const existing = db
      .prepare(`SELECT id FROM users WHERE username = ? OR email = ?`)
      .get(username.trim(), email.trim().toLowerCase());

    if (existing) {
      throw new Error("A user with that username or email already exists.");
    }

    const now = new Date().toISOString();
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

    const result = db
      .prepare(
        `
          INSERT INTO users (username, email, password_hash, avatar_color, email_verified, verification_token, verification_token_expires, created_at, last_login)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        username.trim(),
        email.trim().toLowerCase(),
        hashPassword(password),
        "#00ff88",
        0,
        verificationCode,
        codeExpires,
        now,
        now
      );

    db.prepare(
      `
        INSERT INTO user_stats (
          user_id,
          total_score,
          games_played,
          avg_score,
          best_score,
          streak,
          last_played,
          badges_json,
          skill_scores_json,
          total_time_played,
          last_grade
        )
        VALUES (?, 0, 0, 0, 0, 1, NULL, '[]', '{"phishing":0,"malware":0,"intrusion":0,"insider":0,"breach":0,"network":0}', 0, 'F')
      `
    ).run(result.lastInsertRowid);

    // Send verification email with 6-digit code
    try {
      await sendVerificationEmail(email.trim().toLowerCase(), username.trim(), verificationCode);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Still allow registration but log the error
    }

    logAction(result.lastInsertRowid, "auth.register", { username, email });

    return {
      success: true,
      pendingVerification: true,
      message: "Account created! Please check your email for the 6-digit verification code.",
      userId: result.lastInsertRowid
    };
  });

  ipcMain.handle("auth:login", async (_event, payload) => {
    const db = getDatabase();
    const identity = payload.identity.trim();
    const user = db
      .prepare(`SELECT * FROM users WHERE username = ? OR email = ?`)
      .get(identity, identity.toLowerCase());

    if (!user || !verifyPassword(payload.password, user.password_hash)) {
      throw new Error("Invalid credentials.");
    }

    if (!user.email_verified) {
      throw new Error("Please verify your email address before logging in. Check your inbox for the verification link.");
    }

    const stats = db.prepare(`SELECT streak FROM user_stats WHERE user_id = ?`).get(user.id);
    const nextStreak = calculateLoginStreak(user.last_login, stats?.streak ?? 0);
    const now = new Date().toISOString();

    db.prepare(`UPDATE users SET last_login = ? WHERE id = ?`).run(now, user.id);
    db.prepare(`UPDATE user_stats SET streak = ? WHERE user_id = ?`).run(nextStreak, user.id);

    currentUserId = user.id;
    logAction(currentUserId, "auth.login", { identity });

    return {
      user: normalizeUser({
        ...user,
        last_login: now
      })
    };
  });

  ipcMain.handle("auth:getSession", async () => {
    if (!currentUserId) {
      return { user: null };
    }

    const db = getDatabase();
    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(currentUserId);

    return {
      user: normalizeUser(user)
    };
  });

  ipcMain.handle("auth:logout", async () => {
    if (currentUserId) {
      logAction(currentUserId, "auth.logout");
    }

    currentUserId = null;
    return { success: true };
  });

  ipcMain.handle("auth:verifyEmail", async (_event, payload) => {
    const db = getDatabase();
    const { code } = payload;

    const user = db
      .prepare(`SELECT * FROM users WHERE verification_token = ?`)
      .get(code);

    if (!user) {
      throw new Error("Invalid verification code.");
    }

    if (user.email_verified) {
      return { success: true, message: "Email already verified." };
    }

    const now = new Date().toISOString();
    if (new Date(user.verification_token_expires) < new Date(now)) {
      throw new Error("Verification code has expired. Please register again or request a new code.");
    }

    db.prepare(`UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = ?`)
      .run(user.id);

    logAction(user.id, "auth.emailVerified", { email: user.email });

    return { success: true, message: "Email verified successfully! You can now log in." };
  });

  ipcMain.handle("auth:resendVerificationEmail", async (_event, payload) => {
    const db = getDatabase();
    const { email } = payload;

    const user = db
      .prepare(`SELECT * FROM users WHERE email = ?`)
      .get(email.trim().toLowerCase());

    if (!user) {
      throw new Error("User not found with this email.");
    }

    if (user.email_verified) {
      throw new Error("This email is already verified.");
    }

    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    db.prepare(`UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?`)
      .run(verificationCode, codeExpires, user.id);

    try {
      await sendVerificationEmail(user.email, user.username, verificationCode);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      throw new Error("Failed to send verification email. Please try again.");
    }

    logAction(user.id, "auth.resendVerification", { email: user.email });

    return { success: true, message: "Verification code sent! Check your inbox." };
  });
}

function getCurrentUserId() {
  return currentUserId;
}

function requireCurrentUserId() {
  if (!currentUserId) {
    throw new Error("You must be logged in to perform this action.");
  }

  return currentUserId;
}

module.exports = {
  getCurrentUserId,
  logAction,
  registerAuthHandlers,
  requireCurrentUserId
};
