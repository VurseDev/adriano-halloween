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
  if (req.method === "POST") {
    try {
      const { p_name, code, p_type, quantity, description, image } = req.body;

      if (!p_name || !code || !description) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const result = await pool.query(
        "INSERT INTO product (code, p_name, description, p_type, quantity, image) VALUES ($1, $2, $3, $4, $5, $6)RETURNING code, p_name, description, p_type, quantity, image",
        [code, p_name, description, p_type, quantity || 0, image || null]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error("API Error (POST):", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "GET") {
    try {
      const result = await pool.query(
        "SELECT code, p_name, description, p_type, quantity, image FROM product ORDER BY p_id DESC"
      );
      return res.status(200).json(result.rows);
    } catch (error: any) {
      console.error("API Error (GET):", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
