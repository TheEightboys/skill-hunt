import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Code2 } from "lucide-react";

interface TeamMember {
  name: string;
  email: string;
  isLeader: boolean;
}

export default function SubmitProject() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editId = id ? parseInt(id) : undefined;
  useAuth({ redirectOnUnauthenticated: true });

  const { data: activeEvent } = trpc.event.active.useQuery();
  const { data: existingProject } = trpc.project.byId.useQuery(
    { id: editId ?? 0 },
    { enabled: !!editId },
  );

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [tags, setTags] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{ name: "", email: "", isLeader: true }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const utils = trpc.useUtils();
  const createMutation = trpc.project.create.useMutation({
    onSuccess: () => {
      utils.project.myProject.invalidate();
      navigate("/dashboard");
    },
  });
  const updateMutation = trpc.project.update.useMutation({
    onSuccess: () => {
      utils.project.myProject.invalidate();
      navigate("/dashboard");
    },
  });

  // Prefill form when editing
  useState(() => {
    if (existingProject) {
      setTitle(existingProject.title);
      setAbstract(existingProject.abstract ?? "");
      setCategory(existingProject.category ?? "");
      setDepartment(existingProject.department ?? "");
      setGithubUrl(existingProject.githubUrl ?? "");
      setPreviewUrl(existingProject.previewUrl ?? "");
    }
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!abstract.trim()) newErrors.abstract = "Abstract is required";
    if (!category.trim()) newErrors.category = "Category is required";
    if (!githubUrl.trim()) newErrors.githubUrl = "GitHub URL is required";
    else if (!githubUrl.includes("github.com")) newErrors.githubUrl = "Valid GitHub URL required";
    if (teamMembers.filter((m) => m.name.trim()).length === 0) {
      newErrors.team = "At least one team member required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !activeEvent) return;

    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const validMembers = teamMembers.filter((m) => m.name.trim());

    if (editId) {
      updateMutation.mutate({
        id: editId,
        title,
        abstract,
        category,
        department,
        githubUrl,
        previewUrl,
        teamMembers: validMembers,
        tags: tagList,
      });
    } else {
      createMutation.mutate({
        eventId: activeEvent.id,
        title,
        slug,
        abstract,
        category,
        department,
        githubUrl,
        previewUrl,
        teamMembers: validMembers,
        tags: tagList,
      });
    }
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", email: "", isLeader: false }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string | boolean) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMsg = createMutation.error?.message || updateMutation.error?.message;

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#0F2A4A] mb-2">
          {editId ? "Edit Project" : "Submit Project"}
        </h1>
        <p className="text-gray-600 mb-8">
          {activeEvent ? `${activeEvent.name}` : "Fill in your project details below"}
        </p>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your project title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div>
                <Label htmlFor="abstract">Abstract / Description *</Label>
                <Textarea
                  id="abstract"
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Describe your project in detail"
                  rows={4}
                  className={errors.abstract ? "border-red-500" : ""}
                />
                {errors.abstract && <p className="text-xs text-red-500 mt-1">{errors.abstract}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Web App, Mobile, ML"
                    className={errors.category ? "border-red-500" : ""}
                  />
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. CS, SE, AI"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="github">GitHub Repository URL *</Label>
                <Input
                  id="github"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className={errors.githubUrl ? "border-red-500" : ""}
                />
                {errors.githubUrl && <p className="text-xs text-red-500 mt-1">{errors.githubUrl}</p>}
              </div>
              <div>
                <Label htmlFor="preview">Live Preview URL (optional)</Label>
                <Input
                  id="preview"
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  placeholder="https://your-demo.vercel.app"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tech Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="React, Node.js, Python, TensorFlow"
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.team && <p className="text-xs text-red-500">{errors.team}</p>}
              {teamMembers.map((member, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Name *</Label>
                        <Input
                          value={member.name}
                          onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                          placeholder="Team member name"
                          size={1}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input
                          value={member.email}
                          onChange={(e) => updateTeamMember(index, "email", e.target.value)}
                          placeholder="email@university.edu"
                          size={1}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    {member.isLeader && (
                      <Badge variant="secondary" className="shrink-0">Leader</Badge>
                    )}
                    {teamMembers.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => removeTeamMember(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTeamMember} className="w-full">
                <Plus className="w-4 h-4 mr-1" />
                Add Team Member
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#0F2A4A] hover:bg-[#1a3a5f] px-8"
              size="lg"
            >
              {isSubmitting ? "Saving..." : editId ? "Update Project" : "Submit Project"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")} size="lg">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
