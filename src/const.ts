export const LOGIN_PATH = "/login";

export const COLORS = {
  primary: "#0F2A4A",
  secondary: "#22B8CF",
  accent: "#F5A623",
  success: "#2F9E44",
  background: "#FAFBFC",
};

export const NAV_LINKS = {
  public: [
    { label: "Home", path: "/" },
    { label: "Projects", path: "/projects" },
    { label: "Leaderboard", path: "/leaderboard" },
  ],
  student: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" },
    { label: "Submit", path: "/submit" },
    { label: "Leaderboard", path: "/leaderboard" },
    { label: "Results", path: "/results" },
  ],
  faculty: [
    { label: "Dashboard", path: "/faculty" },
    { label: "Projects", path: "/projects" },
    { label: "Leaderboard", path: "/leaderboard" },
  ],
  admin: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Admin", path: "/admin" },
    { label: "Projects", path: "/projects" },
    { label: "Leaderboard", path: "/leaderboard" },
  ],
};
