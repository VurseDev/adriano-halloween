import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() AS time;");
    client.release();

    res.status(200).json({
      success: true,
      message: "Database connection successful!",
      server_time: result.rows[0].time,
    });
  } catch (error) {
    console.error("DB connection error:", error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
}
