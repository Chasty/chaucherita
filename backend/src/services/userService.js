const supabase = require("../config/supabaseClient");

exports.getAllUsers = async () => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;
  return data;
};

exports.createUser = async (userData) => {
  const { data, error } = await supabase
    .from("users")
    .insert([userData])
    .select()
    .single();
  if (error) throw error;
  return data;
};
