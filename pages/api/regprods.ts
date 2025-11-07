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
        "INSERT INTO product (code, p_name, description, p_type, quantity, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING code, p_name, description, p_type, quantity, image",
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
        "SELECT p_id, code, p_name, description, p_type, quantity, image FROM product ORDER BY p_id DESC"
      );
      return res.status(200).json(result.rows);
    } catch (error: any) {
      console.error("API Error (GET):", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  }
  
  if (req.method === "PUT") {
  try {
    const { code } = req.query;
    const { p_name, description, p_type, quantity, image } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Product code is required" });
    }

    const result = await pool.query(
      "UPDATE product SET p_name = $1, description = $2, p_type = $3, quantity = $4, image = $5 WHERE code = $6 RETURNING code, p_name, description, p_type, quantity, image",
      [p_name, description, p_type, quantity || 0, image || null, code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error("API Error (PUT):", error);
    return res.status(500).json({ error: "Failed to update product" });
  }
}

  if (req.method === "DELETE") {
    try {
      const { id, code } = req.query;

      // If no identifier provided
      if (!id && !code) {
        return res.status(400).json({ error: 'Product ID or code is required' });
      }

      let query;
      let params;

      // If id is provided and it's a number, use p_id
      if (id && !isNaN(Number(id))) {
        query = "DELETE FROM product WHERE p_id = $1";
        params = [parseInt(id as string)];
      } 
      // If code is provided or id is a string (like "HS006"), use code
      else if (code || (id && isNaN(Number(id)))) {
        query = "DELETE FROM product WHERE code = $1";
        params = [code || id];
      } else {
        return res.status(400).json({ error: 'Invalid product identifier' });
      }

      const result = await pool.query(query, params);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json({ success: true, message: "Product deleted!" });
    } catch (error: any) {
      console.error("API Error (DELETE):", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
