export function useElectron() {
  if (!window.electronAPI) {
    throw new Error("Electron API bridge is not available.");
  }

  return window.electronAPI;
}
