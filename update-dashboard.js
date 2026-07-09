import fs from "fs";
import path from "path";

const filepath = path.join(process.cwd(), "src/pages/Dashboard.tsx");
let content = fs.readFileSync(filepath, "utf8");

const adminButton = `
            {user?.role === "admin" && (
              <Button size="sm" onClick={() => navigate("/admin")} className="bg-[#0F2A4A]">
                Admin Panel
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => navigate("/projects")}>
`;

content = content.replace(/<Button size="sm" variant="outline" onClick=\{\(\) => navigate\("\/projects"\)\}>/, adminButton);

fs.writeFileSync(filepath, content);
console.log("Updated Dashboard.tsx");
