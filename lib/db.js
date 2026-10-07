const Database = require('better-sqlite3');
const path = require('path');

// Sukuriamos duomenų bazės failas šakniniame aplanke
const dbPath = path.join(process.cwd(), 'warehouse.db');
const db = new Database(dbPath);

// Lentelių inicializacija
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL -- 'admin', 'operator', 'guest'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    width REAL NOT NULL,
    height REAL NOT NULL,
    depth REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    width REAL NOT NULL,
    height REAL NOT NULL,
    depth REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    location_id INTEGER,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
  );
`);

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const insertUser = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
  insertUser.run('admin', 'admin123', 'admin');       // Administratorius
  insertUser.run('operator', 'oper123', 'operator'); // Sandėlininkas
  insertUser.run('guest', 'guest123', 'guest');       // Svečias / Mobilus
}

// Erdvinio Tetris patikrinimo varikliukas (milimetrais)
function checkSpatialFit(locationId, productWidth, productHeight, productDepth, addQuantity) {
  const loc = db.prepare('SELECT * FROM locations WHERE id = ?').get(locationId);
  if (!loc) return { valid: false, error: 'Lentyna nerasta' };

  const shelfVolume = loc.width * loc.height * loc.depth;
  const productVolume = productWidth * productHeight * productDepth;
  const incomingVolume = productVolume * addQuantity;

  const existingItems = db.prepare(`
    SELECT s.quantity, p.width, p.height, p.depth 
    FROM stock s 
    JOIN products p ON s.product_id = p.id 
    WHERE s.location_id = ?
  `).all(locationId);

  let currentOccupiedVolume = existingItems.reduce((acc, item) => {
    return acc + (item.width * item.height * item.depth * item.quantity);
  }, 0);

  if (currentOccupiedVolume + incomingVolume > shelfVolume) {
    return { 
      valid: false, 
      error: `Tetris klaida: Lentynos tūris viršytas! Laisva tūrio dalis neleidžia sutalpinti šio kiekio.` 
    };
  }

  if (productWidth > loc.width || productHeight > loc.height || productDepth > loc.depth) {
    return { valid: false, error: 'Prekės gabaritai didesni už pačios lentynos angą!' };
  }

  return { valid: true };
}

module.exports = {
  db,
  checkSpatialFit
};
