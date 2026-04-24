import { create } from "zustand";

const api = () => window.electronAPI;

export const useUserStore = create((set, get) => ({
  profile: null,
  stats: null,
  history: [],
  leaderboard: [],
  scenarioLeaderboard: null,
  loading: false,
  error: null,
  loadStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await api().getUserStats();
      set({ stats, loading: false });
      return stats;
    } catch (error) {
      set({ error: error.message, loading: false });
      return get().stats;
    }
  },
  loadProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await api().getProfile();
      set({ profile, history: profile.history, loading: false });
      return profile;
    } catch (error) {
      set({ error: error.message, loading: false });
      return null;
    }
  },
  loadHistory: async () => {
    set({ loading: true, error: null });
    try {
      const history = await api().getHistory();
      set({ history, loading: false });
      return history;
    } catch (error) {
      set({ error: error.message, loading: false });
      return [];
    }
  },
  updateAvatar: async (color) => {
    const result = await api().updateAvatar(color);
    set((state) => ({
      profile: state.profile
        ? {
            ...state.profile,
            avatarColor: result.avatarColor
          }
        : state.profile
    }));
  },
  loadLeaderboard: async () => {
    set({ loading: true, error: null });
    try {
      const leaderboard = await api().getLeaderboard();
      set({ leaderboard, loading: false });
      return leaderboard;
    } catch (error) {
      set({ error: error.message, loading: false });
      return [];
    }
  },
  loadScenarioLeaderboard: async (scenarioId) => {
    set({ loading: true, error: null });
    try {
      const scenarioLeaderboard = await api().getScenarioLeaderboard(scenarioId);
      set({ scenarioLeaderboard, loading: false });
      return scenarioLeaderboard;
    } catch (error) {
      set({ error: error.message, loading: false });
      return null;
    }
  }
}));
