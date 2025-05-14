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
  // Soft delete: mark as deleted for sync
  const { error } = await supabase
    .from("transactions")
    .update({ sync_status: "deleted" })
    .eq("user_id", user_id)
    .eq("id", id);
  if (error) throw error;
};

exports.sync = async (user_id, transactions) => {
  const results = [];
  for (const tx of transactions) {
    // Always set user_id to ensure scoping
    tx.user_id = user_id;
    // Remove WatermelonDB sync fields
    const { _changed, _status, sync_status, version, ...cleanTx } = tx;
    // Convert tags from JSON string to array if needed
    if (typeof cleanTx.tags === "string") {
      try {
        cleanTx.tags = JSON.parse(cleanTx.tags);
      } catch {
        cleanTx.tags = [];
      }
    }
    // Upsert with conflict resolution by id and updated_at/version
    // If incoming tx.updated_at is newer, update; else skip
    const { data: existing, error: findErr } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", cleanTx.id)
      .single();
    if (findErr && findErr.code !== "PGRST116") throw findErr;
    if (
      !existing ||
      (typeof cleanTx.updated_at === "number" &&
        typeof existing.updated_at === "number" &&
        cleanTx.updated_at > existing.updated_at)
    ) {
      // Upsert
      const { data, error } = await supabase
        .from("transactions")
        .upsert([cleanTx], { onConflict: ["id"] })
        .select()
        .single();
      if (error) throw error;
      results.push(data);
    } else {
      results.push(existing);
    }
  }
  return results;
};

exports.updatedSince = async (user_id, since) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user_id)
    .gt("updated_at", Number(since))
    .order("updated_at", { ascending: true });
  if (error) throw error;
  return data;
};
