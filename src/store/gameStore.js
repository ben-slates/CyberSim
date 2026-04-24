import { create } from "zustand";

export const initialSkillXP = {
  phishing: 0,
  malware: 0,
  intrusion: 0,
  insider: 0,
  breach: 0,
  network: 0
};

export const useGameStore = create((set) => ({
  scenario: null,
  stageIndex: 0,
  score: 0,
  threatLevel: 1,
  decisions: [],
  hintsUsed: 0,
  currentHint: null,
  timeRemaining: 0,
  startedAt: null,
  completedResult: null,
  skillXP: { ...initialSkillXP },
  setScenarioState: (payload) => set(payload),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  appendDecision: (decision) =>
    set((state) => ({
      decisions: [...state.decisions, decision]
    })),
  updateGameState: (partial) => set(partial),
  resetGame: () =>
    set({
      scenario: null,
      stageIndex: 0,
      score: 0,
      threatLevel: 1,
      decisions: [],
      hintsUsed: 0,
      currentHint: null,
      timeRemaining: 0,
      startedAt: null,
      completedResult: null,
      skillXP: { ...initialSkillXP }
    })
}));
