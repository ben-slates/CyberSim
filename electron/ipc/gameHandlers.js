const { ipcMain } = require("electron");
const { getDatabase } = require("../db/database");
const { logAction, requireCurrentUserId } = require("./authHandlers");

const gradeRank = {
  S: 6,
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  F: 1
};

const scenarioCatalog = {
  "operation-spear": { title: "Operation Spear", category: "Phishing", difficulty: "Intermediate" },
  ransomstrike: { title: "RansomStrike", category: "Malware", difficulty: "Advanced" },
  "ghost-login": { title: "Ghost Login", category: "Intrusion", difficulty: "Intermediate" },
  sqlstorm: { title: "SQLStorm", category: "Breach", difficulty: "Advanced" },
  "the-mole": { title: "The Mole", category: "Insider", difficulty: "Advanced" },
  floodgate: { title: "FloodGate", category: "Network", difficulty: "Expert" },
  "trojan-update": { title: "Trojan Update", category: "Malware", difficulty: "Expert" },
  "day-zero": { title: "Day Zero", category: "Intrusion", difficulty: "Expert" }
};

const categoryScenarioMap = {
  phishing: ["operation-spear"],
  malware: ["ransomstrike", "trojan-update"],
  intrusion: ["ghost-login", "day-zero"],
  insider: ["the-mole"],
  breach: ["sqlstorm"],
  network: ["floodgate"]
};

function mergeSkillScores(current, incoming) {
  const merged = { ...current };
  Object.keys(merged).forEach((key) => {
    merged[key] = (merged[key] || 0) + (incoming[key] || 0);
  });
  return merged;
}

function awardBadges({ userId, sessionData, existingBadges, existingStats }) {
  const db = getDatabase();
  const earned = new Set(existingBadges);
  const sessions = db.prepare(`SELECT * FROM sessions WHERE user_id = ?`).all(userId);
  const completedIds = new Set(sessions.map((entry) => entry.scenario_id));
  const sessionsByScenario = sessions.reduce((acc, session) => {
    if (!acc[session.scenario_id]) {
      acc[session.scenario_id] = [];
    }
    acc[session.scenario_id].push(session);
    return acc;
  }, {});

  if (sessions.length >= 1) earned.add("first_blood");
  if (sessions.length >= 5) earned.add("iron_wall");
  if (sessions.length >= 20) earned.add("veteran");
  if (existingStats.streak >= 3) earned.add("streak_3");
  if (existingStats.streak >= 7) earned.add("streak_7");
  if ((sessionData.timeRemaining || 0) / sessionData.timeLimit > 0.8) earned.add("speed_demon");
  if (sessionData.score >= sessionData.maxScore) earned.add("perfect_score");
  if (sessionData.hintsUsed === 0) earned.add("no_hints");
  if (sessionData.timeRemaining < 30 && ["Advanced", "Expert"].includes(scenarioCatalog[sessionData.scenarioId]?.difficulty)) {
    earned.add("under_pressure");
  }

  if (sessionsByScenario["ghost-login"]?.some((session) => session.grade === "S")) {
    earned.add("ghost_buster");
  }

  if (sessionsByScenario["ransomstrike"]?.some((session) => ["S", "A"].includes(session.grade))) {
    earned.add("ransomware_stopper");
  }

  if (completedIds.has("the-mole")) earned.add("insider_catcher");

  if (categoryScenarioMap.phishing.every((id) => completedIds.has(id))) earned.add("phishing_expert");
  if (categoryScenarioMap.malware.every((id) => completedIds.has(id))) earned.add("malware_hunter");
  if (Object.keys(scenarioCatalog).every((id) => completedIds.has(id))) earned.add("clean_sweep");

  return Array.from(earned);
}

function getBestGrade(existingGrade, incomingGrade) {
  return gradeRank[incomingGrade] > gradeRank[existingGrade] ? incomingGrade : existingGrade;
}

