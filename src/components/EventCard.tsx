import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Upload, Eye, Trophy, Check, Clock, AlertCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

interface EventCardProps {
  event: any;
  showRegistration?: boolean;
  compact?: boolean;
}

export function EventCard({ event, showRegistration = false, compact = false }: EventCardProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: registrations } = trpc.event.myRegistrations.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: registrationCount } = trpc.event.registrationCount.useQuery({ eventId: event.id });
  
  const registerMutation = trpc.event.register.useMutation({
    onSuccess: () => {
      utils.event.myRegistrations.invalidate();
      utils.event.registrationCount.invalidate();
    },
  });
  
  const unregisterMutation = trpc.event.unregister.useMutation({
    onSuccess: () => {
      utils.event.myRegistrations.invalidate();
      utils.event.registrationCount.invalidate();
    },
  });

  const isRegistered = registrations?.some(e => e.id === event.id) ?? false;

  // Date-based status calculation
  const now = new Date();
  const submissionDeadline = event.submissionDeadline ? new Date(event.submissionDeadline) : null;
  const reviewDeadline = event.reviewDeadline ? new Date(event.reviewDeadline) : null;
  const votingStart = event.votingStartAt ? new Date(event.votingStartAt) : null;
  const registrationStart = event.registrationStartAt ? new Date(event.registrationStartAt) : null;

  // Determine current phase based on dates and status
  const getCurrentPhase = () => {
    if (event.isCompleted) return { label: "COMPLETED", color: "bg-gray-500", icon: Check };
    if (event.status === "published") return { label: "RESULTS PUBLISHED", color: "bg-green-600", icon: Trophy };
    
    if (submissionDeadline && now < submissionDeadline && event.status === "submission_open") {
      return { label: "SUBMISSION OPEN", color: "bg-blue-600", icon: Upload };
    }
    
    if (submissionDeadline && now >= submissionDeadline && reviewDeadline && now < reviewDeadline) {
      return { label: "REVIEW & VOTING", color: "bg-purple-600", icon: Eye };
    }
    
    if (event.status === "registration_open" || (registrationStart && now >= registrationStart && (!submissionDeadline || now < submissionDeadline))) {
      return { label: "REGISTRATION OPEN", color: "bg-cyan-600", icon: Users };
    }
    
    if (event.status === "results_ready") {
      return { label: "RESULTS PENDING", color: "bg-amber-600", icon: Clock };
    }
    
    return { label: "UPCOMING", color: "bg-gray-400", icon: Calendar };
  };

  const currentPhase = getCurrentPhase();
  const Icon = currentPhase.icon;

  // Timeline items with date-based status
  const getTimelineItems = () => {
    const items = [];
    
    if (registrationStart) {
      items.push({
        label: "Registration Opens",
        date: registrationStart,
        status: now >= registrationStart ? "completed" : "upcoming",
        icon: Users,
      });
    }
    
    if (submissionDeadline) {
      items.push({
        label: "Submission Deadline",
        date: submissionDeadline,
        status: now >= submissionDeadline ? "completed" : now >= (registrationStart || new Date(0)) ? "current" : "upcoming",
        icon: Upload,
      });
    }
    
    if (reviewDeadline) {
      items.push({
        label: "Review Deadline",
        date: reviewDeadline,
        status: now >= reviewDeadline ? "completed" : now >= (submissionDeadline || new Date(0)) ? "current" : "upcoming",
        icon: Eye,
      });
    }
    
    if (votingStart) {
      items.push({
        label: "Voting Opens",
        date: votingStart,
        status: now >= votingStart ? "completed" : "upcoming",
        icon: Trophy,
      });
    }
    
    return items;
  };

  const timelineItems = getTimelineItems();

  const handleRegistrationToggle = () => {
    if (isRegistered) {
      unregisterMutation.mutate({ eventId: event.id });
    } else {
      registerMutation.mutate({ eventId: event.id });
    }
  };

  if (compact) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${currentPhase.color} text-white font-semibold text-xs`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {currentPhase.label}
                </Badge>
                {event.isActive && (
                  <Badge variant="outline" className="border-green-500 text-green-700 text-xs">
                    ACTIVE EVENT
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{event.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {registrationCount ?? 0} registered
              </div>
              {submissionDeadline && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {submissionDeadline.toLocaleDateString()}
                </div>
              )}
            </div>
            {showRegistration && isAuthenticated && (
              <Button
                size="sm"
                variant={isRegistered ? "outline" : "default"}
                onClick={handleRegistrationToggle}
                disabled={registerMutation.isPending || unregisterMutation.isPending}
              >
                {isRegistered ? "Unregister" : "Register"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${currentPhase.color} text-white font-semibold`}>
                <Icon className="w-4 h-4 mr-1" />
                {currentPhase.label}
              </Badge>
              {event.isActive && (
                <Badge variant="outline" className="border-green-500 text-green-700">
                  ACTIVE EVENT
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl mb-2">{event.name}</CardTitle>
            <p className="text-gray-600">{event.description}</p>
          </div>
        </div>

        {showRegistration && isAuthenticated && (
          <div className="mt-4">
            <Button
              className="w-full"
              variant={isRegistered ? "outline" : "default"}
              onClick={handleRegistrationToggle}
              disabled={registerMutation.isPending || unregisterMutation.isPending}
            >
              {isRegistered ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Registered - Click to Unregister
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Register for this Event
                </>
              )}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Users className="w-4 h-4" />
                Registrations
              </div>
              <div className="text-2xl font-bold text-[#0F2A4A]">{registrationCount ?? 0}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Trophy className="w-4 h-4" />
                Status
              </div>
              <div className="text-sm font-semibold text-[#0F2A4A] capitalize">
                {event.status.replace(/_/g, " ")}
              </div>
            </div>
          </div>

          {/* Timeline */}
          {timelineItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Timeline</h4>
              <div className="space-y-2">
                {timelineItems.map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : item.status === "current"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">
                          {item.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      {item.status === "current" && (
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
