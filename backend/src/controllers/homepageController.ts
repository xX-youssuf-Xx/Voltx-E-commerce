import { Request, Response } from 'express';
import * as homepageService from '../services/homepageService';

const validSections = ['best_sellers', 'new_arrivals', 'featured_products'];

function getSection(req: Request, res: Response) {
  const section = req.params.section as string;
  if (!section || !validSections.includes(section)) {
    res.status(400).json({ error: 'Invalid section' });
    return null;
  }
  return section;
}

export const listSection = async (req: Request, res: Response) => {
  const section = getSection(req, res);
  if (!section) return;
  try {
    const products = await homepageService.listSection(section);
    res.json(products);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch section' });
    return;
  }
};

export const addProduct = async (req: Request, res: Response) => {
  const section = getSection(req, res);
  if (!section) return;
  const { product_id } = req.body;
  if (!product_id) {
    res.status(400).json({ error: 'Missing product_id' });
    return;
  }
  try {
    const result = await homepageService.addProduct(section, product_id);
    res.status(201).json(result);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
    return;
  }
};

export const removeProduct = async (req: Request, res: Response) => {
  const section = getSection(req, res);
  if (!section) return;
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).json({ error: 'Missing id' });
    return;
  }
  try {
    await homepageService.removeProduct(section, id);
    res.json({ success: true });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove product' });
    return;
  }
};

export const reorderSection = async (req: Request, res: Response) => {
  const section = getSection(req, res);
  if (!section) return;
  const { order } = req.body; // array of product_ids
  if (!Array.isArray(order)) {
    res.status(400).json({ error: 'Missing order array' });
    return;
  }
  try {
    await homepageService.reorderSection(section, order);
    res.json({ success: true });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder section' });
    return;
  }
};

// New controller function for homepage data
export const getHomepageData = async (req: Request, res: Response) => {
  try {
    const homepageData = await homepageService.getHomepageData();
    res.json(homepageData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch homepage data' });
  }
}; 