function registerGameHandlers() {
  ipcMain.handle("game:submitSession", async (_event, payload) => {
    const userId = requireCurrentUserId();
    const db = getDatabase();
    const now = new Date().toISOString();

    const insertSession = db.prepare(
      `
        INSERT INTO sessions (
          user_id,
          scenario_id,
          score,
          max_score,
          grade,
          decisions_json,
          time_taken,
          hints_used,
          completed_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    );

    insertSession.run(
      userId,
      payload.scenarioId,
      payload.score,
      payload.maxScore,
      payload.grade,
      JSON.stringify(payload.decisions),
      payload.timeTaken,
      payload.hintsUsed,
      now
    );

    const stats = db.prepare(`SELECT * FROM user_stats WHERE user_id = ?`).get(userId);
    const parsedSkills = JSON.parse(stats.skill_scores_json);
    const mergedSkills = mergeSkillScores(parsedSkills, payload.skillXP || {});
    const gamesPlayed = stats.games_played + 1;
    const totalScore = stats.total_score + payload.score;
    const bestScore = Math.max(stats.best_score, payload.score);
    const avgScore = Number((totalScore / gamesPlayed).toFixed(2));
    const totalTimePlayed = stats.total_time_played + payload.timeTaken;
    const lastGrade = getBestGrade(stats.last_grade || "F", payload.grade);
    const currentBadges = JSON.parse(stats.badges_json || "[]");

    const updatedStats = {
      ...stats,
      games_played: gamesPlayed,
      total_score: totalScore,
      avg_score: avgScore,
      best_score: bestScore,
      last_played: now,
      total_time_played: totalTimePlayed,
      last_grade: lastGrade
    };

    const awardedBadges = awardBadges({
      userId,
      sessionData: payload,
      existingBadges: currentBadges,
      existingStats: updatedStats
    });

    db.prepare(
      `
        UPDATE user_stats
        SET total_score = ?,
            games_played = ?,
            avg_score = ?,
            best_score = ?,
            last_played = ?,
            badges_json = ?,
            skill_scores_json = ?,
            total_time_played = ?,
            last_grade = ?
        WHERE user_id = ?
      `
    ).run(
      totalScore,
      gamesPlayed,
      avgScore,
      bestScore,
      now,
      JSON.stringify(awardedBadges),
      JSON.stringify(mergedSkills),
      totalTimePlayed,
      lastGrade,
      userId
    );

    logAction(userId, "game.submitSession", {
      scenarioId: payload.scenarioId,
      score: payload.score,
      grade: payload.grade
    });

    return {
      success: true,
      badges: awardedBadges
    };
  });

  ipcMain.handle("game:getHistory", async () => {
    const userId = requireCurrentUserId();
    const db = getDatabase();
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

    return sessions.map((session) => ({
      id: session.id,
      scenarioId: session.scenario_id,
      scenarioTitle: scenarioCatalog[session.scenario_id]?.title || session.scenario_id,
      category: scenarioCatalog[session.scenario_id]?.category || "Unknown",
      difficulty: scenarioCatalog[session.scenario_id]?.difficulty || "Unknown",
      score: session.score,
      maxScore: session.max_score,
      grade: session.grade,
      decisions: JSON.parse(session.decisions_json),
      timeTaken: session.time_taken,
      hintsUsed: session.hints_used,
      completedAt: session.completed_at
    }));
  });

  ipcMain.handle("game:getUserStats", async () => {
    const userId = requireCurrentUserId();
    const db = getDatabase();
    const stats = db.prepare(`SELECT * FROM user_stats WHERE user_id = ?`).get(userId);
    const sessions = db
      .prepare(
        `
          SELECT scenario_id, score, max_score, grade, completed_at
          FROM sessions
          WHERE user_id = ?
          ORDER BY datetime(completed_at) ASC
        `
      )
      .all(userId);

    const winRate = sessions.length
      ? Number(
          ((sessions.filter((item) => ["S", "A", "B"].includes(item.grade)).length / sessions.length) * 100).toFixed(1)
        )
      : 0;

    return {
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
      winRate,
      history: sessions.map((session) => ({
        scenarioId: session.scenario_id,
        score: session.score,
        maxScore: session.max_score,
        grade: session.grade,
        completedAt: session.completed_at
      }))
    };
  });
}

module.exports = {
  registerGameHandlers,
  scenarioCatalog
};
