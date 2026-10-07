import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');

export async function GET() {
  try {
    const locations = db.prepare('SELECT * FROM locations').all();
    return NextResponse.json(locations);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, width, height, depth } = body;
    
    const info = db.prepare(
      'INSERT INTO locations (code, width, height, depth) VALUES (?, ?, ?, ?)'
    ).run(code, width, height, depth);

    return NextResponse.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Lentyna su tokiu kodu jau egzistuoja.' }, { status: 400 });
  }
}
