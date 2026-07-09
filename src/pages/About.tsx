import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code2, Users, Trophy, Lightbulb, CheckCircle, ArrowRight } from "lucide-react";

export default function About() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Lightbulb,
      title: "Fair Evaluation",
      description: "Transparent and unbiased assessment using weighted scoring from expert faculty and peer votes.",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      icon: Users,
      title: "Expert Faculty",
      description: "Experienced professors and industry experts evaluate projects based on innovation and execution.",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Trophy,
      title: "Recognition",
      description: "Top projects receive recognition and opportunities to showcase their work to industry partners.",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: Code2,
      title: "Technical Excellence",
      description: "Projects evaluated on code quality, design, innovation, and practical applicability.",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const steps = [
    { number: 1, title: "Register", description: "Create an account and join as a student or faculty member." },
    { number: 2, title: "Submit", description: "Submit your CS project with detailed documentation and demo link." },
    { number: 3, title: "Review", description: "Faculty experts review and evaluate your project thoroughly." },
    { number: 4, title: "Vote", description: "Students vote for their favorite projects in the peer voting phase." },
    { number: 5, title: "Results", description: "Final rankings published with detailed feedback from reviewers." },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-[#0F2A4A] flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[#0F2A4A]">Skill Hunt University</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/")} className="text-[#0F2A4A]">
              ← Back to Home
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0F2A4A] to-[#0F2A4A]/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About Skill Hunt</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            A transparent platform for Computer Science students to showcase projects, receive expert feedback, and compete fairly with their peers.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => navigate("/register")}
              className="bg-[#22B8CF] hover:bg-[#1da8bc] text-[#0F2A4A] font-bold"
              size="lg"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-[#0F2A4A] mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              Skill Hunt provides a fair and transparent platform where Computer Science students can showcase their projects and get evaluated by expert faculty members. We believe in recognizing excellence while providing constructive feedback to help students grow.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our platform combines expert faculty evaluation with peer voting, ensuring that the best projects are recognized and celebrated. Every student deserves a fair chance to shine.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#22B8CF] to-[#0F2A4A] rounded-2xl p-8 text-white">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Transparent Evaluation</h3>
                  <p className="text-sm text-gray-200">Clear rubrics and weighted scoring for fair assessment</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Expert Feedback</h3>
                  <p className="text-sm text-gray-200">Detailed reviews from experienced faculty members</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Community Involvement</h3>
                  <p className="text-sm text-gray-200">Peer voting ensures student voices are heard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0F2A4A] mb-4">Key Features</h2>
            <p className="text-xl text-gray-600">What makes Skill Hunt the best platform for project showcases</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F2A4A] mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0F2A4A] mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Simple steps to showcase your project</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <Card className="border-none shadow-md h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#0F2A4A] text-white flex items-center justify-center font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-[#0F2A4A] mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </CardContent>
              </Card>
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-[#22B8CF]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#0F2A4A] to-[#22B8CF] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Showcase Your Project?</h2>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Join hundreds of students who have already showcased their work on Skill Hunt. Register now and submit your first project.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              onClick={() => navigate("/register")}
              className="bg-white text-[#0F2A4A] hover:bg-gray-100 font-bold"
              size="lg"
            >
              Register as Student
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => navigate("/faculty")}
              variant="outline"
              className="border-white text-black font-bold"
              size="lg"
            >
              Join as Faculty
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>&copy; 2026 Skill Hunt University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
