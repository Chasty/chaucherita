const supabase = require("../config/supabaseClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

exports.register = async ({ email, password, name }) => {
  if (!email || !password || !name) throw new Error("Missing required fields");
  // Check if user exists
  const { data: existing, error: findErr } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (existing) throw new Error("User already exists");
  if (findErr && findErr.code !== "PGRST116") throw findErr;
  // Hash password
  const hashed = await bcrypt.hash(password, 10);
  // Insert user
  const { data, error } = await supabase
    .from("users")
    .insert([{ email, name, password: hashed }])
    .select()
    .single();
  if (error) throw error;
  const user = { id: data.id, email: data.email, name: data.name };
  const token = generateToken(user);
  return { user, token };
};

exports.login = async ({ email, password }) => {
  if (!email || !password) throw new Error("Missing required fields");
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error || !data) throw new Error("Invalid credentials");
  const valid = await bcrypt.compare(password, data.password);
  if (!valid) throw new Error("Invalid credentials");
  const user = { id: data.id, email: data.email, name: data.name };
  const token = generateToken(user);
  return { user, token };
};
