import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import Footer from "@/components/Footer";
import { ArrowLeft, Star, MessageSquare, BarChart3, AlertTriangle } from "lucide-react";

export default function ResultsPage() {
  const navigate = useNavigate();
  useAuth({ redirectOnUnauthenticated: true });
  const { data: activeEvent } = trpc.event.active.useQuery();
  const { data: results, isLoading } = trpc.leaderboard.myResults.useQuery(
    { eventId: activeEvent?.id ?? 0 },
    { enabled: !!activeEvent },
  );

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#0F2A4A] mb-2">My Results</h1>
        <p className="text-gray-600 mb-8">
          {activeEvent ? activeEvent.name : "Loading..."}
        </p>

        {isLoading ? (
          <Skeleton className="h-96" />
        ) : !results?.project ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-400 mb-2">No Project Found</h2>
              <p className="text-gray-500">You haven&apos;t submitted a project for this event.</p>
              <Button className="mt-4" onClick={() => navigate("/submit")}>
                Submit a Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#0F2A4A] text-white">
                <CardContent className="p-6">
                  <p className="text-sm text-gray-300 mb-1">Final Score</p>
                  <p className="text-4xl font-bold">
                    {results.snapshot?.finalScore ? parseFloat(results.snapshot.finalScore).toFixed(1) : "-"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">out of 100</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 mb-1">Faculty Score</p>
                  <p className="text-3xl font-bold text-[#0F2A4A]">
                    {results.snapshot?.facultyScore ? parseFloat(results.snapshot.facultyScore).toFixed(1) : "-"}
                  </p>
                  <p className="text-xs text-gray-400">Weighted by designation</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 mb-1">Peer Score</p>
                  <p className="text-3xl font-bold text-cyan-600">
                    {results.snapshot?.peerScore ? parseFloat(results.snapshot.peerScore).toFixed(1) : "-"}
                  </p>
                  <p className="text-xs text-gray-400">Normalized votes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 mb-1">Rank</p>
                  <p className="text-3xl font-bold text-[#F5A623]">
                    {results.snapshot?.rank ? `#${results.snapshot.rank}` : "Unranked"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {results.snapshot?.facultyReviewCount ?? 0} reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* People's Choice */}
            {results.snapshot?.hasPeoplesChoice && (
              <Card className="bg-gradient-to-r from-[#F5A623]/10 to-[#F5A623]/5 border-[#F5A623]/30">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#F5A623] flex items-center justify-center">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0F2A4A]">People&apos;s Choice Award!</h3>
                    <p className="text-gray-600">Your project received the most peer votes in this event.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Unranked Warning */}
            {!results.snapshot?.isRanked && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-6 flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800">Project Not Ranked</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Your project needs at least 3 faculty reviews to be ranked. Currently it has{" "}
                      {results.snapshot?.facultyReviewCount ?? 0} review(s).
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Criterion Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#22B8CF]" />
                    Criterion Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {results.reviews && results.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {/* Aggregate criterion scores */}
                      {(() => {
                        const criterionMap = new Map<string, { total: number; count: number }>();
                        for (const review of results.reviews) {
                          for (const score of review.scores) {
                            const name = score.criterion?.name ?? "Unknown";
                            const existing = criterionMap.get(name) ?? { total: 0, count: 0 };
                            existing.total += score.score;
                            existing.count += 1;
                            criterionMap.set(name, existing);
                          }
                        }
                        return Array.from(criterionMap.entries()).map(([name, data]) => {
                          const avg = data.count > 0 ? data.total / data.count : 0;
                          return (
                            <div key={name}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">{name}</span>
                                <span className="text-sm font-medium">{avg.toFixed(1)}/10</span>
                              </div>
                              <Progress value={avg * 10} className="h-2" />
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No reviews yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Faculty Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#F5A623]" />
                    Faculty Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.reviews && results.reviews.length > 0 ? (
                    results.reviews.map((review) => (
                      <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-[#0F2A4A] flex items-center justify-center">
                            <span className="text-xs text-white font-bold">
                              {review.faculty?.name?.charAt(0) ?? "F"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.faculty?.name ?? "Faculty"}</p>
                            <p className="text-xs text-gray-500">
                              {review.faculty?.facultyProfile?.designation?.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.overallComment}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {review.scores.map((score) => (
                            <Badge key={score.id} variant="outline" className="text-xs">
                              {score.criterion?.name}: {score.score}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No faculty feedback yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
