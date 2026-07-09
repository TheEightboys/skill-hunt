import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface Milestone {
  label: string;
  date: Date | null;
  status: "pending" | "active" | "completed";
  daysRemaining?: number;
}

interface EventMilestoneWidgetProps {
  eventName: string;
  currentPhase: string;
  milestones: Milestone[];
  isCompleted?: boolean;
}

export function EventMilestoneWidget({
  eventName,
  currentPhase,
  milestones,
  isCompleted = false,
}: EventMilestoneWidgetProps) {
  const activeMilestone = milestones.find((m) => m.status === "active");
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const progressPercent = (completedCount / milestones.length) * 100;

  // Upcoming deadlines (next 3 days)
  const upcomingDeadlines = milestones
    .filter((m) => m.daysRemaining !== undefined && m.daysRemaining <= 3 && m.daysRemaining > 0)
    .sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-700";
      case "active":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "active":
        return <Calendar className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#0F2A4A] to-[#1d3d63] text-white pb-4">
          <div className="space-y-3">
            <div>
              <CardTitle className="text-lg mb-1">{eventName}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-0 capitalize">
                  {currentPhase}
                </Badge>
                {isCompleted && (
                  <Badge className="bg-gray-500 text-white border-0">Completed</Badge>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/90">Overall Progress</span>
                <span className="font-semibold">{completedCount} of {milestones.length}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Upcoming Deadlines Alert */}
          {upcomingDeadlines.length > 0 && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Upcoming Deadline!</strong> {upcomingDeadlines[0].label} in{" "}
                <span className="font-bold">{upcomingDeadlines[0].daysRemaining} day(s)</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Milestones Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Event Timeline</h3>
            <div className="space-y-2">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {/* Status Indicator */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(milestone.status)}`}
                  >
                    {getStatusIcon(milestone.status)}
                  </div>

                  {/* Milestone Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{milestone.label}</p>
                      {milestone.daysRemaining === 0 && milestone.status === "pending" && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                          TODAY
                        </Badge>
                      )}
                    </div>
                    {milestone.date && (
                      <p className="text-xs text-gray-500">
                        {milestone.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {milestone.daysRemaining !== undefined && milestone.daysRemaining > 0 && (
                          <span className="ml-2">
                            ({milestone.daysRemaining} day{milestone.daysRemaining !== 1 ? "s" : ""} remaining)
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <Badge variant="outline" className="text-xs capitalize">
                    {milestone.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0F2A4A]">{completedCount}</div>
              <div className="text-xs text-gray-600">Phases Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {activeMilestone ? "1" : "0"}
              </div>
              <div className="text-xs text-gray-600">Active Phase</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {milestones.length - completedCount}
              </div>
              <div className="text-xs text-gray-600">Upcoming</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
