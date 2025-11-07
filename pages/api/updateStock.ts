// pages/api/updateStock.ts
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
    const { code, quantity } = req.body;

    if (!code || typeof quantity !== "number") {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }

    // Update quantity
    const result = await pool.query(
      `UPDATE product
       SET quantity = GREATEST(quantity + $1, 0)
       WHERE code = $2
       RETURNING code, p_name, quantity`,
      [quantity, code]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ success: true, product: result.rows[0] });
  } catch (err: any) {
    console.error("API Error (updateStock):", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
