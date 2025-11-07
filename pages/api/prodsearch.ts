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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await pool.query("SELECT * FROM product;");

    return res.status(200).json({
      success: true,
      message: "Products found!",
      products: result.rows,
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}