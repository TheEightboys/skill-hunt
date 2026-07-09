import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="bg-[#0F2A4A] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#22B8CF] flex items-center justify-center">
                <span className="text-[#0F2A4A] font-bold text-sm leading-none">SH</span>
              </div>
              <span className="font-bold text-xl">Skill Hunt University</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              A transparent platform where CS students showcase projects, receive expert faculty feedback, and compete fairly through peer voting.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/projects" className="hover:text-[#22B8CF] transition-colors">Browse Projects</Link></li>
              <li><Link to="/leaderboard" className="hover:text-[#22B8CF] transition-colors">Leaderboard</Link></li>
              <li><Link to="/events" className="hover:text-[#22B8CF] transition-colors">Events</Link></li>
              <li><Link to="/about" className="hover:text-[#22B8CF] transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/login" className="hover:text-[#22B8CF] transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-[#22B8CF] transition-colors">Register</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#22B8CF] transition-colors">Student Dashboard</Link></li>
              <li><Link to="/faculty" className="hover:text-[#22B8CF] transition-colors">Faculty Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© 2026 Skill Hunt University. All rights reserved.</p>
          <p className="text-gray-600">CS Project Showcase & Judging Platform</p>
        </div>
      </div>
    </footer>
  );
}
