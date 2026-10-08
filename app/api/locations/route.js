import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

function getDb() {
  const dbPath = path.join(process.cwd(), 'warehouse.db');
  const db = new Database(dbPath);
  
  // Užtikrinam, kad lentelė sukurta su visais reikalingais stulpeliais
  db.prepare(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      type TEXT DEFAULT 'FLOOR',
      width INTEGER DEFAULT 0,
      height INTEGER DEFAULT 0,
      depth INTEGER DEFAULT 0,
      description TEXT
    )
  `).run();

  return db;
}

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM locations ORDER BY id DESC').all();
    db.close();
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, type, width, height, depth, description } = body;

    if (!code) {
      return NextResponse.json({ error: 'Lokacijos kodas privalomas' }, { status: 400 });
    }

    const db = getDb();

    // Patikrinam ar toks kodas jau egzistuoja
    const existing = db.prepare('SELECT id FROM locations WHERE code = ?').get(code);
    if (existing) {
      db.close();
      return NextResponse.json({ error: 'Tokia lokacija su šiuo kodu jau egzistuoja' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO locations (code, type, width, height, depth, description) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(code, type || 'FLOOR', width || 0, height || 0, depth || 0, description || '');
    
    db.close();
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, code, type, width, height, depth, description } = body;

    if (!id || !code) {
      return NextResponse.json({ error: 'ID ir kodas privalomi atnaujinimui' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`
      UPDATE locations 
      SET code = ?, type = ?, width = ?, height = ?, depth = ?, description = ? 
      WHERE id = ?
    `).run(code, type || 'FLOOR', width || 0, height || 0, depth || 0, description || '', id);
    
    db.close();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Nenurodytas lokacijos ID' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM locations WHERE id = ?').run(id);
    db.close();

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Serverio klaida' }, { status: 500 });
  }
}
