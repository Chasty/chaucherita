const supabase = require("../config/supabaseClient");

exports.getAll = async (user_id) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user_id)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
};

exports.getById = async (user_id, id) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user_id)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

exports.create = async (user_id, transaction) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert([{ ...transaction, user_id }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

exports.update = async (user_id, id, updates) => {
  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("user_id", user_id)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

exports.remove = async (user_id, id) => {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("user_id", user_id)
    .eq("id", id);
  if (error) throw error;
};
