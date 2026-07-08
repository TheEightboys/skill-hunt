import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  FolderGit2,
  Calendar,
  Star,
  Vote,
  PieChart,
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
  const { data: projects } = trpc.project.list.useQuery();
  const { data: events } = trpc.admin.events.useQuery();
  const { data: evaluations } = trpc.admin.evaluations.useQuery({ eventId: activeEvent?.id ?? 0 }, { enabled: !!activeEvent });
  const { data: votes } = trpc.admin.votes.useQuery({ eventId: activeEvent?.id ?? 0 }, { enabled: !!activeEvent });
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
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-[#0F2A4A] flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[#0F2A4A]">Super Admin Dashboard</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")}>
            Exit Admin
          </Button>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 flex flex-wrap h-auto justify-start p-1 bg-gray-100/50 rounded-xl">
            <TabsTrigger value="dashboard" className="rounded-lg"><BarChart3 className="w-4 h-4 mr-2" />Overview</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
            <TabsTrigger value="projects" className="rounded-lg"><FolderGit2 className="w-4 h-4 mr-2" />Projects</TabsTrigger>
            <TabsTrigger value="events" className="rounded-lg"><Calendar className="w-4 h-4 mr-2" />Events</TabsTrigger>
            <TabsTrigger value="evaluations" className="rounded-lg"><Star className="w-4 h-4 mr-2" />Evaluations</TabsTrigger>
            <TabsTrigger value="voting" className="rounded-lg"><Vote className="w-4 h-4 mr-2" />Voting</TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-lg"><Trophy className="w-4 h-4 mr-2" />Leaderboards</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg"><PieChart className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-t-4 border-t-[#0F2A4A] shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Events</p>
                  <p className="text-4xl font-bold text-[#0F2A4A] mt-2">{stats?.totalEvents ?? 0}</p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-[#22B8CF] shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Events</p>
                  <p className="text-4xl font-bold text-[#22B8CF] mt-2">{stats?.activeEvents ?? 0}</p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-[#2F9E44] shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Students</p>
                  <p className="text-4xl font-bold text-[#2F9E44] mt-2">{stats?.totalStudents ?? 0}</p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-[#F5A623] shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Faculty</p>
                  <p className="text-4xl font-bold text-[#F5A623] mt-2">{stats?.totalFaculty ?? 0}</p>
                </CardContent>
              </Card>
            </div>

            {activeEvent && (
              <Card className="shadow-sm">
                <CardHeader className="bg-gray-50/50 border-b">
                  <CardTitle className="text-lg">Current Active Event: <span className="text-primary">{activeEvent.name}</span></CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center justify-center p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all">
                      <FolderGit2 className="w-8 h-8 text-[#22B8CF] mb-2" />
                      <p className="text-3xl font-bold">{eventStats?.projectCount ?? 0}</p>
                      <p className="text-sm text-gray-500 font-medium">Projects Submitted</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all">
                      <Star className="w-8 h-8 text-[#F5A623] mb-2" />
                      <p className="text-3xl font-bold">{eventStats?.submittedReviewCount ?? 0}</p>
                      <p className="text-sm text-gray-500 font-medium">Faculty Reviews</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all">
                      <Vote className="w-8 h-8 text-purple-500 mb-2" />
                      <p className="text-3xl font-bold">{eventStats?.voteCount ?? 0}</p>
                      <p className="text-sm text-gray-500 font-medium">Peer Votes</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all">
                      <Users className="w-8 h-8 text-rose-500 mb-2" />
                      <p className="text-3xl font-bold">{pendingFaculty?.length ?? 0}</p>
                      <p className="text-sm text-gray-500 font-medium">Pending Faculty</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Faculty Alerts */}
            {pendingFaculty && pendingFaculty.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                    Pending Faculty Verification ({pendingFaculty.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingFaculty.map((faculty: any) => (
                    <div key={faculty.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                      <div className="mb-4 sm:mb-0">
                        <p className="font-semibold text-gray-900">{faculty.user?.name}</p>
                        <p className="text-sm text-gray-500">{faculty.user?.email}</p>
                        <Badge variant="outline" className="mt-2 capitalize bg-gray-50">
                          {faculty.department} &middot; {faculty.designation?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => verifyFacultyMutation.mutate({ userId: faculty.userId })}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage all registered students, faculty, and admins.</CardDescription>
                </div>
                <Button>Invite User</Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="text-left font-semibold p-4">Name</th>
                        <th className="text-left font-semibold p-4">Email</th>
                        <th className="text-left font-semibold p-4">Role</th>
                        <th className="text-left font-semibold p-4">Status</th>
                        <th className="text-left font-semibold p-4">Joined</th>
                        <th className="text-right font-semibold p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {allUsers?.map((u: any) => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-medium text-gray-900">{u.name}</td>
                          <td className="p-4 text-gray-500">{u.email}</td>
                          <td className="p-4">
                            <Badge variant={u.role === "admin" ? "default" : (u.role === "faculty" ? "secondary" : "outline")}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant={u.accountStatus === "active" ? "secondary" : "destructive"} className="capitalize">
                              {u.accountStatus}
                            </Badge>
                          </td>
                          <td className="p-4 text-gray-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                          </td>
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROJECTS TAB */}
          <TabsContent value="projects">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Project Repository</CardTitle>
                  <CardDescription>All submitted projects across all events.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="text-left font-semibold p-4">Title</th>
                        <th className="text-left font-semibold p-4">Category</th>
                        <th className="text-left font-semibold p-4">Status</th>
                        <th className="text-right font-semibold p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {projects?.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <p className="font-medium text-gray-900">{p.title}</p>
                            <p className="text-xs text-gray-500">{p.department} | {p.teamMembers?.length || 1} Members</p>
                          </td>
                          <td className="p-4 text-gray-500">{p.category || 'Uncategorized'}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="capitalize">{p.submissionStatus}</Badge>
                          </td>
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${p.id}`)}>View</Button>
                          </td>
                        </tr>
                      ))}
                      {!projects?.length && (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">No projects found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EVENTS TAB */}
          <TabsContent value="events">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Event Management</CardTitle>
                  <CardDescription>Create and manage hackathons, showcases, and events.</CardDescription>
                </div>
                <Button className="bg-[#0F2A4A] hover:bg-[#0d223d]">Create Event</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events?.map((e: any) => (
                    <Card key={e.id} className={`overflow-hidden border-2 ${e.isActive ? 'border-[#22B8CF]' : 'border-transparent shadow-sm'}`}>
                      <div className={`h-2 ${e.isActive ? 'bg-[#22B8CF]' : 'bg-gray-200'}`} />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant={e.isActive ? "default" : "secondary"}>{e.status.replace(/_/g, ' ')}</Badge>
                          {e.isActive && <Badge className="bg-[#0F2A4A]">Active</Badge>}
                        </div>
                        <CardTitle className="text-lg">{e.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{e.description}</p>
                        <div className="space-y-1 text-xs text-gray-500 mb-4">
                          <p>Reg: {e.registrationStartAt ? new Date(e.registrationStartAt).toLocaleDateString() : 'N/A'}</p>
                          <p>Due: {e.submissionDeadline ? new Date(e.submissionDeadline).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                          <Button variant="outline" size="sm" className="flex-1">Manage</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EVALUATIONS TAB */}
          <TabsContent value="evaluations">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Faculty Evaluations</CardTitle>
                <CardDescription>Monitor all faculty reviews for the active event.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="text-left font-semibold p-4">Faculty</th>
                        <th className="text-left font-semibold p-4">Project</th>
                        <th className="text-left font-semibold p-4">Score</th>
                        <th className="text-left font-semibold p-4">Status</th>
                        <th className="text-left font-semibold p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {evaluations?.map((ev: any) => (
                        <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-medium">{ev.faculty?.user?.name || "Unknown"}</td>
                          <td className="p-4 text-gray-600">{ev.project?.title || "Unknown"}</td>
                          <td className="p-4 font-bold text-[#0F2A4A]">{ev.computedWeightedScore || "-"}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="capitalize">{ev.status}</Badge>
                          </td>
                          <td className="p-4 text-gray-400">
                            {ev.submittedAt ? new Date(ev.submittedAt).toLocaleDateString() : "-"}
                          </td>
                        </tr>
                      ))}
                      {!evaluations?.length && (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">No evaluations found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VOTING TAB */}
          <TabsContent value="voting">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Peer Voting Log</CardTitle>
                <CardDescription>Track all student peer votes.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="text-left font-semibold p-4">Voter</th>
                        <th className="text-left font-semibold p-4">Voted For (Project)</th>
                        <th className="text-left font-semibold p-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {votes?.map((v: any) => (
                        <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-medium">{v.voter?.name || "Unknown"}</td>
                          <td className="p-4 text-[#0F2A4A] font-medium">{v.project?.title || "Unknown"}</td>
                          <td className="p-4 text-gray-400">
                            {v.createdAt ? new Date(v.createdAt).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))}
                      {!votes?.length && (
                        <tr><td colSpan={3} className="p-8 text-center text-gray-500">No votes found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LEADERBOARD TAB */}
          <TabsContent value="leaderboard">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#0F2A4A]">Leaderboard Management</h2>
                <p className="text-gray-500 mt-1">Review and finalize event scores before publishing.</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => activeEvent && recomputeMutation.mutate({ eventId: activeEvent.id })}
                  disabled={recomputeMutation.isPending}
                  className="gap-2 shadow-sm border-gray-300"
                >
                  <Calculator className="w-4 h-4" />
                  Recompute All
                </Button>
                {activeEvent?.status !== "published" && (
                  <Button
                    onClick={() => activeEvent && publishMutation.mutate({ eventId: activeEvent.id })}
                    disabled={publishMutation.isPending}
                    className="bg-[#2F9E44] hover:bg-[#258c3a] gap-2 shadow-sm"
                  >
                    <Upload className="w-4 h-4 text-white" />
                    Publish Results to Public
                  </Button>
                )}
              </div>
            </div>

            {recomputeMutation.data && (
              <Card className="mb-6 bg-green-50 border-green-200 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">
                    Success! Scores recomputed: {recomputeMutation.data.computedCount} total projects processed ({recomputeMutation.data.rankedCount} ranked, {recomputeMutation.data.unrankedCount} unranked).
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-sm border-t-4 border-t-[#F5A623]">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/80 text-gray-600 border-b">
                      <tr>
                        <th className="text-center font-semibold p-4 w-16">Rank</th>
                        <th className="text-left font-semibold p-4">Project Title & Team</th>
                        <th className="text-right font-semibold p-4">Faculty Score</th>
                        <th className="text-right font-semibold p-4">Peer Score</th>
                        <th className="text-right font-semibold p-4 text-[#0F2A4A]">Final Score</th>
                        <th className="text-center font-semibold p-4">Awards</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {leaderboardPreview?.map((entry: any) => (
                        <tr key={entry.projectId} className={`hover:bg-amber-50/30 transition-colors ${entry.rank === 1 ? 'bg-amber-50/50' : ''}`}>
                          <td className="p-4 text-center">
                            {entry.isRanked ? (
                              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${entry.rank === 1 ? 'bg-amber-400 text-white shadow-md' : entry.rank === 2 ? 'bg-gray-300 text-gray-700 shadow-sm' : entry.rank === 3 ? 'bg-amber-700/60 text-white shadow-sm' : 'bg-gray-100 text-gray-700'}`}>
                                {entry.rank}
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs text-gray-400 border-gray-200">NR</Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-gray-900 text-base">{entry.project?.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {entry.project?.teamMembers?.map((t: any) => t.name).join(", ")}
                            </p>
                          </td>
                          <td className="p-4 text-right">
                            <p className="font-medium text-gray-700">{entry.facultyScore ? parseFloat(entry.facultyScore).toFixed(2) : "-"}</p>
                            <p className="text-[10px] text-gray-400">{entry.facultyReviewCount} reviews</p>
                          </td>
                          <td className="p-4 text-right">
                            <p className="font-medium text-gray-700">{entry.peerScore ? parseFloat(entry.peerScore).toFixed(2) : "-"}</p>
                            <p className="text-[10px] text-gray-400">{entry.totalVotes} votes</p>
                          </td>
                          <td className="p-4 text-right">
                            <p className="font-bold text-lg text-[#0F2A4A]">
                              {entry.finalScore ? parseFloat(entry.finalScore).toFixed(2) : "-"}
                            </p>
                          </td>
                          <td className="p-4 text-center">
                            {entry.hasPeoplesChoice ? (
                              <Badge className="bg-gradient-to-r from-pink-500 to-orange-400 text-white border-0 shadow-sm">People's Choice</Badge>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {!leaderboardPreview?.length && (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">No leaderboard data available. Ensure projects are reviewed and scores are computed.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>Deep dive into event statistics and participation metrics.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 bg-gray-50 border rounded-lg border-dashed">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Advanced Analytics Hub</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-sm">
                      Production-ready charts, historical tracking, and exportable reports are being generated from the active dataset.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Global Event Settings</CardTitle>
                  <CardDescription>Configure rules, deadlines, and scoring algorithms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <Label className="text-gray-500 text-xs uppercase tracking-wider">Event Lifecycle Phase</Label>
                    <p className="text-lg font-medium text-gray-900 capitalize mt-1">
                      {activeEvent?.status?.replace(/_/g, " ") ?? "Not set"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <Label className="text-gray-500 text-xs uppercase tracking-wider">Submission Deadline</Label>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {activeEvent?.submissionDeadline ? new Date(activeEvent.submissionDeadline).toLocaleString() : "Not set"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <Label className="text-gray-500 text-xs uppercase tracking-wider">Review Deadline</Label>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {activeEvent?.reviewDeadline ? new Date(activeEvent.reviewDeadline).toLocaleString() : "Not set"}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Scoring Algorithm Weights</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Faculty Expert Weight</span>
                        <Badge className="bg-[#0F2A4A]">85%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Peer / Student Vote Weight</span>
                        <Badge className="bg-[#22B8CF]">15%</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Minimum Faculty Reviews for Ranking</span>
                        <Badge variant="outline">3 Reviews</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Administrative Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full justify-start gap-3 h-12"
                    variant="outline"
                    onClick={() => activeEvent && recomputeMutation.mutate({ eventId: activeEvent.id })}
                  >
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-gray-700" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Force Recompute All Scores</div>
                      <div className="text-xs text-gray-500">Recalculate leaderboard immediately</div>
                    </div>
                  </Button>
                  
                  <Button
                    className="w-full justify-start gap-3 h-12"
                    variant="outline"
                    onClick={() => activeEvent && publishMutation.mutate({ eventId: activeEvent.id })}
                  >
                    <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-green-700">Publish Results</div>
                      <div className="text-xs text-gray-500">Make leaderboard public to students</div>
                    </div>
                  </Button>
                  
                  <Button className="w-full justify-start gap-3 h-12" variant="outline">
                    <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-blue-700">Export Full CSV Report</div>
                      <div className="text-xs text-gray-500">Download all data for external systems</div>
                    </div>
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
