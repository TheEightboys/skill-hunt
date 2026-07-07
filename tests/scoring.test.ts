import { describe, it, expect } from "vitest";
import { calculateReviewScore } from "../api/services/scoring/calculate-review-score";
import { calculateFacultyScore } from "../api/services/scoring/calculate-faculty-score";
import { calculatePeerScore, determinePeoplesChoice } from "../api/services/scoring/calculate-peer-score";
import { calculateFinalScore } from "../api/services/scoring/calculate-final-score";

describe("Scoring Engine", () => {
  describe("calculateReviewScore", () => {
    it("should calculate a perfect 100 score when all criteria scored 10", () => {
      const scores = [
        { score: 10, weightPercent: 20 },
        { score: 10, weightPercent: 25 },
        { score: 10, weightPercent: 20 },
        { score: 10, weightPercent: 15 },
        { score: 10, weightPercent: 10 },
        { score: 10, weightPercent: 10 },
      ];
      expect(calculateReviewScore(scores)).toBe(100);
    });

    it("should return 0 for empty input", () => {
      expect(calculateReviewScore([])).toBe(0);
    });

    it("should calculate a weighted score correctly", () => {
      const scores = [
        { score: 8, weightPercent: 20 },  // contribution: 8 * 20 = 160
        { score: 7, weightPercent: 25 },  // contribution: 7 * 25 = 175
        { score: 9, weightPercent: 20 },  // contribution: 9 * 20 = 180
        { score: 6, weightPercent: 15 },  // contribution: 6 * 15 = 90
        { score: 8, weightPercent: 10 },  // contribution: 8 * 10 = 80
        { score: 7, weightPercent: 10 },  // contribution: 7 * 10 = 70
      ];
      // Total weight = 100
      // Weighted sum = 160 + 175 + 180 + 90 + 80 + 70 = 755
      // Score = (755 / 100) * 10 = 75.5
      expect(calculateReviewScore(scores)).toBe(75.5);
    });
  });

  describe("calculateFacultyScore", () => {
    it("should return 0 for empty reviews", () => {
      expect(calculateFacultyScore([])).toBe(0);
    });

    it("should calculate unweighted average when no designation weights", () => {
      const reviews = [
        { reviewScore: 80, designation: "assistant_professor" },
        { reviewScore: 90, designation: "assistant_professor" },
      ];
      // With default weight of 3 for assistant_professor:
      // (80 * 3 + 90 * 3) / (3 + 3) = 510 / 6 = 85
      expect(calculateFacultyScore(reviews)).toBe(85);
    });

    it("should weight by designation correctly", () => {
      const reviews = [
        { reviewScore: 80, designation: "vice_chancellor" },  // weight 10
        { reviewScore: 90, designation: "assistant_professor" }, // weight 3
      ];
      // (80 * 10 + 90 * 3) / (10 + 3) = (800 + 270) / 13 = 1070 / 13 = 82.31
      expect(calculateFacultyScore(reviews)).toBeCloseTo(82.31, 1);
    });

    it("should use custom designation weight when provided", () => {
      const reviews = [
        { reviewScore: 80, designation: "custom", designationWeight: 5 },
        { reviewScore: 90, designation: "custom", designationWeight: 5 },
      ];
      expect(calculateFacultyScore(reviews)).toBe(85);
    });
  });

  describe("calculatePeerScore", () => {
    it("should give 100 to the project with max votes", () => {
      expect(calculatePeerScore(10, 10)).toBe(100);
    });

    it("should give 50 to a project with half the max votes", () => {
      expect(calculatePeerScore(5, 10)).toBe(50);
    });

    it("should return 0 when no votes in event", () => {
      expect(calculatePeerScore(5, 0)).toBe(0);
    });

    it("should return 0 when project has no votes", () => {
      expect(calculatePeerScore(0, 10)).toBe(0);
    });
  });

  describe("determinePeoplesChoice", () => {
    it("should return the project with most votes", () => {
      const votes = [
        { projectId: 1, count: 5 },
        { projectId: 2, count: 10 },
        { projectId: 3, count: 3 },
      ];
      expect(determinePeoplesChoice(votes)).toBe(2);
    });

    it("should return null for empty votes", () => {
      expect(determinePeoplesChoice([])).toBeNull();
    });
  });

  describe("calculateFinalScore", () => {
    it("should compute 85/15 split correctly", () => {
      // facultyScore 80, peerScore 100, default 85/15
      // 80 * 0.85 + 100 * 0.15 = 68 + 15 = 83
      expect(calculateFinalScore(80, 100, 85, 15)).toBe(83);
    });

    it("should handle 100% faculty weight", () => {
      expect(calculateFinalScore(75, 50, 100, 0)).toBe(75);
    });

    it("should handle 100% peer weight", () => {
      expect(calculateFinalScore(75, 50, 0, 100)).toBe(50);
    });

    it("should return 0 when both weights are 0", () => {
      expect(calculateFinalScore(75, 50, 0, 0)).toBe(0);
    });
  });
});
