const gradeThresholds = [
  { grade: "S", min: 90 },
  { grade: "A", min: 80 },
  { grade: "B", min: 70 },
  { grade: "C", min: 60 },
  { grade: "D", min: 50 },
  { grade: "F", min: 0 }
];

export function gradeFromPercentage(percentage) {
  return gradeThresholds.find((entry) => percentage >= entry.min)?.grade || "F";
}

export function calculateScore({
  baseScore,
  maxScore,
  timeRemaining,
  timeLimit,
  decisions,
  hintsUsed
}) {
  const timeBonus = timeRemaining > timeLimit / 2 ? 100 : 0;
  const optimalCount = decisions.filter((decision) => decision.wasOptimal).length;
  const streakBonus = optimalCount >= 3 ? Math.floor(baseScore * 0.1) : 0;
  const hintPenalty = hintsUsed * 50;
  const final = Math.max(0, Math.min(maxScore, baseScore + timeBonus + streakBonus - hintPenalty));
  const percentage = maxScore > 0 ? (final / maxScore) * 100 : 0;
  const grade = gradeFromPercentage(percentage);

  return {
    final,
    grade,
    timeBonus,
    streakBonus,
    hintPenalty,
    percentage,
    breakdown: {
      baseScore,
      timeBonus,
      streakBonus,
      hintPenalty,
      optimalCount
    }
  };
}
