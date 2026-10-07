import { NextResponse } from 'next/server';
const { db, checkSpatialFit } = require('@/lib/db');

export async function GET() {
  try {
    const items = db.prepare(`
      SELECT s.id, p.name as product_name, p.sku, l.code as location_code, s.quantity 
      FROM stock s
      JOIN products p ON s.product_id = p.id
      JOIN locations l ON s.location_id = l.id
    `).all();
    return NextResponse.json(items);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { product_id, location_id, quantity } = body;
    
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Prekė nerasta' }, { status: 404 });
    }

    // Paleidžiame mūsų Tetris patikrinimo varikliuką
    const fitCheck = checkSpatialFit(location_id, product.width, product.height, product.depth, quantity);
    if (!fitCheck.valid) {
      return NextResponse.json({ success: false, error: fitCheck.error }, { status: 400 });
    }

    db.prepare('INSERT INTO stock (product_id, location_id, quantity) VALUES (?, ?, ?)').run(product_id, location_id, quantity);
    return NextResponse.json({ success: true, message: 'Prekė sėkmingai patalpinta!' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
