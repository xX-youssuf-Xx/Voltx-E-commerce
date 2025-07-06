import { Request, Response } from "express";
import { db } from "../config/database";
import { AuthRequest } from "../middlewares/authMiddleware";

// Helper to generate a random 6-char uppercase alphanumeric code
function randomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function generateDiscountCode(req: Request, res: Response) {
  let code;
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 10) {
    code = randomCode();
    const result = await db.query("SELECT 1 FROM discounts WHERE code = $1", [code]);
    exists = result.rows.length > 0;
    attempts++;
  }
  if (exists) {
    return res.status(500).json({ error: "Could not generate unique code" });
  }
  return res.json({ code });
}

export async function listDiscounts(req: Request, res: Response) {
  const result = await db.query("SELECT *, (SELECT COUNT(*) FROM discount_usage WHERE discount_id = d.discount_id) AS usage_count FROM discounts d ORDER BY created_at DESC");
  res.json(result.rows);
}

export async function getDiscountById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await db.query("SELECT * FROM discounts WHERE discount_id = $1", [id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Discount not found" });
  res.json(result.rows[0]);
}

export async function listDiscountUsages(req: Request, res: Response) {
  const id = Number(req.params.id);
  const result = await db.query("SELECT * FROM discount_usage WHERE discount_id = $1 ORDER BY used_at DESC", [id]);
  res.json(result.rows);
}

export async function createDiscount(req: AuthRequest, res: Response) {
  const data = req.body;
  // Insert discount (assume all fields are present and valid for now)
  const result = await db.query(
    `INSERT INTO discounts (code, name, description, type, value, minimum_order_amount, maximum_discount_amount, usage_limit, usage_limit_per_user, start_date, end_date, is_active, applies_to, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [data.code, data.name, data.description, data.type, data.value, data.minimum_order_amount, data.maximum_discount_amount, data.usage_limit, data.usage_limit_per_user, data.start_date, data.end_date, data.is_active, data.applies_to, req.user?.user_id]
  );
  res.status(201).json(result.rows[0]);
}

export async function updateDiscount(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  const data = req.body;
  // Update discount (assume all fields are present and valid for now)
  const result = await db.query(
    `UPDATE discounts SET code=$1, name=$2, description=$3, type=$4, value=$5, minimum_order_amount=$6, maximum_discount_amount=$7, usage_limit=$8, usage_limit_per_user=$9, start_date=$10, end_date=$11, is_active=$12, applies_to=$13 WHERE discount_id=$14 RETURNING *`,
    [data.code, data.name, data.description, data.type, data.value, data.minimum_order_amount, data.maximum_discount_amount, data.usage_limit, data.usage_limit_per_user, data.start_date, data.end_date, data.is_active, data.applies_to, id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Discount not found" });
  res.json(result.rows[0]);
}

export async function deleteDiscount(req: Request, res: Response) {
  const id = Number(req.params.id);
  await db.query("DELETE FROM discounts WHERE discount_id = $1", [id]);
  res.status(204).send();
} 