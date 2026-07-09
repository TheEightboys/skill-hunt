import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import { Trophy, ArrowLeft, Star, Users, Crown } from "lucide-react";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { data: activeEvent } = trpc.event.active.useQuery();
  const { data: leaderboard, isLoading } = trpc.leaderboard.public.useQuery(
    { eventId: activeEvent?.id ?? 0 },
    { enabled: !!activeEvent },
  );

  const ranked = leaderboard?.filter((e) => e.isRanked) ?? [];
  const unranked = leaderboard?.filter((e) => !e.isRanked) ?? [];

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Home
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F2A4A] flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[#0F2A4A]">Leaderboard</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F2A4A] mb-2">Leaderboard</h1>
          <p className="text-gray-600">
            {activeEvent ? activeEvent.name : "Loading event..."}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : ranked.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-400 mb-2">
                {activeEvent?.status === "published" ? "No Ranked Projects" : "Results Not Published"}
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                {activeEvent?.status === "published"
                  ? "No projects have enough faculty reviews to be ranked yet."
                  : "Results will be published after faculty reviews are complete. Check back later!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Top 3 Podium */}
            {ranked.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
                {[1, 0, 2].map((idx) => {
                  const entry = ranked[idx];
                  if (!entry) return null;
                  return (
                    <div
                      key={entry.projectId}
                      className={`cursor-pointer ${idx === 0 ? "order-2" : idx === 1 ? "order-1 mt-8" : "order-3 mt-12"}`}
                      onClick={() => navigate(`/projects/${entry.projectId}`)}
                    >
                      <Card className={`border-0 shadow-xl overflow-hidden ${
                        idx === 0 ? "ring-2 ring-[#F5A623]" : ""
                      }`}>
                        <div className={`h-2 ${
                          idx === 0 ? "bg-[#F5A623]" : idx === 1 ? "bg-gray-400" : "bg-amber-700"
                        }`} />
                        <CardContent className="p-5 text-center">
                          {idx === 0 && <Crown className="w-6 h-6 text-[#F5A623] mx-auto mb-2" />}
                          <p className="text-3xl font-bold text-gray-200 mb-2">#{entry.rank}</p>
                          <h3 className="font-semibold text-[#0F2A4A] text-sm line-clamp-2 mb-2">
                            {entry.project?.title}
                          </h3>
                          <p className="text-2xl font-bold text-[#0F2A4A]">
                            {entry.finalScore ? parseFloat(entry.finalScore).toFixed(1) : "-"}
                          </p>
                          {entry.hasPeoplesChoice && (
                            <Badge className="mt-2 bg-[#F5A623] text-white text-xs">
                              People's Choice
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full Rankings Table */}
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {ranked.map((entry) => (
                    <div
                      key={entry.projectId}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/projects/${entry.projectId}`)}
                    >
                      <div className="w-12 text-center">
                        <span className={`text-2xl font-bold ${
                          entry.rank === 1 ? "text-[#F5A623]" :
                          entry.rank === 2 ? "text-gray-400" :
                          entry.rank === 3 ? "text-amber-700" :
                          "text-gray-300"
                        }`}>
                          #{entry.rank}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#0F2A4A] truncate">{entry.project?.title}</h3>
                          {entry.hasPeoplesChoice && (
                            <Badge className="bg-[#F5A623] text-white shrink-0 text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              People's Choice
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {entry.project?.teamMembers?.map((t) => t.name).join(", ")}
                          </span>
                          <span>{entry.project?.category}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-[#0F2A4A]">
                          {entry.finalScore ? parseFloat(entry.finalScore).toFixed(1) : "-"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Faculty: {entry.facultyScore ? parseFloat(entry.facultyScore).toFixed(1) : "-"} | {" "}
                          Peer: {entry.peerScore ? parseFloat(entry.peerScore).toFixed(1) : "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Unranked Section */}
            {unranked.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-gray-400 mb-4">Unranked Projects</h2>
                <p className="text-sm text-gray-500 mb-4">
                  These projects need at least 3 faculty reviews to be ranked.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unranked.map((entry) => (
                    <Card
                      key={entry.projectId}
                      className="cursor-pointer hover:shadow-md transition-all border-gray-200"
                      onClick={() => navigate(`/projects/${entry.projectId}`)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-medium text-gray-600">{entry.project?.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Reviews: {entry.facultyReviewCount}/3 required
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Scoring Explanation */}
            <Card className="mt-10 bg-blue-50 border-blue-100">
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#0F2A4A] mb-2">How Scoring Works</h3>
                <p className="text-sm text-gray-600">
                  Final Score = (Faculty Weighted Score × 85%) + (Peer Normalized Score × 15%).
                  Faculty scores are weighted by designation. Peer scores are normalized so the highest
                  vote-getter receives 100 points. Projects need at least 3 faculty reviews to be ranked.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
