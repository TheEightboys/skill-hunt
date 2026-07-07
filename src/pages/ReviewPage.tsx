import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, GitBranch, ExternalLink, Star, Send, Save } from "lucide-react";

export default function ReviewPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const pid = parseInt(projectId ?? "0");
  useAuth({ redirectOnUnauthenticated: true });

  const { data: project, isLoading: projectLoading } = trpc.project.byId.useQuery({ id: pid });
  const { data: rubric } = trpc.review.getRubric.useQuery(
    { eventId: project?.eventId ?? 0 },
    { enabled: !!project },
  );
  const [criterionScores, setCriterionScores] = useState<Record<number, number>>({});
  const [overallComment, setOverallComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reviewMutation = trpc.review.submit.useMutation({
    onSuccess: () => {
      navigate("/faculty");
    },
  });

  const handleScoreChange = (criterionId: number, score: number) => {
    setCriterionScores((prev) => ({ ...prev, [criterionId]: score }));
  };

  const calculateWeightedScore = () => {
    if (!rubric) return 0;
    let total = 0;
    let weightSum = 0;
    for (const criterion of rubric) {
      const score = criterionScores[criterion.id] ?? 5;
      const weight = parseFloat(criterion.weightPercent);
      total += score * weight;
      weightSum += weight;
    }
    return weightSum > 0 ? (total / weightSum) * 10 : 0;
  };

  const handleSubmit = (status: "draft" | "submitted") => {
    if (!rubric || !project) return;
    const newErrors: Record<string, string> = {};

    if (status === "submitted" && overallComment.length < 30) {
      newErrors.comment = "Overall comment must be at least 30 characters";
    }

    const scores = rubric.map((c) => ({
      criterionId: c.id,
      score: criterionScores[c.id] ?? 5,
      weightPercent: parseFloat(c.weightPercent),
    }));

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    reviewMutation.mutate({
      eventId: project.eventId,
      projectId: pid,
      status,
      overallComment: overallComment || "Review in progress...",
      criterionScores: scores,
    });
  };

  const weightedScore = calculateWeightedScore();

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/faculty")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Queue
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projectLoading ? (
          <Skeleton className="h-96" />
        ) : !project ? (
          <div className="text-center py-20 text-gray-400">Project not found</div>
        ) : (
          <>
            {/* Project Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#0F2A4A] mb-3">{project.title}</h1>
              <p className="text-gray-600 mb-4">{project.abstract}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">{project.category}</Badge>
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    <GitBranch className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {project.previewUrl && (
                  <a href={project.previewUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Rubric Evaluation */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#F5A623]" />
                      Rubric Evaluation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {rubric?.map((criterion) => (
                      <div key={criterion.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-semibold">{criterion.name}</Label>
                            <p className="text-xs text-gray-500">{criterion.description}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{criterion.weightPercent}%</Badge>
                            <span className="text-2xl font-bold text-[#0F2A4A] w-8 text-center">
                              {criterionScores[criterion.id] ?? 5}
                            </span>
                          </div>
                        </div>
                        <Slider
                          value={[criterionScores[criterion.id] ?? 5]}
                          onValueChange={([v]) => handleScoreChange(criterion.id, v)}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Poor (1)</span>
                          <span>Excellent (10)</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Overall Comment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={overallComment}
                      onChange={(e) => setOverallComment(e.target.value)}
                      placeholder="Provide your overall assessment of this project (minimum 30 characters)..."
                      rows={5}
                      className={errors.comment ? "border-red-500" : ""}
                    />
                    <div className="flex items-center justify-between mt-2">
                      {errors.comment && <p className="text-xs text-red-500">{errors.comment}</p>}
                      <p className="text-xs text-gray-400 ml-auto">
                        {overallComment.length} / 30 min
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Score Summary */}
              <div className="space-y-6">
                <Card className="bg-[#0F2A4A] text-white">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-300 mb-2">Weighted Review Score</p>
                    <p className="text-5xl font-bold">{weightedScore.toFixed(1)}</p>
                    <p className="text-sm text-gray-300 mt-1">out of 100</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Score Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {rubric?.map((criterion) => {
                      const score = criterionScores[criterion.id] ?? 5;
                      const weight = parseFloat(criterion.weightPercent);
                      const contribution = (score * weight) / 10;
                      return (
                        <div key={criterion.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate flex-1">{criterion.name}</span>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="font-medium">{score}/10</span>
                            <span className="text-xs text-gray-400">({contribution.toFixed(1)})</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    className="w-full bg-[#2F9E44] hover:bg-[#258c3a] gap-2"
                    onClick={() => handleSubmit("submitted")}
                    disabled={reviewMutation.isPending}
                  >
                    <Send className="w-4 h-4" />
                    Submit Final Review
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleSubmit("draft")}
                    disabled={reviewMutation.isPending}
                  >
                    <Save className="w-4 h-4" />
                    Save as Draft
                  </Button>
                </div>

                {reviewMutation.error && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {reviewMutation.error.message}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
