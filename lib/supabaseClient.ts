import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("test_tabela")
      .select("count", { count: "exact" });
    if (error) throw error;
    console.log("Supabase connection test successful:", data);
  } catch (error) {
    console.error("Error testing Supabase connection:", error);
  }
};

testConnection();

// Function to fetch test_tabela entries
export const fetchTestTabela = async (userId: string) => {
  const { data, error } = await supabase
    .from("test_tabela")
    .select("*")
    .eq("userId", userId);

  if (error) {
    console.error("Error fetching test_tabela:", error);
    throw error;
  }

  return data;
};

// Function to create a new test_tabela entry
export const createTestTabelaEntry = async (
  userId: string,
  content: string,
  metadata: any
) => {
  const { data, error } = await supabase
    .from("test_tabela")
    .insert([{ userId, content, metadata }])
    .select();

  if (error) {
    console.error("Error creating test_tabela entry:", error);
    throw error;
  }

  return data[0];
};

// Function to update a test_tabela entry
export const updateTestTabelaEntry = async (
  id: string,
  updates: { content?: string; metadata?: any }
) => {
  const { data, error } = await supabase
    .from("test_tabela")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating test_tabela entry:", error);
    throw error;
  }

  return data[0];
};

// Function to delete a test_tabela entry
export const deleteTestTabelaEntry = async (id: string) => {
  const { error } = await supabase.from("test_tabela").delete().eq("id", id);

  if (error) {
    console.error("Error deleting test_tabela entry:", error);
    throw error;
  }
};
