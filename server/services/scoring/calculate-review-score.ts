/**
 * Calculate a single faculty review's weighted score from rubric criteria.
 *
 * Each criterion score (1-10) is weighted by its criterion weight percentage.
 * Returns a score out of 100.
 */
export function calculateReviewScore(
  criterionScores: { score: number; weightPercent: number }[],
): number {
  if (!criterionScores || criterionScores.length === 0) {
    return 0;
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const cs of criterionScores) {
    const weight = cs.weightPercent;
    totalWeight += weight;
    weightedSum += cs.score * weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  // Normalize to 100-point scale: (weightedSum / totalWeight) gives avg score 1-10,
  // multiply by 10 to get 0-100
  return Math.round((weightedSum / totalWeight) * 10 * 100) / 100;
}

/**
 * Calculate weighted contribution for each criterion score.
 */
export function calculateCriterionContribution(
  score: number,
  weightPercent: number,
): number {
  return Math.round(score * weightPercent * 10) / 100;
}
