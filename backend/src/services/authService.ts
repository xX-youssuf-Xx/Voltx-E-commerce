import { Client } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validatePassword } from "../utils/passwordValidation";

const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect();

export async function register(name: string, email: string, pass: string) {
  // Validate password requirements
  const passwordValidation = validatePassword(pass);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors[0]); // Return first error
  }

  // Check if user exists
  const existing = await client.query("SELECT * FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    throw new Error("Email already registered");
  }
  const hash = await bcrypt.hash(pass, 10);
  // Default role: user (role_id = 4)
  const result = await client.query(
    `INSERT INTO users (name, email, password_hash, role_id, created_at, updated_at)
     VALUES ($1, $2, $3, 4, NOW(), NOW()) RETURNING user_id, name, email, role_id` ,
    [name, email, hash]
  );
  return result.rows[0];
}

export async function login(email: string, pass: string) {
  const result = await client.query("SELECT * FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }
  const user = result.rows[0];
  const valid = await bcrypt.compare(pass, user.password_hash);
  if (!valid) {
    throw new Error("Invalid email or password");
  }
  // Generate JWT
  const jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";
  const token = jwt.sign(
    { user_id: user.user_id, role_id: user.role_id, email: user.email },
    jwtSecret,
    { expiresIn: "7d" }
  );
  return { token, user: { user_id: user.user_id, name: user.name, email: user.email, role_id: user.role_id } };
} 