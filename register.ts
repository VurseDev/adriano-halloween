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
    const { name, email, password, country } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await pool.query(
      "INSERT INTO users (name, email, password, country) VALUES ($1, $2, $3, $4)",
      [name, email, password, country]
    );

    return res.status(200).json({ success: true, message: "User saved!" });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
