import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    const user = db.prepare('SELECT id, username, role FROM users WHERE username = ? AND password = ?').get(username, password);
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Neteisingas prisijungimo vardas arba slaptažodis.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
