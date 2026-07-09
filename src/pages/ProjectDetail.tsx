import { useNavigate, useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import { Code2, GitBranch, ExternalLink, Users, ArrowLeft, Vote, Calendar, Star, FileEdit } from "lucide-react";

const SLUG_THUMBNAILS: Record<string, string> = {
  "ai-campus-nav":         "/thumbnails/ai-campus-nav.png",
  "distributed-scheduler": "/thumbnails/distributed-scheduler.png",
  "collab-code-editor":    "/thumbnails/collab-code-editor.png",
  "smart-waste-iot":       "/thumbnails/smart-waste-iot.png",
  "privacy-ml-platform":   "/thumbnails/privacy-ml-platform.png",
};

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id ?? "0");
  const { user, isAuthenticated } = useAuth();

  const { data: project, isLoading } = trpc.project.byId.useQuery({ id: projectId });
  const { data: myVote } = trpc.vote.myVote.useQuery(
    { eventId: project?.eventId ?? 0 },
    { enabled: !!project && isAuthenticated },
  );
  const { data: reviews } = trpc.review.byProject.useQuery(
    { projectId },
    { enabled: !!project },
  );

  const utils = trpc.useUtils();
  const voteMutation = trpc.vote.cast.useMutation({
    onSuccess: () => {
      utils.vote.myVote.invalidate();
    },
  });

  const canVote = project?.event?.status === "review_and_voting_open";
  const isVotedFor = myVote?.projectId === projectId;
  const isOwner = user?.id === project?.ownerUserId;

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F2A4A] flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <Skeleton className="h-96" />
        ) : !project ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">Project not found</p>
          </div>
        ) : (
          <>
            {/* Hero Thumbnail */}
            {(() => {
              const heroImg =
                project.screenshots?.[0]?.fileUrl ??
                (project.slug ? SLUG_THUMBNAILS[project.slug] : undefined);
              return heroImg ? (
                <div className="w-full h-56 md:h-72 rounded-xl overflow-hidden mb-8 shadow-md">
                  <img
                    src={heroImg}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null;
            })()}

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{project.category}</Badge>
                <Badge variant="outline">{project.department}</Badge>
                {project.previewStatus === "live" && (
                  <Badge className="bg-green-100 text-green-700">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                )}
                {project.previewStatus === "down" && (
                  <Badge className="bg-red-100 text-red-700">Down</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-[#0F2A4A] mb-3">{project.title}</h1>
              <p className="text-gray-600 leading-relaxed max-w-3xl">{project.abstract}</p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 transition-colors"
                >
                  <GitBranch className="w-4 h-4" />
                  View Code
                </a>
              )}
              {project.previewUrl && (
                <a
                  href={project.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#22B8CF] text-white text-sm hover:bg-[#1da8bc] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </a>
              )}
              {isAuthenticated && canVote && !isOwner && (
                <Button
                  onClick={() => voteMutation.mutate({ eventId: project.eventId, projectId })}
                  variant={isVotedFor ? "outline" : "default"}
                  disabled={isVotedFor}
                  className={isVotedFor ? "border-[#22B8CF] text-[#22B8CF]" : "bg-[#0F2A4A]"}
                >
                  <Vote className="w-4 h-4 mr-1" />
                  {isVotedFor ? "Voted" : "Vote for This Project"}
                </Button>
              )}
              {isOwner && (
                <Button variant="outline" onClick={() => navigate(`/edit/${project.id}`)}>
                  <FileEdit className="w-4 h-4 mr-1" />
                  Edit Project
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* GitHub Stats */}
                {project.githubUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-[#22B8CF]" />
                        GitHub Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-[#0F2A4A]">{project.githubCommitCount ?? 0}</p>
                          <p className="text-xs text-gray-500">Commits</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-[#0F2A4A]">
                            {project.githubLastCommitAt
                              ? new Date(project.githubLastCommitAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">Last Commit</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              trpc.project.syncGithub.useMutation().mutate({ projectId });
                            }}
                          >
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Faculty Reviews */}
                {reviews && reviews.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#F5A623]" />
                        Faculty Reviews ({reviews.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#0F2A4A] flex items-center justify-center">
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
                            <Badge variant={review.status === "submitted" ? "default" : "secondary"}>
                              {review.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{review.overallComment}</p>
                          {review.scores && review.scores.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {review.scores.map((score) => (
                                <Badge key={score.id} variant="outline" className="text-xs">
                                  {score.criterion?.name}: {score.score}/10
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                {/* Team Members */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#22B8CF]" />
                      Team Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.teamMembers && project.teamMembers.length > 0 ? (
                      <div className="space-y-3">
                        {project.teamMembers.map((member) => (
                          <div key={member.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0F2A4A] flex items-center justify-center">
                              <span className="text-xs text-white font-bold">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {member.name}
                                {member.isLeader && (
                                  <Badge variant="secondary" className="ml-2 text-xs">Leader</Badge>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No team members listed</p>
                    )}
                  </CardContent>
                </Card>

                {/* Tags */}
                {project.tagLinks && project.tagLinks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tech Stack</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.tagLinks.map((link) => (
                          <Badge key={link.tagId} variant="secondary">
                            {link.tag?.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Event Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Event Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{project.event?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {project.event?.status?.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
