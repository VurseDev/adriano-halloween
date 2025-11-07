import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const userQuery = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (userQuery.rowCount === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = userQuery.rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email                 
      }
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
