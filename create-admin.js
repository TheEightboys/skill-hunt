import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: "admin@skillhunt.com",
    password: "Password123!",
    email_confirm: true,
  });
  
  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("Success! Created user:", data.user.email);
  }
}
run();
