import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error(listError); return;
  }
  const user = users.users.find(u => u.email === "admin@skillhunt.com");
  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      password: "Password123!"
    });
    if (error) {
      console.error("Error confirming:", error.message);
    } else {
      console.log("Confirmed user!", data.user.email);
    }
  } else {
    console.log("User not found in list.");
  }
}
run();
