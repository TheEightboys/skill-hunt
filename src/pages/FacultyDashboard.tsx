import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, Star, ClipboardCheck, ArrowRight, BarChart3, Clock, ShieldCheck } from "lucide-react";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const { user, isLoading, refresh } = useAuth({ redirectOnUnauthenticated: false });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const utils = trpc.useUtils();
  
  // Handle authentication and faculty checks
  React.useEffect(() => {
    if (!isLoading && !user) {
      // Redirect unauthenticated users to login
      navigate("/login");
      return;
    }
  }, [isLoading, user, navigate]);
  
  // Redirect non-faculty users away from faculty dashboard
  React.useEffect(() => {
    if (!isLoading && user) {
      // Check if user is intended to be faculty (has profile OR signed up as faculty)
      const isIntendedFaculty = user.facultyProfile || ((user as any).raw_user_meta_data?.user_type === "faculty");
      
      if (!isIntendedFaculty && user.role !== "admin") {
        // Not intended faculty, redirect to dashboard
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsRedirecting(true);
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isLoading, user, navigate]);
  
  const [name, setName] = useState(user?.name || "");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState<any>("assistant_professor");

  const applyMutation = trpc.auth.applyFaculty.useMutation({
    onSuccess: () => {
      refresh();
      utils.invalidate();
    },
  });

  const { data: activeEvent } = trpc.event.active.useQuery();
  const { data: reviewableProjects } = trpc.review.reviewableProjects.useQuery(
    { eventId: activeEvent?.id ?? 0 },
    { enabled: !!activeEvent },
  );
  const { data: myReviews } = trpc.review.forFaculty.useQuery(undefined, {
    enabled: !!user?.facultyProfile?.verifiedByAdmin,
  });

  const submittedCount = myReviews?.filter((r) => r.status === "submitted").length ?? 0;
  const draftCount = myReviews?.filter((r) => r.status === "draft").length ?? 0;
  const totalProjects = reviewableProjects?.length ?? 0;
  const progress = totalProjects > 0 ? (submittedCount / totalProjects) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prevent rendering during redirect
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not faculty
  if (user && !user.facultyProfile && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Apply for Faculty Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                placeholder="Dr. Jane Smith" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input 
                placeholder="e.g. Computer Science" 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="vice_chancellor">Vice Chancellor</option>
                <option value="dean">Dean</option>
                <option value="hod">HOD</option>
                <option value="professor">Professor</option>
                <option value="associate_professor">Associate Professor</option>
                <option value="assistant_professor">Assistant Professor</option>
              </select>
            </div>
            <Button 
              className="w-full mt-2" 
              disabled={applyMutation.isPending || !department || !name}
              onClick={() => applyMutation.mutate({ name, department, designation })}
            >
              Submit Application
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is faculty but not verified
  if (user && user.facultyProfile && !user.facultyProfile.verifiedByAdmin && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 space-y-4">
            <ShieldCheck className="w-16 h-16 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold">Pending Verification</h2>
            <p className="text-gray-500">
              Your application for faculty access is currently being reviewed by an administrator.
              You will be able to review projects once verified.
            </p>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
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
            <span className="font-bold text-lg text-[#0F2A4A]">Faculty Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            {activeEvent && (
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                Reviewing: {activeEvent.name}
              </Badge>
            )}
            
            {/* Show Request Access button for faculty who signed up but haven't applied */}
            {!user?.facultyProfile && (user as any)?.raw_user_meta_data?.user_type === "faculty" && (
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                Request Faculty Access
              </Button>
            )}
            
            <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")}>
              Exit Dashboard
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/projects")}>
              All Projects
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F2A4A] mb-2">Faculty Review Center</h1>
          <p className="text-gray-600">
            {activeEvent ? activeEvent.name : "No active event"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">To Review</p>
                  <p className="font-semibold text-lg">{totalProjects - submittedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="font-semibold text-lg">{submittedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Drafts</p>
                  <p className="font-semibold text-lg">{draftCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Progress</p>
                  <p className="font-semibold text-lg">{progress.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Review Progress</p>
              <p className="text-sm text-gray-500">{submittedCount} of {totalProjects} projects reviewed</p>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects to Review */}
          <div>
            <h2 className="text-xl font-bold text-[#0F2A4A] mb-4">Projects to Review</h2>
            {reviewableProjects && reviewableProjects.length > 0 ? (
              <div className="space-y-3">
                {reviewableProjects
                  .filter((p) => !myReviews?.some((r) => r.projectId === p.id && r.status === "submitted"))
                  .map((project) => (
                    <Card
                      key={project.id}
                      className="cursor-pointer hover:shadow-md transition-all"
                      onClick={() => navigate(`/review/${project.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-[#0F2A4A]">{project.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{project.abstract}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">{project.category}</Badge>
                              {project.previewStatus === "live" && (
                                <Badge className="bg-green-100 text-green-700 text-xs">Live</Badge>
                              )}
                            </div>
                          </div>
                          <Button size="sm" className="bg-[#0F2A4A] shrink-0">
                            Review
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No projects available for review</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* My Reviews */}
          <div>
            <h2 className="text-xl font-bold text-[#0F2A4A] mb-4">My Reviews</h2>
            {myReviews && myReviews.length > 0 ? (
              <div className="space-y-3">
                {myReviews.map((review) => (
                  <Card
                    key={review.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => navigate(`/review/${review.projectId}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-[#0F2A4A]">{review.project?.title}</h3>
                          <p className="text-xs text-gray-500">{review.project?.event?.name}</p>
                        </div>
                        <Badge variant={review.status === "submitted" ? "default" : "secondary"}>
                          {review.status}
                        </Badge>
                      </div>
                      {review.computedWeightedScore && (
                        <p className="text-sm text-gray-500 mt-2">
                          Score: {parseFloat(review.computedWeightedScore).toFixed(1)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reviews submitted yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
