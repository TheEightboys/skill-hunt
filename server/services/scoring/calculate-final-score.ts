/**
 * Calculate the final score from faculty and peer components.
 *
 * finalScore = facultyScore * (facultyWeight / 100) + peerScore * (peerWeight / 100)
 */
export function calculateFinalScore(
  facultyScore: number,
  peerScore: number,
  facultyWeightPercent: number,
  peerWeightPercent: number,
): number {
  const totalWeight = facultyWeightPercent + peerWeightPercent;
  if (totalWeight === 0) {
    return 0;
  }

  // Normalize weights if they don't sum to 100
  const normalizedFacultyWeight = facultyWeightPercent / totalWeight;
  const normalizedPeerWeight = peerWeightPercent / totalWeight;

  const finalScore =
    facultyScore * normalizedFacultyWeight + peerScore * normalizedPeerWeight;

  return Math.round(finalScore * 100) / 100;
}
