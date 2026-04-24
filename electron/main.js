const path = require("path");
const { app, BrowserWindow, ipcMain, screen } = require("electron");
const { initializeDatabase } = require("./db/database");
const { registerAuthHandlers } = require("./ipc/authHandlers");
const { registerGameHandlers } = require("./ipc/gameHandlers");
const { registerUserHandlers } = require("./ipc/userHandlers");
const { registerLeaderboardHandlers } = require("./ipc/leaderboardHandlers");

let mainWindow;
let isDev;

function getIconPath() {
  const iconName = process.platform === "win32" ? "icon.ico" : "icon.png";
  return path.join(__dirname, "..", "public", iconName);
}

function registerWindowHandlers() {
  ipcMain.handle("window:minimize", async () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
    return true;
  });

  ipcMain.handle("window:maximize", async () => {
    if (!mainWindow) {
      return false;
    }

    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }

    return true;
  });

  ipcMain.handle("window:close", async () => {
    if (mainWindow) {
      mainWindow.close();
    }
    return true;
  });

  ipcMain.handle("app:getVersion", async () => app.getVersion());
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    backgroundColor: "#0a0e0f",
    icon: getIconPath(),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

const hasLock = app.requestSingleInstanceLock();

(async () => {
  isDev = (await import("electron-is-dev")).default;

  if (!hasLock) {
    app.quit();
  } else {
    app.on("second-instance", () => {
      if (!mainWindow) {
        return;
      }

      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }

      mainWindow.focus();
    });

    app.whenReady().then(() => {
      initializeDatabase();
      registerAuthHandlers();
      registerGameHandlers();
      registerUserHandlers();
      registerLeaderboardHandlers();
      registerWindowHandlers();
      createWindow();

      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
        }
      });
    });
  }

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
})();
