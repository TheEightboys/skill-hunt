import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Footer";
import { Code2, Calendar, Trophy, ArrowRight } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("active");

  const { data: activeEvents, isLoading: loadingActive } = trpc.event.activeEvents.useQuery();
  const { data: completedEvents, isLoading: loadingCompleted } = trpc.event.completed.useQuery();
  const { data: myRegistrations } = trpc.event.myRegistrations.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-[#0F2A4A] flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[#0F2A4A]">Events</span>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => navigate("/projects")}>
              Browse Projects
            </Button>
            {isAuthenticated ? (
              <Button size="sm" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate("/login")}>
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F2A4A] mb-2">Events & Competitions</h1>
          <p className="text-gray-600">
            Participate in coding competitions, project showcases, and skill-building events
          </p>
        </div>

        {/* My Registrations */}
        {isAuthenticated && myRegistrations && myRegistrations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0F2A4A]">My Registered Events</h2>
              <span className="text-sm text-gray-500">{myRegistrations.length} event(s)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRegistrations.map((event) => (
                <EventCard key={event.id} event={event} compact />
              ))}
            </div>
          </div>
        )}

        {/* Events Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Active Events
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Previous Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {loadingActive ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80" />
                ))}
              </div>
            ) : activeEvents && activeEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    showRegistration={isAuthenticated}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Events</h3>
                <p className="text-gray-500">Check back soon for upcoming competitions and showcases</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {loadingCompleted ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80" />
                ))}
              </div>
            ) : completedEvents && completedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedEvents.map((event) => (
                  <EventCard key={event.id} event={event} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Completed Events</h3>
                <p className="text-gray-500">Past events will appear here once completed</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        {!isAuthenticated && (
          <div className="mt-12 bg-gradient-to-r from-[#0F2A4A] to-[#1d3d63] rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Ready to Showcase Your Skills?</h2>
            <p className="mb-6 text-gray-200">
              Register now to participate in upcoming events and competitions
            </p>
            <Button
              size="lg"
              className="bg-[#22B8CF] hover:bg-[#1da8bc] text-[#0F2A4A] font-bold"
              onClick={() => navigate("/register")}
            >
              Create Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
