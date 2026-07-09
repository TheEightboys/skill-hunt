export default function Footer() {
  return (
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
  );
}
