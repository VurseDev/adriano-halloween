import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
});

interface LogEntry {
  id: number;
  action: string;
  description: string;
  user_id?: number;
  user_email?: string;
  product_code?: string;
  product_name?: string;
  created_at: string;
  ip_address?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { page = "1", limit = "20", action, user, product, startDate, endDate } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT 
          l.id,
          l.action,
          l.description,
          l.user_id,
          l.user_email,
          l.product_code,
          l.product_name,
          l.created_at,
          l.ip_address
        FROM logs l
        WHERE 1=1
      `;
      const params: any[] = [];

      // Add filters
      if (action) {
        params.push(action);
        query += ` AND l.action = $${params.length}`;
      }

      if (user) {
        params.push(`%${user}%`);
        query += ` AND (l.user_email ILIKE $${params.length} OR l.user_id::text = $${params.length})`;
      }

      if (product) {
        params.push(`%${product}%`);
        query += ` AND (l.product_name ILIKE $${params.length} OR l.product_code ILIKE $${params.length})`;
      }

      if (startDate) {
        params.push(startDate);
        query += ` AND l.created_at >= $${params.length}`;
      }

      if (endDate) {
        params.push(endDate);
        query += ` AND l.created_at <= $${params.length}`;
      }

      // Add ordering and pagination
      query += ` ORDER BY l.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limitNum, offset);

      // Get logs
      const result = await pool.query(query, params);
      
      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) FROM logs l WHERE 1=1`;
      const countParams: any[] = [];

      if (action) {
        countParams.push(action);
        countQuery += ` AND l.action = $${countParams.length}`;
      }

      if (user) {
        countParams.push(`%${user}%`);
        countQuery += ` AND (l.user_email ILIKE $${countParams.length} OR l.user_id::text = $${countParams.length})`;
      }

      if (product) {
        countParams.push(`%${product}%`);
        countQuery += ` AND (l.product_name ILIKE $${countParams.length} OR l.product_code ILIKE $${countParams.length})`;
      }

      if (startDate) {
        countParams.push(startDate);
        countQuery += ` AND l.created_at >= $${countParams.length}`;
      }

      if (endDate) {
        countParams.push(endDate);
        countQuery += ` AND l.created_at <= $${countParams.length}`;
      }

      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);

      return res.status(200).json({
        logs: result.rows,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalItems: totalCount,
          itemsPerPage: limitNum
        }
      });

    } catch (error: any) {
      console.error("API Error (GET logs):", error);
      return res.status(500).json({ error: "Failed to fetch logs" });
    }
  }

  if (req.method === "POST") {
    try {
      const { action, description, user_id, user_email, product_code, product_name, ip_address } = req.body;

      if (!action || !description) {
        return res.status(400).json({ error: "Action and description are required" });
      }

      const result = await pool.query(
        `INSERT INTO logs (action, description, user_id, user_email, product_code, product_name, ip_address) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, action, description, user_id, user_email, product_code, product_name, created_at, ip_address`,
        [action, description, user_id, user_email, product_code, product_name, ip_address]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error("API Error (POST log):", error);
      return res.status(500).json({ error: "Failed to create log entry" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Log ID is required" });
      }

      await pool.query("DELETE FROM logs WHERE id = $1", [id]);

      return res.status(200).json({ success: true, message: "Log entry deleted!" });
    } catch (error: any) {
      console.error("API Error (DELETE log):", error);
      return res.status(500).json({ error: "Failed to delete log entry" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}