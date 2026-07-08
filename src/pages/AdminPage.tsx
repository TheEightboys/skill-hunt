import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

const adminTabs = [
  { id: "dashboard", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "events", label: "Events", icon: Calendar },
  { id: "evaluations", label: "Evaluations", icon: Star },
  { id: "voting", label: "Voting", icon: Vote },
  { id: "leaderboard", label: "Leaderboards", icon: Trophy },
  { id: "analytics", label: "Analytics", icon: PieChart },
  { id: "settings", label: "Settings", icon: Settings },
];

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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F2A4A]"></div>
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#FAFBFC]">
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="border-b p-4 min-h-[64px] flex justify-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 rounded-lg bg-[#0F2A4A] flex items-center justify-center shrink-0">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-[#0F2A4A] truncate">Super Admin</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-3">
            <SidebarMenu className="space-y-1">
              {adminTabs.map((tab) => (
                <SidebarMenuItem key={tab.id}>
                  <SidebarMenuButton
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    tooltip={tab.label}
                    className={`h-11 rounded-lg px-3 transition-colors ${activeTab === tab.id ? 'bg-[#0F2A4A]/5 text-[#0F2A4A] font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#0F2A4A]' : 'text-gray-500'}`} />
                    <span className="ml-2 text-[15px]">{tab.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <Button variant="outline" className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors" onClick={() => navigate("/dashboard")}>
              <LogOut className="w-4 h-4 mr-2" /> Exit Admin
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-[#FAFBFC]">
          <header className="sticky top-0 z-20 flex h-[64px] shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur-md px-4 md:px-6 shadow-sm">
            <SidebarTrigger className="-ml-2 md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-6 md:hidden bg-gray-200" />
            <div className="flex-1 flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight text-[#0F2A4A]">
                {adminTabs.find((t) => t.id === activeTab)?.label}
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="hidden sm:inline-flex bg-[#0F2A4A]/5 text-[#0F2A4A] border-[#0F2A4A]/20">
                  {user?.name || 'Admin'}
                </Badge>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto animate-in fade-in duration-300">
              
              {/* DASHBOARD TAB */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-none shadow-md overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#0F2A4A]" />
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Events</p>
                            <p className="text-4xl font-bold text-[#0F2A4A] mt-2">{stats?.totalEvents ?? 0}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-[#0F2A4A]/10 text-[#0F2A4A]"><Calendar className="w-6 h-6"/></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-md overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#22B8CF]" />
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Events</p>
                            <p className="text-4xl font-bold text-[#22B8CF] mt-2">{stats?.activeEvents ?? 0}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-[#22B8CF]/10 text-[#22B8CF]"><BarChart3 className="w-6 h-6"/></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-md overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#2F9E44]" />
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Students</p>
                            <p className="text-4xl font-bold text-[#2F9E44] mt-2">{stats?.totalStudents ?? 0}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-[#2F9E44]/10 text-[#2F9E44]"><Users className="w-6 h-6"/></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-md overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#F5A623]" />
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Faculty</p>
                            <p className="text-4xl font-bold text-[#F5A623] mt-2">{stats?.totalFaculty ?? 0}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-[#F5A623]/10 text-[#F5A623]"><Star className="w-6 h-6"/></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {activeEvent && (
                    <Card className="border-none shadow-md overflow-hidden">
                      <CardHeader className="bg-gray-50/80 border-b pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Current Active Event: <span className="text-[#0F2A4A]">{activeEvent.name}</span></CardTitle>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Active Now</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                            <div className="p-4 rounded-full bg-[#22B8CF]/10 group-hover:scale-110 transition-transform mb-3">
                              <FolderGit2 className="w-6 h-6 text-[#22B8CF]" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{eventStats?.projectCount ?? 0}</p>
                            <p className="text-sm text-gray-500 font-medium mt-1">Projects Submitted</p>
                          </div>
                          <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                            <div className="p-4 rounded-full bg-[#F5A623]/10 group-hover:scale-110 transition-transform mb-3">
                              <Star className="w-6 h-6 text-[#F5A623]" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{eventStats?.submittedReviewCount ?? 0}</p>
                            <p className="text-sm text-gray-500 font-medium mt-1">Faculty Reviews</p>
                          </div>
                          <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                            <div className="p-4 rounded-full bg-purple-100 group-hover:scale-110 transition-transform mb-3">
                              <Vote className="w-6 h-6 text-purple-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{eventStats?.voteCount ?? 0}</p>
                            <p className="text-sm text-gray-500 font-medium mt-1">Peer Votes</p>
                          </div>
                          <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                            <div className="p-4 rounded-full bg-rose-100 group-hover:scale-110 transition-transform mb-3">
                              <Users className="w-6 h-6 text-rose-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{pendingFaculty?.length ?? 0}</p>
                            <p className="text-sm text-gray-500 font-medium mt-1">Pending Faculty</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Pending Faculty Alerts */}
                  {pendingFaculty && pendingFaculty.length > 0 && (
                    <Card className="border-amber-200 bg-amber-50 shadow-sm overflow-hidden">
                      <div className="h-1 w-full bg-amber-400"></div>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-amber-800 text-lg">
                          <AlertTriangle className="w-5 h-5" />
                          Requires Attention: Faculty Verification ({pendingFaculty.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-2">
                        {pendingFaculty.map((faculty: any) => (
                          <div key={faculty.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-amber-100 rounded-xl shadow-sm">
                            <div className="mb-4 sm:mb-0">
                              <p className="font-bold text-gray-900 text-base">{faculty.user?.name}</p>
                              <p className="text-sm text-gray-500 mt-1">{faculty.user?.email}</p>
                              <Badge variant="outline" className="mt-2 capitalize bg-gray-50 border-gray-200 text-gray-600">
                                {faculty.department} &middot; {faculty.designation?.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                onClick={() => verifyFacultyMutation.mutate({ userId: faculty.userId })}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" className="bg-red-500 hover:bg-red-600 text-white shadow-sm">
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === "users" && (
                <Card className="border-none shadow-md overflow-hidden">
                  <CardHeader className="bg-white border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
                    <div>
                      <CardTitle className="text-xl">User Management</CardTitle>
                      <CardDescription className="mt-1">Manage all registered students, faculty, and admins.</CardDescription>
                    </div>
                    <Button className="bg-[#0F2A4A] shadow-sm">Invite User</Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b">
                          <tr>
                            <th className="text-left font-semibold p-4 pl-6">Name & Email</th>
                            <th className="text-left font-semibold p-4">Role</th>
                            <th className="text-left font-semibold p-4">Status</th>
                            <th className="text-left font-semibold p-4">Joined</th>
                            <th className="text-right font-semibold p-4 pr-6">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {allUsers?.map((u: any) => (
                            <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="p-4 pl-6">
                                <p className="font-semibold text-gray-900">{u.name}</p>
                                <p className="text-gray-500 mt-1">{u.email}</p>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline" className={`
                                  ${u.role === "admin" ? "bg-purple-50 text-purple-700 border-purple-200" : 
                                    u.role === "faculty" ? "bg-amber-50 text-amber-700 border-amber-200" : 
                                    "bg-blue-50 text-blue-700 border-blue-200"}
                                `}>
                                  {u.role}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline" className={`capitalize ${u.accountStatus === "active" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                                  {u.accountStatus}
                                </Badge>
                              </td>
                              <td className="p-4 text-gray-500 font-medium">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                              </td>
                              <td className="p-4 pr-6 text-right">
                                <Button variant="ghost" size="sm" className="text-[#0F2A4A] hover:bg-[#0F2A4A]/10">Edit</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* PROJECTS TAB */}
              {activeTab === "projects" && (
                <Card className="border-none shadow-md overflow-hidden">
                  <CardHeader className="bg-white border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
                    <div>
                      <CardTitle className="text-xl">Project Repository</CardTitle>
                      <CardDescription className="mt-1">All submitted projects across all events.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b">
                          <tr>
                            <th className="text-left font-semibold p-4 pl-6">Title & Department</th>
                            <th className="text-left font-semibold p-4">Category</th>
                            <th className="text-left font-semibold p-4">Status</th>
                            <th className="text-right font-semibold p-4 pr-6">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {projects?.map((p: any) => (
                            <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="p-4 pl-6">
                                <p className="font-semibold text-gray-900 text-base">{p.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-600">{p.department || 'N/A'}</Badge>
                                  <span className="text-xs text-gray-500">{p.teamMembers?.length || 1} Team Members</span>
                                </div>
                              </td>
                              <td className="p-4 font-medium text-gray-700">{p.category || 'Uncategorized'}</td>
                              <td className="p-4">
                                <Badge variant="outline" className={`capitalize ${p.submissionStatus === 'submitted' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                  {p.submissionStatus}
                                </Badge>
                              </td>
                              <td className="p-4 pr-6 text-right">
                                <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${p.id}`)} className="shadow-sm">View Details</Button>
                              </td>
                            </tr>
                          ))}
                          {!projects?.length && (
                            <tr><td colSpan={4} className="p-12 text-center text-gray-500 text-lg">No projects found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* EVENTS TAB */}
              {activeTab === "events" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0F2A4A]">Event Management</h2>
                      <p className="text-gray-500 mt-1">Create and manage hackathons, showcases, and exhibitions.</p>
                    </div>
                    <Button className="bg-[#0F2A4A] hover:bg-[#0d223d] shadow-sm">
                      <Calendar className="w-4 h-4 mr-2"/>
                      Create New Event
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events?.map((e: any) => (
                      <Card key={e.id} className={`overflow-hidden border-none shadow-md transition-all hover:shadow-lg ${e.isActive ? 'ring-2 ring-[#22B8CF] ring-offset-2' : ''}`}>
                        <div className={`h-2 w-full ${e.isActive ? 'bg-gradient-to-r from-[#22B8CF] to-[#0F2A4A]' : 'bg-gray-200'}`} />
                        <CardHeader className="pb-3 bg-white">
                          <div className="flex justify-between items-start mb-3">
                            <Badge variant="outline" className={`uppercase tracking-wider text-[10px] ${e.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                              {e.status.replace(/_/g, ' ')}
                            </Badge>
                            {e.isActive && <Badge className="bg-[#0F2A4A] text-white shadow-sm border-0">Active Event</Badge>}
                          </div>
                          <CardTitle className="text-xl leading-tight text-gray-900">{e.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="bg-gray-50/50 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600 mb-5 line-clamp-2 min-h-[40px]">{e.description}</p>
                          
                          <div className="bg-white p-3 rounded-lg border border-gray-100 mb-5 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500 font-medium">Registration</span>
                              <span className="text-gray-900 font-semibold">{e.registrationStartAt ? new Date(e.registrationStartAt).toLocaleDateString() : 'TBA'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500 font-medium">Submission Due</span>
                              <span className="text-red-600 font-bold">{e.submissionDeadline ? new Date(e.submissionDeadline).toLocaleDateString() : 'TBA'}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 bg-white shadow-sm hover:bg-gray-50">Edit</Button>
                            <Button className="flex-1 bg-gray-900 hover:bg-gray-800 shadow-sm text-white">Manage</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* EVALUATIONS TAB */}
              {activeTab === "evaluations" && (
                <Card className="border-none shadow-md overflow-hidden">
                  <CardHeader className="bg-white border-b p-6">
                    <CardTitle className="text-xl">Faculty Evaluations</CardTitle>
                    <CardDescription className="mt-1">Monitor all faculty reviews and scoring for the active event.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b">
                          <tr>
                            <th className="text-left font-semibold p-4 pl-6">Faculty Expert</th>
                            <th className="text-left font-semibold p-4">Project Reviewed</th>
                            <th className="text-center font-semibold p-4">Weighted Score</th>
                            <th className="text-left font-semibold p-4">Status</th>
                            <th className="text-left font-semibold p-4 pr-6">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {evaluations?.map((ev: any) => (
                            <tr key={ev.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="p-4 pl-6 font-semibold text-gray-900">{ev.faculty?.user?.name || "Unknown"}</td>
                              <td className="p-4 font-medium text-[#0F2A4A]">{ev.project?.title || "Unknown"}</td>
                              <td className="p-4 text-center">
                                <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-base">
                                  {ev.computedWeightedScore || "-"}
                                </span>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline" className="capitalize bg-green-50 text-green-700 border-green-200 shadow-sm">{ev.status}</Badge>
                              </td>
                              <td className="p-4 pr-6 text-gray-500 font-medium">
                                {ev.submittedAt ? new Date(ev.submittedAt).toLocaleString() : "-"}
                              </td>
                            </tr>
                          ))}
                          {!evaluations?.length && (
                            <tr><td colSpan={5} className="p-12 text-center text-gray-500 text-lg">No evaluations recorded yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* VOTING TAB */}
              {activeTab === "voting" && (
                <Card className="border-none shadow-md overflow-hidden">
                  <CardHeader className="bg-white border-b p-6">
                    <CardTitle className="text-xl">Peer Voting Audit Log</CardTitle>
                    <CardDescription className="mt-1">Track all student peer votes to monitor engagement and prevent anomalies.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b">
                          <tr>
                            <th className="text-left font-semibold p-4 pl-6">Voter (Student)</th>
                            <th className="text-left font-semibold p-4">Voted For (Project)</th>
                            <th className="text-right font-semibold p-4 pr-6">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {votes?.map((v: any) => (
                            <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="p-4 pl-6 font-semibold text-gray-900">{v.voter?.name || "Unknown"}</td>
                              <td className="p-4 font-medium text-purple-700">{v.project?.title || "Unknown"}</td>
                              <td className="p-4 pr-6 text-right text-gray-500 font-medium">
                                {v.createdAt ? new Date(v.createdAt).toLocaleString() : "-"}
                              </td>
                            </tr>
                          ))}
                          {!votes?.length && (
                            <tr><td colSpan={3} className="p-12 text-center text-gray-500 text-lg">No votes recorded yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* LEADERBOARD TAB */}
              {activeTab === "leaderboard" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0F2A4A]">Leaderboard Management</h2>
                      <p className="text-gray-500 mt-1">Review, finalize, and publish event scores to the public.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={() => activeEvent && recomputeMutation.mutate({ eventId: activeEvent.id })}
                        disabled={recomputeMutation.isPending}
                        className="bg-white shadow-sm border-gray-200"
                      >
                        <Calculator className="w-4 h-4 mr-2 text-gray-600" />
                        Recompute All
                      </Button>
                      {activeEvent?.status !== "published" && (
                        <Button
                          onClick={() => activeEvent && publishMutation.mutate({ eventId: activeEvent.id })}
                          disabled={publishMutation.isPending}
                          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-md text-white border-0"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Publish to Public
                        </Button>
                      )}
                    </div>
                  </div>

                  {recomputeMutation.data && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in slide-in-from-top-4">
                      <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                      <div>
                        <p className="text-green-900 font-bold">Scores successfully recomputed!</p>
                        <p className="text-green-700 text-sm mt-0.5">
                          Processed {recomputeMutation.data.computedCount} projects ({recomputeMutation.data.rankedCount} ranked, {recomputeMutation.data.unrankedCount} unranked).
                        </p>
                      </div>
                    </div>
                  )}

                  <Card className="border-none shadow-xl overflow-hidden rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#F5A623] via-[#e67e22] to-[#d35400]"></div>
                    <CardContent className="p-0 mt-2">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50/80 text-gray-600 border-b text-xs uppercase tracking-wider">
                            <tr>
                              <th className="text-center font-bold p-5 w-20">Rank</th>
                              <th className="text-left font-bold p-5">Project & Team</th>
                              <th className="text-right font-bold p-5">Faculty (85%)</th>
                              <th className="text-right font-bold p-5">Peer (15%)</th>
                              <th className="text-right font-bold p-5 text-[#0F2A4A] text-sm">Final Score</th>
                              <th className="text-center font-bold p-5">Awards</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {leaderboardPreview?.map((entry: any) => (
                              <tr key={entry.projectId} className={`hover:bg-amber-50/30 transition-colors ${entry.rank === 1 ? 'bg-amber-50/60' : ''}`}>
                                <td className="p-5 text-center">
                                  {entry.isRanked ? (
                                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-lg shadow-sm ${
                                      entry.rank === 1 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-amber-200' : 
                                      entry.rank === 2 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800' : 
                                      entry.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white' : 
                                      'bg-gray-100 text-gray-600 border border-gray-200'
                                    }`}>
                                      {entry.rank}
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="text-xs text-gray-400 border-gray-200 px-2 py-1">NR</Badge>
                                  )}
                                </td>
                                <td className="p-5">
                                  <p className="font-bold text-gray-900 text-base mb-1">{entry.project?.title}</p>
                                  <p className="text-xs text-gray-500 font-medium">
                                    {entry.project?.teamMembers?.map((t: any) => t.name).join(", ")}
                                  </p>
                                </td>
                                <td className="p-5 text-right">
                                  <p className="font-bold text-gray-700 text-base">{entry.facultyScore ? parseFloat(entry.facultyScore).toFixed(2) : "-"}</p>
                                  <p className="text-xs text-gray-400 mt-1">{entry.facultyReviewCount} reviews</p>
                                </td>
                                <td className="p-5 text-right">
                                  <p className="font-bold text-gray-700 text-base">{entry.peerScore ? parseFloat(entry.peerScore).toFixed(2) : "-"}</p>
                                  <p className="text-xs text-gray-400 mt-1">{entry.totalVotes} votes</p>
                                </td>
                                <td className="p-5 text-right bg-blue-50/30">
                                  <p className="font-black text-2xl text-[#0F2A4A]">
                                    {entry.finalScore ? parseFloat(entry.finalScore).toFixed(2) : "-"}
                                  </p>
                                </td>
                                <td className="p-5 text-center">
                                  {entry.hasPeoplesChoice ? (
                                    <div className="inline-flex items-center justify-center bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">
                                      People's Choice
                                    </div>
                                  ) : (
                                    <span className="text-gray-200">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {!leaderboardPreview?.length && (
                              <tr><td colSpan={6} className="p-12 text-center text-gray-500 text-lg">No leaderboard data available. Ensure projects are reviewed and scores are computed.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ANALYTICS TAB */}
              {activeTab === "analytics" && (
                <Card className="border-none shadow-md overflow-hidden">
                  <CardHeader className="bg-white border-b p-6">
                    <CardTitle className="text-xl">Detailed Analytics</CardTitle>
                    <CardDescription className="mt-1">Deep dive into event statistics and participation metrics.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center h-64 bg-gray-50/80 border border-dashed border-gray-300 rounded-2xl">
                      <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                        <PieChart className="w-12 h-12 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Advanced Analytics Engine</h3>
                      <p className="text-gray-500 mt-2 max-w-md text-center">
                        Production-ready charts, historical tracking, and exportable PDF/CSV reports are continuously generating from the active dataset.
                      </p>
                      <Button className="mt-6 bg-[#0F2A4A] shadow-sm">Generate Full Report</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border-none shadow-md">
                    <CardHeader className="border-b bg-gray-50/50 p-6">
                      <CardTitle className="text-xl">Global Event Settings</CardTitle>
                      <CardDescription className="mt-1">Configure lifecycle rules, deadlines, and scoring algorithms.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                      <div>
                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Event Lifecycle Phase</Label>
                        <div className="mt-2 bg-[#0F2A4A]/5 border border-[#0F2A4A]/10 p-4 rounded-xl flex items-center justify-between">
                          <span className="text-lg font-bold text-[#0F2A4A] capitalize">
                            {activeEvent?.status?.replace(/_/g, " ") ?? "Not set"}
                          </span>
                          <Badge className="bg-[#0F2A4A] shadow-sm">Live</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                          <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Submission Deadline</Label>
                          <p className="text-base font-semibold text-gray-900 mt-2">
                            {activeEvent?.submissionDeadline ? new Date(activeEvent.submissionDeadline).toLocaleString() : "Not set"}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                          <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Review Deadline</Label>
                          <p className="text-base font-semibold text-gray-900 mt-2">
                            {activeEvent?.reviewDeadline ? new Date(activeEvent.reviewDeadline).toLocaleString() : "Not set"}
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4 text-lg">Scoring Algorithm Weights</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <Star className="w-5 h-5 text-amber-500" />
                              <span className="font-semibold text-gray-700">Faculty Expert Weight</span>
                            </div>
                            <Badge className="bg-[#0F2A4A] text-sm px-3 py-1">85%</Badge>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <Vote className="w-5 h-5 text-purple-500" />
                              <span className="font-semibold text-gray-700">Student Peer Vote Weight</span>
                            </div>
                            <Badge className="bg-[#22B8CF] text-sm px-3 py-1">15%</Badge>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="font-semibold text-gray-700">Minimum Faculty Reviews</span>
                            </div>
                            <Badge variant="outline" className="text-sm px-3 py-1 border-gray-300 font-bold">3 Reviews required</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-md">
                    <CardHeader className="border-b bg-gray-50/50 p-6">
                      <CardTitle className="text-xl">Administrative Actions</CardTitle>
                      <CardDescription className="mt-1">Execute high-level system commands.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <Button
                        className="w-full justify-start gap-4 h-16 p-4 rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm bg-white hover:bg-gray-50"
                        variant="ghost"
                        onClick={() => activeEvent && recomputeMutation.mutate({ eventId: activeEvent.id })}
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <Calculator className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900">Force Recompute All Scores</div>
                          <div className="text-xs text-gray-500 mt-0.5">Recalculate leaderboard matrix immediately</div>
                        </div>
                      </Button>
                      
                      <Button
                        className="w-full justify-start gap-4 h-16 p-4 rounded-xl border border-green-200 hover:border-green-300 shadow-sm bg-white hover:bg-green-50"
                        variant="ghost"
                        onClick={() => activeEvent && publishMutation.mutate({ eventId: activeEvent.id })}
                      >
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <Upload className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-green-700">Publish Results</div>
                          <div className="text-xs text-green-600/70 mt-0.5">Make the final leaderboard visible to all students</div>
                        </div>
                      </Button>
                      
                      <Button className="w-full justify-start gap-4 h-16 p-4 rounded-xl border border-blue-200 hover:border-blue-300 shadow-sm bg-white hover:bg-blue-50" variant="ghost">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-blue-700">Export Full CSV Report</div>
                          <div className="text-xs text-blue-600/70 mt-0.5">Download all data for external systems</div>
                        </div>
                      </Button>
                      
                      <Separator className="my-6" />
                      
                      <Button className="w-full justify-start gap-4 h-16 p-4 rounded-xl border border-red-200 hover:border-red-300 shadow-sm bg-white hover:bg-red-50" variant="ghost">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-red-700">Danger Zone: Purge Event</div>
                          <div className="text-xs text-red-600/70 mt-0.5">Permanently delete current event data</div>
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
              
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
