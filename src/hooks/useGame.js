import { useCallback, useMemo } from "react";
import { useGameStore, initialSkillXP } from "@/store/gameStore";
import { useUserStore } from "@/store/userStore";
import { scenariosById } from "@/data/scenarios";
import { calculateScore } from "@/utils/scoring";

function cloneSkillXP() {
  return { ...initialSkillXP };
}

export function useGame() {
  const {
    scenario,
    stageIndex,
    score,
    threatLevel,
    decisions,
    hintsUsed,
    currentHint,
    timeRemaining,
    startedAt,
    completedResult,
    skillXP,
    setScenarioState,
    updateGameState,
    resetGame
  } = useGameStore();

  const loadStats = useUserStore((state) => state.loadStats);
  const loadHistory = useUserStore((state) => state.loadHistory);
  const loadProfile = useUserStore((state) => state.loadProfile);

  const currentStage = scenario?.stages?.[stageIndex] || null;

  const startScenario = useCallback((scenarioId) => {
    const selected = scenariosById[scenarioId];
    if (!selected) {
      throw new Error("Scenario not found.");
    }

    setScenarioState({
      scenario: selected,
      stageIndex: 0,
      score: 0,
      threatLevel: 1,
      decisions: [],
      hintsUsed: 0,
      currentHint: null,
      timeRemaining: selected.timeLimit,
      startedAt: Date.now(),
      completedResult: null,
      skillXP: cloneSkillXP()
    });

    return selected;
  }, [setScenarioState]);

  const calculateFinalResult = useCallback(
    ({ endType = "success", endingCopy } = {}) => {
      if (!scenario) {
        return null;
      }

      const scoreSummary = calculateScore({
        baseScore: score,
        maxScore: scenario.maxScore,
        timeRemaining,
        timeLimit: scenario.timeLimit,
        decisions,
        hintsUsed
      });

      const timeTaken = Math.max(0, scenario.timeLimit - timeRemaining);

      return {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        score: scoreSummary.final,
        maxScore: scenario.maxScore,
        grade: scoreSummary.grade,
        percentage: scoreSummary.percentage,
        timeRemaining,
        timeTaken,
        hintsUsed,
        decisions,
        skillXP,
        breakdown: scoreSummary.breakdown,
        ending: endingCopy || scenario.endStates[endType] || scenario.endStates.partial
      };
    },
    [decisions, hintsUsed, scenario, score, skillXP, timeRemaining]
  );

  const endGame = useCallback(
    async (endType = "success", endingCopy) => {
      if (!scenario) {
        return null;
      }

      const result = calculateFinalResult({ endType, endingCopy });
      await window.electronAPI.submitSession({
        scenarioId: scenario.id,
        score: result.score,
        maxScore: result.maxScore,
        grade: result.grade,
        decisions: result.decisions,
        timeTaken: result.timeTaken,
        hintsUsed: result.hintsUsed,
        timeRemaining: result.timeRemaining,
        timeLimit: scenario.timeLimit,
        skillXP: result.skillXP
      });

      updateGameState({ completedResult: result });
      await Promise.all([loadStats(), loadHistory(), loadProfile()]);
      return result;
    },
    [calculateFinalResult, loadHistory, loadProfile, loadStats, scenario, updateGameState]
  );

  const makeDecision = useCallback(
    async (stageId, choiceId) => {
      if (!scenario) {
        return null;
      }

      const stage = scenario.stages.find((entry) => entry.id === stageId);
      const choice = stage?.choices.find((entry) => entry.id === choiceId);
      if (!stage || !choice) {
        throw new Error("Decision path not found.");
      }

      const nextScore = Math.max(0, score + choice.outcome.scoreChange);
      const nextTime = Math.max(0, timeRemaining + (choice.outcome.timeBonus || 0));
      const nextThreat = Math.max(1, Math.min(5, threatLevel + (choice.outcome.threatLevelChange || 0)));
      const nextSkillXP = { ...skillXP };
      Object.keys(nextSkillXP).forEach((key) => {
        nextSkillXP[key] = (nextSkillXP[key] || 0) + (choice.outcome.skillXP?.[key] || 0);
      });

      const decision = {
        stageId,
        stageTitle: stage.title,
        choiceId,
        choiceLabel: choice.label,
        wasOptimal: choice.isOptimal,
        scoreDelta: choice.outcome.scoreChange,
        outcome: choice.outcome,
        optimalChoice: stage.choices.find((entry) => entry.isOptimal)?.label || "N/A"
      };

      const nextStageIndex = scenario.stages.findIndex((entry) => entry.id === choice.outcome.nextStage);
      updateGameState({
        decisions: [...decisions, decision],
        score: nextScore,
        timeRemaining: nextTime,
        threatLevel: nextThreat,
        skillXP: nextSkillXP
      });

      if (!choice.outcome.nextStage || choice.outcome.nextStage.startsWith("end_")) {
        return endGame(choice.outcome.nextStage?.replace("end_", "") || "partial", choice.outcome.endState);
      }

      updateGameState({
        stageIndex: nextStageIndex === -1 ? stageIndex + 1 : nextStageIndex
      });

      return {
        decision,
        nextStageId: choice.outcome.nextStage
      };
    },
    [decisions, endGame, scenario, score, skillXP, stageIndex, threatLevel, timeRemaining, updateGameState]
  );

  const useHint = useCallback(() => {
    if (!scenario || hintsUsed >= 3) {
      return null;
    }

    const hint = scenario.hints[hintsUsed] || "Escalate early when evidence crosses trust boundaries.";
    updateGameState({
      hintsUsed: hintsUsed + 1,
      currentHint: hint,
      score: Math.max(0, score - 50)
    });
    return hint;
  }, [hintsUsed, scenario, score, updateGameState]);

  const tick = useCallback(async () => {
    if (!scenario) {
      return;
    }

    if (timeRemaining <= 1) {
      updateGameState({ timeRemaining: 0 });
      await endGame("failure");
      return;
    }

    updateGameState({ timeRemaining: timeRemaining - 1 });
  }, [endGame, scenario, timeRemaining, updateGameState]);

  return useMemo(
    () => ({
      scenario,
      currentStage,
      stageIndex,
      score,
      threatLevel,
      decisions,
      hintsUsed,
      currentHint,
      timeRemaining,
      startedAt,
      completedResult,
      skillXP,
      startScenario,
      makeDecision,
      useHint,
      endGame,
      calculateFinalResult,
      resetGame,
      tick
    }),
    [
      calculateFinalResult,
      completedResult,
      currentHint,
      currentStage,
      decisions,
      endGame,
      hintsUsed,
      makeDecision,
      resetGame,
      scenario,
      score,
      skillXP,
      stageIndex,
      startScenario,
      startedAt,
      threatLevel,
      tick,
      timeRemaining,
      useHint
    ]
  );
}
