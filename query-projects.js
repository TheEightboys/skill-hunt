import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  const { data, error } = await supabase.from("projects").select("*");
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log(`Found ${data.length} projects.`);
    if (data.length > 0) {
      console.log(data);
    }
  }
}
run();
