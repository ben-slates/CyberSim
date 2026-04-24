import { create } from "zustand";

const getAPI = () => window.electronAPI;

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,
  pendingVerification: false,
  verificationUserId: null,
  
  bootstrap: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getAPI().getSession();
      set({ user: response.user, initialized: true, loading: false });
    } catch (error) {
      set({ error: error.message, initialized: true, loading: false });
    }
  },
  
  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const response = await getAPI().login(payload);
      set({ user: response.user, loading: false });
      return response.user;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const response = await getAPI().register(payload);
      if (response.pendingVerification) {
        set({
          pendingVerification: true,
          verificationUserId: response.userId,
          loading: false,
          error: null
        });
        return response;
      }
      set({ user: response.user, loading: false });
      return response.user;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  verifyEmail: async (token) => {
    set({ loading: true, error: null });
    try {
      const response = await getAPI().verifyEmail({ token });
      set({ pendingVerification: false, verificationUserId: null, loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  resendVerificationEmail: async (email) => {
    set({ loading: true, error: null });
    try {
      const response = await getAPI().resendVerificationEmail({ email });
      set({ loading: false, error: null });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  logout: async () => {
    await getAPI().logout();
    set({ user: null, error: null, pendingVerification: false, verificationUserId: null });
  }
}));
