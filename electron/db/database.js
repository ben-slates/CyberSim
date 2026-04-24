const path = require("path");
const { app } = require("electron");
const Database = require("better-sqlite3");
const { initializeSchema } = require("./schema");

let database;

function getDatabasePath() {
  return path.join(app.getPath("userData"), "cybersim.db");
}

function initializeDatabase() {
  if (database) {
    return database;
  }

  const dbPath = getDatabasePath();
  database = new Database(dbPath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  initializeSchema(database);

  return database;
}

function getDatabase() {
  if (!database) {
    return initializeDatabase();
  }

  return database;
}

module.exports = {
  getDatabase,
  getDatabasePath,
  initializeDatabase
};
