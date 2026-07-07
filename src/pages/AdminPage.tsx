import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Code2,
  Users,
  Trophy,
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  Calculator,
  Upload,
  AlertTriangle,
} from "lucide-react";

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: stats } = trpc.event.dashboardStats.useQuery();
  const { data: activeEvent } = trpc.event.active.useQuery();
  const { data: eventStats } = trpc.event.stats.useQuery(
    { eventId: activeEvent?.id ?? 0 },
    { enabled: !!activeEvent },
  );
  const { data: allUsers } = trpc.admin.users.useQuery();
  const { data: pendingFaculty } = trpc.admin.pendingFaculty.useQuery();
  const { data: leaderboardPreview } = trpc.leaderboard.preview.useQuery(
    { eventId: activeEvent?.id ?? 0 },
    { enabled: !!activeEvent },
  );

  const utils = trpc.useUtils();
  const recomputeMutation = trpc.admin.recomputeScores.useMutation({
    onSuccess: () => {
      utils.leaderboard.preview.invalidate();
    },
  });
  const publishMutation = trpc.event.publishResults.useMutation({
    onSuccess: () => {
      utils.event.active.invalidate();
    },
  });
  const verifyFacultyMutation = trpc.admin.verifyFaculty.useMutation({
    onSuccess: () => {
      utils.admin.pendingFaculty.invalidate();
    },
  });

  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <AlertTriangle className="w-16 h-16 text-amber-500" />
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-gray-500">You do not have permission to access the admin panel.</p>
        <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-[#0F2A4A] flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[#0F2A4A]">Admin Panel</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")}>
            Exit Admin
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard">
              <BarChart3 className="w-4 h-4 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-1" />
              Users
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="w-4 h-4 mr-1" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Total Events</p>
                  <p className="text-3xl font-bold text-[#0F2A4A]">{stats?.totalEvents ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Active Events</p>
                  <p className="text-3xl font-bold text-[#22B8CF]">{stats?.activeEvents ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Students</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.totalStudents ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500">Faculty</p>
                  <p className="text-3xl font-bold text-[#F5A623]">{stats?.totalFaculty ?? 0}</p>
                </CardContent>
              </Card>
            </div>

            {activeEvent && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Active Event: {activeEvent.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold">{eventStats?.projectCount ?? 0}</p>
                      <p className="text-xs text-gray-500">Projects</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold">{eventStats?.submittedReviewCount ?? 0}</p>
                      <p className="text-xs text-gray-500">Reviews</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold">{eventStats?.voteCount ?? 0}</p>
                      <p className="text-xs text-gray-500">Votes</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold">{pendingFaculty?.length ?? 0}</p>
                      <p className="text-xs text-gray-500">Pending Faculty</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Faculty */}
            {pendingFaculty && pendingFaculty.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Pending Faculty Verification ({pendingFaculty.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingFaculty.map((faculty) => (
                    <div key={faculty.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{faculty.user?.name}</p>
                        <p className="text-sm text-gray-500">{faculty.user?.email}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {faculty.department} &middot; {faculty.designation?.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => verifyFacultyMutation.mutate({ userId: faculty.userId })}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users ({allUsers?.length ?? 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers?.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{user.name}</td>
                          <td className="p-3 text-gray-500">{user.email}</td>
                          <td className="p-3">
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="capitalize">
                              {user.accountStatus}
                            </Badge>
                          </td>
                          <td className="p-3 text-gray-400">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0F2A4A]">Leaderboard Preview</h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => activeEvent && recomputeMutation.mutate({ eventId: activeEvent.id })}
                  disabled={recomputeMutation.isPending}
                  className="gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  Recompute Scores
                </Button>
                {activeEvent?.status !== "published" && (
                  <Button
                    onClick={() => activeEvent && publishMutation.mutate({ eventId: activeEvent.id })}
                    disabled={publishMutation.isPending}
                    className="bg-[#2F9E44] hover:bg-[#258c3a] gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Publish Results
                  </Button>
                )}
              </div>
            </div>

            {recomputeMutation.data && (
              <Card className="mb-6 bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <p className="text-green-700 text-sm">
                    Scores recomputed: {recomputeMutation.data.computedCount} projects,
                    {recomputeMutation.data.rankedCount} ranked,
                    {recomputeMutation.data.unrankedCount} unranked
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {leaderboardPreview?.map((entry) => (
                    <div key={entry.projectId} className="flex items-center gap-4 p-4">
                      <div className="w-10 text-center">
                        {entry.isRanked ? (
                          <span className="font-bold text-[#0F2A4A]">#{entry.rank}</span>
                        ) : (
                          <Badge variant="outline" className="text-xs">NR</Badge>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{entry.project?.title}</p>
                        <p className="text-xs text-gray-500">
                          {entry.project?.teamMembers?.map((t) => t.name).join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#0F2A4A]">
                          {entry.finalScore ? parseFloat(entry.finalScore).toFixed(1) : "-"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {entry.facultyReviewCount} reviews | {entry.totalVotes} votes
                        </p>
                      </div>
                      {entry.hasPeoplesChoice && (
                        <Badge className="bg-[#F5A623] text-white">People's Choice</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Event Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Event Status</Label>
                    <p className="text-sm text-gray-600 capitalize">
                      {activeEvent?.status?.replace(/_/g, " ") ?? "Not set"}
                    </p>
                  </div>
                  <div>
                    <Label>Submission Deadline</Label>
                    <p className="text-sm text-gray-600">
                      {activeEvent?.submissionDeadline
                        ? new Date(activeEvent.submissionDeadline).toLocaleString()
                        : "Not set"}
                    </p>
                  </div>
                  <div>
                    <Label>Review Deadline</Label>
                    <p className="text-sm text-gray-600">
                      {activeEvent?.reviewDeadline
                        ? new Date(activeEvent.reviewDeadline).toLocaleString()
                        : "Not set"}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <Label>Score Configuration</Label>
                    <p className="text-sm text-gray-600">Faculty Weight: 85%</p>
                    <p className="text-sm text-gray-600">Peer Weight: 15%</p>
                    <p className="text-sm text-gray-600">Min Reviews to Rank: 3</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start gap-2"
                    variant="outline"
                    onClick={() => activeEvent && recomputeMutation.mutate({ eventId: activeEvent.id })}
                  >
                    <Calculator className="w-4 h-4" />
                    Recompute All Scores
                  </Button>
                  <Button
                    className="w-full justify-start gap-2"
                    variant="outline"
                    onClick={() => activeEvent && publishMutation.mutate({ eventId: activeEvent.id })}
                  >
                    <Upload className="w-4 h-4" />
                    Publish Results
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <BarChart3 className="w-4 h-4" />
                    Export Data (CSV)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
