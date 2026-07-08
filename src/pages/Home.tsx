import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Code2, Users, UploadCloud, ChevronRight, ExternalLink, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data: activeEvent } = trpc.event.active.useQuery();
  
  const { data: leaderboard } = trpc.leaderboard.public.useQuery(
    activeEvent ? { eventId: activeEvent.id } : { eventId: 0 },
    { enabled: !!activeEvent && activeEvent.status === "published" },
  );

  const topProjects = leaderboard?.slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-[#FAFBFC] font-sans">
      {/* Navigation */}
      <nav className="bg-[#0F2A4A] border-b border-[#0F2A4A]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#F5A623] flex items-center justify-center bg-[#0F2A4A] shrink-0">
              <span className="text-[#F5A623] font-bold text-lg leading-none tracking-tighter">SH</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl text-white tracking-wide block leading-tight">SKILL HUNT</span>
              <span className="text-xs text-[#F5A623] font-semibold tracking-[0.2em] uppercase block leading-tight">UNIVERSITY</span>
            </div>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-8">
            <a href="/" className="text-sm font-semibold text-[#22B8CF] border-b-2 border-[#22B8CF] pb-1">Home</a>
            <a href="/projects" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Browse Projects</a>
            <a href="/leaderboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Leaderboard</a>
            <a href="/events" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Events</a>
            <a href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">About</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} className="bg-[#22B8CF] hover:bg-[#1da8bc] text-[#0F2A4A] font-bold rounded-full px-6">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")} className="text-white hover:bg-white/10 rounded-full px-6 border border-white/20">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4"/> Login
                  </span>
                </Button>
                <Button onClick={() => navigate("/register")} className="bg-[#22B8CF] hover:bg-[#1da8bc] text-[#0F2A4A] font-bold rounded-full px-6">
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-[#0F2A4A] text-white border-l-[#1d3d63]">
                <SheetHeader>
                  <SheetTitle className="text-left text-white font-bold">Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                  <a href="/" className="text-lg font-semibold text-[#22B8CF]">Home</a>
                  <a href="/projects" className="text-lg text-gray-300">Browse Projects</a>
                  <a href="/leaderboard" className="text-lg text-gray-300">Leaderboard</a>
                  <a href="/events" className="text-lg text-gray-300">Events</a>
                  <a href="/about" className="text-lg text-gray-300">About</a>
                  <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                    {isAuthenticated ? (
                      <Button className="w-full bg-[#22B8CF] text-[#0F2A4A] rounded-full" onClick={() => navigate("/dashboard")}>
                        Dashboard
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" className="w-full bg-transparent text-white border-white/30 rounded-full" onClick={() => navigate("/login")}>
                          Login
                        </Button>
                        <Button className="w-full bg-[#22B8CF] text-[#0F2A4A] rounded-full" onClick={() => navigate("/register")}>
                          Register
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[#0F2A4A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-[#22B8CF] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <Badge variant="outline" className="text-[#22B8CF] border-[#22B8CF] mb-6 px-4 py-1 text-xs uppercase tracking-wider font-semibold rounded-full bg-[#22B8CF]/10">
              Skill Hunt CS Project Showcase
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-tight">
              Showcase. Evaluate.<br/>
              <span className="text-[#F5A623]">Inspire.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              A fair and transparent platform for students to showcase their CS projects, get evaluated by expert faculty, and compete on a level playing field.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/projects")}
                className="bg-[#22B8CF] hover:bg-[#1da8bc] text-[#0F2A4A] font-bold rounded-full px-8 h-14 text-lg w-full sm:w-auto shadow-lg shadow-[#22B8CF]/20"
              >
                <UploadCloud className="w-5 h-5 mr-2" />
                View Projects
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/leaderboard")}
                className="bg-transparent hover:bg-white/10 text-white border-white/30 rounded-full px-8 h-14 text-lg w-full sm:w-auto"
              >
                <Trophy className="w-5 h-5 mr-2 text-gray-300" />
                View Leaderboard
              </Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center lg:justify-end w-full max-w-lg lg:max-w-none">
            <img src="/hero-illustration.png" alt="Showcase Illustration" className="w-full max-w-xl object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out" />
          </div>
        </div>
      </section>

      {/* Timeline Event Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300 col-span-1 md:col-span-2 lg:col-span-1">
            <div className="h-1 bg-gradient-to-r from-[#0F2A4A] to-[#22B8CF]" />
            <CardContent className="p-5 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#2F9E44]" />
                <span className="text-xs font-bold text-[#2F9E44] uppercase tracking-wider">Active Event</span>
              </div>
              <h3 className="font-bold text-[#0F2A4A] text-lg leading-tight mb-1">{activeEvent?.name || "Spring Showcase 2026"}</h3>
              <p className="text-xs text-gray-500">Organized by School of Computer Science</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-5 flex gap-4 bg-white items-center h-full">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <UploadCloud className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F2A4A] mb-1">Submission Deadline</p>
                <p className="font-bold text-gray-900 text-sm">
                  {activeEvent?.submissionDeadline ? new Date(activeEvent.submissionDeadline).toLocaleDateString() : "TBA"}
                </p>
                <p className="text-xs font-semibold text-[#2F9E44] mt-1 uppercase tracking-wider">Open</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-5 flex gap-4 bg-white items-center h-full">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F2A4A] mb-1">Review Deadline</p>
                <p className="font-bold text-gray-900 text-sm">
                  {activeEvent?.reviewDeadline ? new Date(activeEvent.reviewDeadline).toLocaleDateString() : "TBA"}
                </p>
                <p className="text-xs font-semibold text-purple-600 mt-1 uppercase tracking-wider">Upcoming</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-5 flex gap-4 bg-white items-center h-full">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F2A4A] mb-1">Voting Deadline</p>
                <p className="font-bold text-gray-900 text-sm">
                  {activeEvent?.reviewDeadline ? new Date(activeEvent.reviewDeadline).toLocaleDateString() : "TBA"}
                </p>
                <p className="text-xs font-semibold text-purple-600 mt-1 uppercase tracking-wider">Upcoming</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="p-5 flex gap-4 bg-white items-center h-full">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-[#F5A623]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F2A4A] mb-1">Results Publication</p>
                <p className="font-bold text-gray-900 text-sm">
                  {activeEvent?.submissionDeadline ? new Date(new Date(activeEvent.submissionDeadline).getTime() + 1000*60*60*24*7).toLocaleDateString() : "TBA"}
                </p>
                <p className="text-xs font-semibold text-purple-600 mt-1 uppercase tracking-wider">Upcoming</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Side: Recent Leaderboard Preview */}
          <div className="flex-[2] bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-end mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0F2A4A]/5 flex items-center justify-center text-[#0F2A4A]">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0F2A4A]">Recent Leaderboard (Preview)</h2>
                  <p className="text-sm text-gray-500">Top projects from the last published event</p>
                </div>
              </div>
              <Button variant="link" className="text-[#22B8CF] p-0 h-auto font-semibold" onClick={() => navigate("/leaderboard")}>
                View Full Leaderboard <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-sm font-semibold text-gray-500 w-16 text-center">Rank</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500">Project Name</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500">Team</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500 text-right pr-8">Score</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500 text-center">Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topProjects.length > 0 ? (
                    topProjects.map((entry, idx) => (
                      <tr key={entry.projectId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 text-center">
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm mx-auto shadow-sm ${
                            idx === 0 ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white" : 
                            idx === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" : 
                            idx === 2 ? "bg-gradient-to-br from-amber-700 to-amber-900 text-white" : 
                            "bg-white border border-gray-200 text-gray-500"
                          }`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="py-4 font-semibold text-[#0F2A4A]">{entry.project?.title}</td>
                        <td className="py-4 text-sm text-gray-600">{entry.project?.teamMembers?.map(m => m.name).join(", ")}</td>
                        <td className="py-4 font-bold text-[#0F2A4A] text-right pr-8">{entry.finalScore ? parseFloat(entry.finalScore).toFixed(2) : "-"}</td>
                        <td className="py-4 text-center">
                          {entry.project?.previewUrl ? (
                            <a href={entry.project.previewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex p-2 rounded-lg text-[#22B8CF] hover:bg-[#22B8CF]/10 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        No published leaderboard data available for the active event yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: CTA */}
          <div className="flex-1 bg-gradient-to-b from-blue-50 to-white rounded-3xl p-8 shadow-sm border border-blue-100 flex flex-col items-center justify-center text-center">
            <div className="w-full flex justify-center mb-6">
              <div className="relative">
                <Trophy className="w-24 h-24 text-blue-300 opacity-50" />
                <Users className="w-12 h-12 text-[#22B8CF] absolute bottom-0 right-0 bg-white rounded-full p-1 border-2 border-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#0F2A4A] mb-3">Be Part of Something Great!</h3>
            <p className="text-gray-600 mb-8 max-w-xs leading-relaxed">
              Submit your project, get valuable feedback from expert faculty, and compete for the top spot.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="w-full bg-[#0F2A4A] hover:bg-[#1a3a61] text-white rounded-xl h-14 text-lg font-bold shadow-lg shadow-[#0F2A4A]/20"
            >
              Register Now <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#0F2A4A] flex items-center justify-center bg-white shrink-0">
                <span className="text-[#0F2A4A] font-bold text-xs leading-none tracking-tighter">SH</span>
              </div>
              <span className="font-bold text-lg text-[#0F2A4A]">Skill Hunt University</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
              <a href="/projects" className="hover:text-[#0F2A4A] transition-colors">Browse Projects</a>
              <a href="/leaderboard" className="hover:text-[#0F2A4A] transition-colors">Leaderboard</a>
              <a href="/events" className="hover:text-[#0F2A4A] transition-colors">Events</a>
            </div>
            <p className="text-sm text-gray-400 font-medium">
              &copy; 2026 Skill Hunt University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
