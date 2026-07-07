import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, Code2, ArrowRight, ChevronRight, Star, GitBranch, ExternalLink, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: activeEvent } = trpc.event.active.useQuery();
  const { data: projects } = trpc.project.list.useQuery(
    activeEvent ? { eventId: activeEvent.id } : undefined,
  );
  const { data: leaderboard } = trpc.leaderboard.public.useQuery(
    activeEvent ? { eventId: activeEvent.id } : { eventId: 0 },
    { enabled: !!activeEvent && activeEvent.status === "published" },
  );

  const topProjects = leaderboard?.slice(0, 3) ?? [];
  const featuredProjects = projects?.slice(0, 4) ?? [];

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F2A4A] flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[#0F2A4A]">Skill Hunt University</span>
          </div>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/projects" className="text-sm text-gray-600 hover:text-[#0F2A4A] transition-colors">Browse Projects</a>
            <a href="/leaderboard" className="text-sm text-gray-600 hover:text-[#0F2A4A] transition-colors">Leaderboard</a>
            {isAuthenticated ? (
              <Button size="sm" onClick={() => navigate("/dashboard")} className="bg-[#0F2A4A]">
                Dashboard
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate("/login")} className="bg-[#0F2A4A]">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#0F2A4A]">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-left text-[#0F2A4A] font-bold">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <a href="/projects" className="text-base text-gray-600 hover:text-[#0F2A4A] transition-colors">Browse Projects</a>
                  <a href="/leaderboard" className="text-base text-gray-600 hover:text-[#0F2A4A] transition-colors">Leaderboard</a>
                  <div className="pt-4 border-t border-gray-100">
                    {isAuthenticated ? (
                      <Button className="w-full bg-[#0F2A4A]" onClick={() => navigate("/dashboard")}>
                        Dashboard
                      </Button>
                    ) : (
                      <Button className="w-full bg-[#0F2A4A]" onClick={() => navigate("/login")}>
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative overflow-hidden bg-[#0F2A4A] text-white"
        style={{ 
          backgroundImage: "url('/hero_background.png')", 
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }}
      >
        <div className="absolute inset-0 bg-[#0F2A4A]/70" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#22B8CF] blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#F5A623] blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div 
            className="max-w-3xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Badge className="mb-4 bg-[#22B8CF]/20 text-[#22B8CF] border-[#22B8CF]/30 hover:bg-[#22B8CF]/30">
              {activeEvent ? activeEvent.name : "2026 Edition"}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Showcase Your
              <span className="text-[#22B8CF]"> CS Project</span> to the World
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Submit your best work, get reviewed by expert faculty, earn peer recognition,
              and climb the leaderboard. The premier project showcase for CS students.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/projects")}
                className="bg-[#22B8CF] hover:bg-[#1da8bc] text-white gap-2"
              >
                Browse Projects
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/leaderboard")}
                className="border-white/30 bg-transparent text-white hover:bg-white/10 gap-2"
              >
                <Trophy className="w-4 h-4" />
                View Leaderboard
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Event Info Cards */}
      {activeEvent && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submission Deadline</p>
                    <p className="font-semibold text-[#0F2A4A]">
                      {activeEvent.submissionDeadline
                        ? new Date(activeEvent.submissionDeadline).toLocaleDateString()
                        : "TBA"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Projects Submitted</p>
                    <p className="font-semibold text-[#0F2A4A]">{projects?.length ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold text-[#0F2A4A] capitalize">
                      {activeEvent.status?.replace(/_/g, " ") ?? "Draft"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#0F2A4A] mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Four simple steps from submission to recognition
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Code2, title: "Submit", desc: "Submit your project with GitHub repo, preview link, and screenshots" },
            { icon: Star, title: "Faculty Review", desc: "Expert faculty evaluate your work using a comprehensive rubric" },
            { icon: Users, title: "Peer Voting", desc: "Students vote for their favorite projects (one vote per person)" },
            { icon: Trophy, title: "Results", desc: "Final scores are published on the public leaderboard" },
          ].map((step, i) => (
            <div key={i} className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[#0F2A4A]/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0F2A4A] transition-colors">
                <step.icon className="w-8 h-8 text-[#0F2A4A] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-[#0F2A4A] mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-[#0F2A4A] mb-2">Featured Projects</h2>
                <p className="text-gray-600">Check out the amazing work from our students</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/projects")}
                className="hidden md:flex gap-2 border-[#0F2A4A] text-[#0F2A4A]"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="group cursor-pointer hover:shadow-xl transition-all border-0 shadow-md overflow-hidden"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="h-40 bg-gradient-to-br from-[#0F2A4A] to-[#22B8CF] flex items-center justify-center">
                    <Code2 className="w-12 h-12 text-white/30" />
                  </div>
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {project.category ?? "Project"}
                    </Badge>
                    <h3 className="font-semibold text-[#0F2A4A] mb-1 line-clamp-1 group-hover:text-[#22B8CF] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.abstract}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {project.githubUrl && (
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {project.githubCommitCount ?? 0} commits
                        </span>
                      )}
                      {project.previewUrl && (
                        <span className="flex items-center gap-1 text-green-500">
                          <ExternalLink className="w-3 h-3" />
                          Live
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top 3 Leaderboard */}
      {topProjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0F2A4A] mb-2">Top Projects</h2>
            <p className="text-gray-600">The best projects from this year's showcase</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topProjects.map((entry, idx) => (
              <Card
                key={entry.projectId}
                className={`border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all ${
                  idx === 0 ? "ring-2 ring-[#F5A623]" : ""
                }`}
                onClick={() => navigate(`/projects/${entry.projectId}`)}
              >
                <div className={`h-2 ${
                  idx === 0 ? "bg-[#F5A623]" : idx === 1 ? "bg-gray-400" : "bg-amber-700"
                }`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-gray-200">#{idx + 1}</span>
                    {entry.hasPeoplesChoice && (
                      <Badge className="bg-[#F5A623] text-white">
                        People's Choice
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-[#0F2A4A] mb-2">{entry.project?.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{entry.project?.abstract}</p>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-400">Final Score</p>
                      <p className="text-2xl font-bold text-[#0F2A4A]">
                        {entry.finalScore ? parseFloat(entry.finalScore).toFixed(1) : "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Faculty</p>
                      <p className="font-semibold text-gray-600">
                        {entry.facultyScore ? parseFloat(entry.facultyScore).toFixed(1) : "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Empty state for leaderboard */}
      {(!leaderboard || leaderboard.length === 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">Leaderboard Coming Soon</h2>
            <p className="text-gray-500">Results will be published after faculty reviews are complete.</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#0F2A4A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#22B8CF] flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">Skill Hunt University</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-300">
              <a href="/projects" className="hover:text-white transition-colors">Projects</a>
              <a href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</a>
              <a href="/login" className="hover:text-white transition-colors">Sign In</a>
            </div>
            <p className="text-sm text-gray-400">
              &copy; 2026 Skill Hunt University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
