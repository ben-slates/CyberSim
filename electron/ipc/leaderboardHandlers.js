const { ipcMain } = require("electron");
const { getDatabase } = require("../db/database");
const { getCurrentUserId } = require("./authHandlers");
const { scenarioCatalog } = require("./gameHandlers");

function mapLeaderboardRows(rows, currentUserId) {
  return rows.map((row, index) => ({
    rank: index + 1,
    userId: row.user_id,
    username: row.username,
    avatarColor: row.avatar_color,
    score: row.score,
    grade: row.grade,
    gamesPlayed: row.games_played,
    isCurrentUser: row.user_id === currentUserId
  }));
}

function registerLeaderboardHandlers() {
  ipcMain.handle("leaderboard:getAll", async () => {
    const db = getDatabase();
    const currentUserId = getCurrentUserId();
    const rows = db
      .prepare(
        `
          SELECT
            users.id AS user_id,
            users.username,
            users.avatar_color,
            user_stats.total_score AS score,
            user_stats.last_grade AS grade,
            user_stats.games_played
          FROM users
          INNER JOIN user_stats ON user_stats.user_id = users.id
          WHERE user_stats.games_played > 0
          ORDER BY user_stats.total_score DESC, user_stats.best_score DESC, users.username ASC
          LIMIT 100
        `
      )
      .all();

    return mapLeaderboardRows(rows, currentUserId);
  });

  ipcMain.handle("leaderboard:getByScenario", async (_event, scenarioId) => {
    const db = getDatabase();
    const currentUserId = getCurrentUserId();
    const rows = db
      .prepare(
        `
          SELECT
            sessions.user_id,
            users.username,
            users.avatar_color,
            MAX(sessions.score) AS score,
            (
              SELECT s2.grade
              FROM sessions s2
              WHERE s2.user_id = sessions.user_id AND s2.scenario_id = sessions.scenario_id
              ORDER BY s2.score DESC, datetime(s2.completed_at) DESC
              LIMIT 1
            ) AS grade,
            COUNT(*) AS games_played
          FROM sessions
          INNER JOIN users ON users.id = sessions.user_id
          WHERE sessions.scenario_id = ?
          GROUP BY sessions.user_id, sessions.scenario_id
          ORDER BY score DESC, games_played ASC, users.username ASC
          LIMIT 100
        `
      )
      .all(scenarioId);

    return {
      scenarioId,
      scenarioTitle: scenarioCatalog[scenarioId]?.title || scenarioId,
      entries: mapLeaderboardRows(rows, currentUserId)
    };
  });
}

module.exports = {
  registerLeaderboardHandlers
};
