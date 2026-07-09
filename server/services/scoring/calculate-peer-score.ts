/**
 * Normalize peer votes to a 0-100 scale.
 *
 * The highest-voted project gets 100. Others are proportional.
 * If no votes exist in the event, everyone gets 0.
 */
export function calculatePeerScore(
  projectVoteCount: number,
  maxVotesInEvent: number,
): number {
  if (maxVotesInEvent === 0 || projectVoteCount === 0) {
    return 0;
  }

  return Math.round((projectVoteCount / maxVotesInEvent) * 100 * 100) / 100;
}

/**
 * Determine the People's Choice project (highest vote count).
 * Returns the projectId with the most votes. Ties broken by first to reach count.
 */
export function determinePeoplesChoice(
  voteCounts: { projectId: number; count: number }[],
): number | null {
  if (!voteCounts || voteCounts.length === 0) {
    return null;
  }

  let maxCount = -1;
  let winnerId: number | null = null;

  for (const vc of voteCounts) {
    if (vc.count > maxCount) {
      maxCount = vc.count;
      winnerId = vc.projectId;
    }
  }

  return winnerId;
}
