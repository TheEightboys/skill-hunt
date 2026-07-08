import { DEFAULT_DESIGNATION_WEIGHTS } from "../../../contracts/constants.js";

/**
 * Represents a faculty review with its computed review score and designation weight.
 */
export interface FacultyReviewForScoring {
  reviewScore: number;
  designation: string;
  designationWeight?: number;
}

/**
 * Calculate the designation-weighted average of faculty review scores.
 *
 * Formula: sum(reviewScore * designationWeight) / sum(designationWeight)
 *
 * If a custom designationWeight is provided, it overrides the default lookup.
 */
export function calculateFacultyScore(
  reviews: FacultyReviewForScoring[],
): number {
  if (!reviews || reviews.length === 0) {
    return 0;
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const review of reviews) {
    const weight =
      review.designationWeight ??
      DEFAULT_DESIGNATION_WEIGHTS[review.designation] ??
      1;
    totalWeight += weight;
    weightedSum += review.reviewScore * weight;
  }

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round((weightedSum / totalWeight) * 100) / 100;
}
