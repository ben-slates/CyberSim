const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  register: (data) => ipcRenderer.invoke("auth:register", data),
  login: (data) => ipcRenderer.invoke("auth:login", data),
  getSession: () => ipcRenderer.invoke("auth:getSession"),
  logout: () => ipcRenderer.invoke("auth:logout"),
  verifyEmail: (data) => ipcRenderer.invoke("auth:verifyEmail", data),
  resendVerificationEmail: (data) => ipcRenderer.invoke("auth:resendVerificationEmail", data),

  submitSession: (data) => ipcRenderer.invoke("game:submitSession", data),
  getHistory: () => ipcRenderer.invoke("game:getHistory"),
  getUserStats: () => ipcRenderer.invoke("game:getUserStats"),

  getProfile: () => ipcRenderer.invoke("user:getProfile"),
  updateAvatar: (color) => ipcRenderer.invoke("user:updateAvatar", color),

  getLeaderboard: () => ipcRenderer.invoke("leaderboard:getAll"),
  getScenarioLeaderboard: (id) => ipcRenderer.invoke("leaderboard:getByScenario", id),

  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window:maximize"),
  closeWindow: () => ipcRenderer.invoke("window:close"),

  getAppVersion: () => ipcRenderer.invoke("app:getVersion")
});
