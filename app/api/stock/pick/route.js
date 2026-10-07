import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');

export async function POST(request) {
  try {
    const body = await request.json();
    const { stock_id, pick_quantity } = body;

    const currentStock = db.prepare('SELECT * FROM stock WHERE id = ?').get(stock_id);
    if (!currentStock) {
      return NextResponse.json({ success: false, error: 'Sandėlio įrašas nerastas.' }, { status: 404 });
    }

    if (pick_quantity > currentStock.quantity) {
      return NextResponse.json({ success: false, error: 'Norimas surinkti kiekis viršija esamą likutį lentynoje.' }, { status: 400 });
    }

    const remaining = currentStock.quantity - pick_quantity;

    if (remaining === 0) {
      db.prepare('DELETE FROM stock WHERE id = ?').run(stock_id);
    } else {
      db.prepare('UPDATE stock SET quantity = ? WHERE id = ?').run(remaining, stock_id);
    }

    return NextResponse.json({ success: true, message: 'Prekės sėkmingai surinktos ir nurašytos!' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
