const { ipcMain } = require("electron");
const { getDatabase } = require("../db/database");
const { logAction, requireCurrentUserId } = require("./authHandlers");
const { scenarioCatalog } = require("./gameHandlers");

function registerUserHandlers() {
  ipcMain.handle("user:getProfile", async () => {
    const userId = requireCurrentUserId();
    const db = getDatabase();
    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);
    const stats = db.prepare(`SELECT * FROM user_stats WHERE user_id = ?`).get(userId);
    const sessions = db
      .prepare(
        `
          SELECT *
          FROM sessions
          WHERE user_id = ?
          ORDER BY datetime(completed_at) DESC
          LIMIT 50
        `
      )
      .all(userId);

    const categories = sessions.reduce((acc, session) => {
      const category = scenarioCatalog[session.scenario_id]?.category || "Unknown";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const favoriteCategory =
      Object.entries(categories).sort((left, right) => right[1] - left[1])[0]?.[0] || "None Yet";

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarColor: user.avatar_color,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      stats: {
        totalScore: stats.total_score,
        gamesPlayed: stats.games_played,
        avgScore: stats.avg_score,
        bestScore: stats.best_score,
        streak: stats.streak,
        lastPlayed: stats.last_played,
        badges: JSON.parse(stats.badges_json || "[]"),
        skillScores: JSON.parse(stats.skill_scores_json),
        totalTimePlayed: stats.total_time_played,
        bestGrade: stats.last_grade,
        favoriteCategory
      },
      history: sessions.map((session) => ({
        id: session.id,
        scenarioId: session.scenario_id,
        scenarioTitle: scenarioCatalog[session.scenario_id]?.title || session.scenario_id,
        score: session.score,
        maxScore: session.max_score,
        grade: session.grade,
        timeTaken: session.time_taken,
        hintsUsed: session.hints_used,
        completedAt: session.completed_at
      }))
    };
  });

  ipcMain.handle("user:updateAvatar", async (_event, color) => {
    const userId = requireCurrentUserId();
    const db = getDatabase();
    db.prepare(`UPDATE users SET avatar_color = ? WHERE id = ?`).run(color, userId);
    logAction(userId, "user.updateAvatar", { color });

    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId);

    return {
      avatarColor: user.avatar_color
    };
  });
}

module.exports = {
  registerUserHandlers
};
