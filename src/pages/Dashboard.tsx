import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EventSelectionModal } from "@/components/EventSelectionModal";
import { Code2, Trophy, Vote, Calendar, FileEdit, Eye, ArrowRight, GitBranch, BarChart3, LogOut, Plus } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  
  // All hooks MUST be declared at the top in consistent order
  const [eventSelectionOpen, setEventSelectionOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Query hooks MUST be called in consistent order (before any early returns)
  const { data: activeEvent } = trpc.event.active.useQuery();
  const { data: myRegistrations } = trpc.event.myRegistrations.useQuery();
  const { data: myProject, isLoading: projectLoading } = trpc.project.myProject.useQuery(
    { eventId: activeEvent?.id ?? 0 },
    { enabled: !!activeEvent },
  );
  const { data: myVote } = trpc.vote.myVote.useQuery(
    { eventId: activeEvent?.id ?? 0 },
    { enabled: !!activeEvent },
  );
  const { data: results } = trpc.leaderboard.myResults.useQuery(
    { eventId: activeEvent?.id ?? 0 },
    { enabled: !!activeEvent && activeEvent.status === "published" },
  );
  
  // Handle role-based routing based on user type from signup
  React.useEffect(() => {
    if (!isLoading && user && !isRedirecting) {
      // Check if this is a faculty user:
      // 1. Has a faculty profile in DB
      // 2. Signed up with user_type=faculty (passed via signupUserType from Supabase metadata)
      const isIntendedFaculty =
        user.facultyProfile ||
        (user as any).signupUserType === "faculty";

      if (isIntendedFaculty && user.role !== "admin") {
        setIsRedirecting(true);
        navigate("/faculty", { replace: true });
      }
      // Admin users go to /admin
      if (user.role === "admin") {
        setIsRedirecting(true);
        navigate("/admin", { replace: true });
      }
    }
  }, [isLoading, user, isRedirecting, navigate]);

  // Show loading screen while checking auth or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-[#0F2A4A] flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[#0F2A4A]">Skill Hunt University</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden md:inline">{user?.name}</span>

            {user?.role === "admin" && (
              <Button size="sm" onClick={() => navigate("/admin")} className="bg-[#0F2A4A]">
                Admin Panel
              </Button>
            )}
            
            {/* Faculty Portal button completely removed */}
            
            <Button size="sm" variant="outline" onClick={() => navigate("/projects")}>
              <Eye className="w-4 h-4 mr-1" />
              Browse
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={logout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F2A4A] mb-2">Student Dashboard</h1>
            <p className="text-gray-600">
              {activeEvent ? (
                <>
                  {activeEvent.name} &middot;{" "}
                  <Badge variant="outline" className="capitalize">
                    {activeEvent.status?.replace(/_/g, " ")}
                  </Badge>
                </>
              ) : "No active event"}
            </p>
          </div>
          <Button
            onClick={() => setEventSelectionOpen(true)}
            className="bg-[#22B8CF] hover:bg-[#1da8bc] text-[#0F2A4A] font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Register for Events
          </Button>
        </div>

        {/* My Registered Events */}
        {myRegistrations && myRegistrations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#0F2A4A] mb-3">My Registered Events ({myRegistrations.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRegistrations.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{event.name}</h3>
                    <Badge variant="outline" className="capitalize text-xs mb-3 inline-block">
                      {event.status?.replace(/_/g, " ")}
                    </Badge>
                    <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                    {event.submissionDeadline && (
                      <div className="text-xs text-gray-500 mt-3">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Deadline: {new Date(event.submissionDeadline).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileEdit className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">My Project</p>
                  <p className="font-semibold text-sm">{myProject ? "Submitted" : "Not Submitted"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <Vote className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">My Vote</p>
                  <p className="font-semibold text-sm">{myVote ? "Cast" : "Not Voted"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Results</p>
                  <p className="font-semibold text-sm">
                    {activeEvent?.status === "published" ? "Available" : "Pending"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className="font-semibold text-sm">
                    {activeEvent?.submissionDeadline
                      ? new Date(activeEvent.submissionDeadline).toLocaleDateString()
                      : "TBA"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Project Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileEdit className="w-5 h-5 text-[#22B8CF]" />
                  My Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectLoading ? (
                  <Skeleton className="h-32" />
                ) : myProject ? (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-[#0F2A4A]">{myProject.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{myProject.abstract}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{myProject.category}</Badge>
                          <Badge className={myProject.previewStatus === "live" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                            {myProject.previewStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/projects/${myProject.id}`)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/edit/${myProject.id}`)}>
                        <FileEdit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {myProject.githubUrl && (
                        <a href={myProject.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                          <GitBranch className="w-4 h-4" />
                          GitHub
                        </a>
                      )}
                    </div>

                    {/* Results Section */}
                    {results?.snapshot && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold text-[#0F2A4A] mb-4">My Results</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-500">Final Score</p>
                            <p className="text-2xl font-bold text-[#0F2A4A]">
                              {parseFloat(results.snapshot.finalScore ?? "0").toFixed(1)}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-500">Faculty</p>
                            <p className="text-2xl font-bold text-green-700">
                              {parseFloat(results.snapshot.facultyScore ?? "0").toFixed(1)}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-cyan-50 rounded-lg">
                            <p className="text-xs text-gray-500">Peer</p>
                            <p className="text-2xl font-bold text-cyan-700">
                              {parseFloat(results.snapshot.peerScore ?? "0").toFixed(1)}
                            </p>
                          </div>
                        </div>
                        {results.snapshot.rank && (
                          <div className="mt-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-[#F5A623]" />
                            <span className="font-semibold">Rank #{results.snapshot.rank}</span>
                            {results.snapshot.hasPeoplesChoice && (
                              <Badge className="bg-[#F5A623] text-white ml-2">People's Choice</Badge>
                            )}
                          </div>
                        )}
                        {!results.snapshot.isRanked && (
                          <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                            Your project needs at least 3 faculty reviews to be ranked.
                            Current reviews: {results.snapshot.facultyReviewCount}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">You haven&apos;t submitted a project yet</p>
                    <Button onClick={() => navigate("/submit")} className="bg-[#0F2A4A] gap-2">
                      Submit Project
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vote Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Vote className="w-5 h-5 text-[#22B8CF]" />
                  My Vote
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myVote ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      You voted for:
                    </p>
                    <div
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => navigate(`/projects/${myVote.projectId}`)}
                    >
                      <div>
                        <p className="font-semibold text-[#0F2A4A]">{myVote.project?.title ?? `Project #${myVote.projectId}`}</p>
                        <p className="text-xs text-gray-500">Click to view project</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <Button
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={() => navigate("/projects")}
                    >
                      Change Vote
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Vote className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">You haven&apos;t voted yet</p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/projects")}
                      disabled={activeEvent?.status !== "review_and_voting_open"}
                    >
                      Browse Projects to Vote
                    </Button>
                    {activeEvent?.status !== "review_and_voting_open" && (
                      <p className="text-xs text-gray-400 mt-2">Voting is not currently open</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Registration Opens", date: activeEvent?.registrationStartAt },
                    { label: "Submission Deadline", date: activeEvent?.submissionDeadline },
                    { label: "Voting Opens", date: activeEvent?.votingStartAt },
                    { label: "Review Deadline", date: activeEvent?.reviewDeadline },
                    { label: "Results Published", date: activeEvent?.resultsPublishedAt },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#22B8CF] mt-2 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500">
                          {item.date ? new Date(item.date).toLocaleDateString() : "TBA"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(myProject ? `/edit/${myProject.id}` : "/submit")}
                >
                  <FileEdit className="w-4 h-4 mr-2" />
                  {myProject ? "Edit Project" : "Submit Project"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/projects")}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Browse Projects
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/leaderboard")}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/results")}
                  disabled={activeEvent?.status !== "published"}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  My Results
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <EventSelectionModal
          open={eventSelectionOpen}
          onOpenChange={setEventSelectionOpen}
          onSelectionComplete={() => {
            // Refresh registrations
          }}
        />
      </div>
    </div>
  );
}
