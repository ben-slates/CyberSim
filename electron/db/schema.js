const TABLE_DEFINITIONS = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar_color TEXT NOT NULL DEFAULT '#00ff88',
      email_verified INTEGER NOT NULL DEFAULT 0,
      verification_token TEXT,
      verification_token_expires TEXT,
      created_at TEXT NOT NULL,
      last_login TEXT
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      scenario_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      max_score INTEGER NOT NULL,
      grade TEXT NOT NULL,
      decisions_json TEXT NOT NULL,
      time_taken INTEGER NOT NULL,
      hints_used INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS user_stats (
      user_id INTEGER PRIMARY KEY,
      total_score INTEGER NOT NULL DEFAULT 0,
      games_played INTEGER NOT NULL DEFAULT 0,
      avg_score REAL NOT NULL DEFAULT 0,
      best_score INTEGER NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0,
      last_played TEXT,
      badges_json TEXT NOT NULL DEFAULT '[]',
      skill_scores_json TEXT NOT NULL DEFAULT '{"phishing":0,"malware":0,"intrusion":0,"insider":0,"breach":0,"network":0}',
      total_time_played INTEGER NOT NULL DEFAULT 0,
      last_grade TEXT NOT NULL DEFAULT 'F',
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `
];

function initializeSchema(db) {
  const transaction = db.transaction(() => {
    TABLE_DEFINITIONS.forEach((statement) => {
      db.prepare(statement).run();
    });

    // Run migrations for existing databases
    runMigrations(db);
  });

  transaction();
}

function runMigrations(db) {
  // Check if users table exists and has the required columns
  try {
    const tableInfo = db.pragma("table_info(users)");
    const columnNames = tableInfo.map((col) => col.name);

    // Add email_verified column if it doesn't exist
    if (!columnNames.includes("email_verified")) {
      db.prepare(`ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 1`).run();
    }

    // Add verification_token column if it doesn't exist
    if (!columnNames.includes("verification_token")) {
      db.prepare(`ALTER TABLE users ADD COLUMN verification_token TEXT`).run();
    }

    // Add verification_token_expires column if it doesn't exist
    if (!columnNames.includes("verification_token_expires")) {
      db.prepare(`ALTER TABLE users ADD COLUMN verification_token_expires TEXT`).run();
    }

    // Mark all existing users as verified (migration: convert old users to verified)
    db.prepare(`UPDATE users SET email_verified = 1 WHERE email_verified = 0`).run();
  } catch (error) {
    // Table doesn't exist yet, that's fine - it will be created by TABLE_DEFINITIONS
    console.log("Migration note: users table being created fresh or migration skipped");
  }
}

module.exports = {
  initializeSchema
};
