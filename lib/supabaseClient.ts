import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing environment variables for Supabase configuration");
}

console.log("Initializing Supabase client with URL:", supabaseUrl);
export const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection
supabase
  .from("knowledges")
  .select("*")
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error("Error testing Supabase connection:", error);
    } else {
      console.log("Supabase connection test successful:", data);
    }
  });
