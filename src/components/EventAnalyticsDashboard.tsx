import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, Trophy, FileText, Eye, Vote, TrendingUp } from "lucide-react";

interface EventAnalytics {
  eventId: number;
  eventName: string;
  status: string;
  
  // Registration
  totalRegistrations: number;
  registrationsOverTime?: { date: string; count: number }[];
  
  // Submissions
  totalProjects: number;
  submittedProjects: number;
  submissionRate: number;
  
  // Faculty Reviews
  totalReviewsRequired: number;
  reviewsCompleted: number;
  reviewsInProgress: number;
  reviewCompletionRate: number;
  
  // Voting
  totalVotesCast: number;
  uniqueVoters: number;
  votingRate: number;
  
  // Engagement
  departmentDistribution: { department: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
}

interface EventAnalyticsDashboardProps {
  analytics: EventAnalytics;
}

export function EventAnalyticsDashboard({ analytics }: EventAnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F2A4A]">{analytics.eventName}</h2>
          <p className="text-sm text-gray-600 mt-1">Event Analytics & Metrics</p>
        </div>
        <Badge className="bg-blue-50 text-blue-700 border-0 capitalize">
          {analytics.status.replace(/_/g, " ")}
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Registrations */}
        <Card className="border-none shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyan-400 to-cyan-600" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Users className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-xs font-semibold text-gray-500">REGISTRATIONS</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.totalRegistrations}</div>
            <p className="text-xs text-gray-600">Students registered for event</p>
          </CardContent>
        </Card>

        {/* Submissions */}
        <Card className="border-none shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-gray-500">SUBMISSIONS</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {analytics.submittedProjects}/{analytics.totalProjects}
            </div>
            <div className="flex items-center gap-2">
              <Progress value={analytics.submissionRate} className="flex-1 h-1" />
              <span className="text-xs font-semibold text-gray-600">{analytics.submissionRate}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card className="border-none shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-gray-500">REVIEWS</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {analytics.reviewsCompleted}/{analytics.totalReviewsRequired}
            </div>
            <div className="flex items-center gap-2">
              <Progress value={analytics.reviewCompletionRate} className="flex-1 h-1" />
              <span className="text-xs font-semibold text-gray-600">{analytics.reviewCompletionRate}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Voting */}
        <Card className="border-none shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Vote className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-gray-500">VOTES</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{analytics.totalVotesCast}</div>
            <p className="text-xs text-gray-600">{analytics.uniqueVoters} unique voters</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Progress */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Faculty Review Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completed Reviews</span>
                <span className="text-sm font-bold text-gray-900">{analytics.reviewsCompleted}</span>
              </div>
              <Progress value={(analytics.reviewsCompleted / analytics.totalReviewsRequired) * 100} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">In Progress</span>
                <span className="text-sm font-bold text-gray-900">{analytics.reviewsInProgress}</span>
              </div>
              <Progress value={(analytics.reviewsInProgress / analytics.totalReviewsRequired) * 100} />
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                      style={{ width: `${analytics.reviewCompletionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-purple-600">{analytics.reviewCompletionRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Analysis */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Submission Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{analytics.submittedProjects}</div>
                <div className="text-xs text-gray-600">Projects Submitted</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">
                  {analytics.totalProjects - analytics.submittedProjects}
                </div>
                <div className="text-xs text-gray-600">Pending Submissions</div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Submission Rate</span>
                <span className="text-sm font-bold text-gray-900">{analytics.submissionRate}%</span>
              </div>
              <Progress value={analytics.submissionRate} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        {analytics.departmentDistribution.length > 0 && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Department Distribution</CardTitle>
              <CardDescription>Projects by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.departmentDistribution.map((dept, idx) => {
                  const maxCount = Math.max(...analytics.departmentDistribution.map((d) => d.count));
                  const percentage = (dept.count / maxCount) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{dept.department}</span>
                        <span className="text-sm font-bold text-gray-900">{dept.count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Distribution */}
        {analytics.categoryDistribution.length > 0 && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Category Distribution</CardTitle>
              <CardDescription>Projects by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.categoryDistribution.map((cat, idx) => {
                  const maxCount = Math.max(...analytics.categoryDistribution.map((c) => c.count));
                  const percentage = (cat.count / maxCount) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                        <span className="text-sm font-bold text-gray-900">{cat.count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Voting Engagement */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-green-600" />
            Peer Voting Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-sm text-gray-600 mb-1">Total Votes Cast</div>
              <div className="text-3xl font-bold text-green-700">{analytics.totalVotesCast}</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">Unique Voters</div>
              <div className="text-3xl font-bold text-blue-700">{analytics.uniqueVoters}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-sm text-gray-600 mb-1">Voting Rate</div>
              <div className="text-3xl font-bold text-purple-700">{analytics.votingRate}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
