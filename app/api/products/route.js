import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');

export async function GET() {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { sku, name, width, height, depth } = body;
    
    const info = db.prepare(
      'INSERT INTO products (sku, name, width, height, depth) VALUES (?, ?, ?, ?, ?)'
    ).run(sku, name, width, height, depth);

    return NextResponse.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Prekė su tokiu SKU jau egzistuoja arba neteisingi duomenys.' }, { status: 400 });
  }
}
