import { getDb } from './db.js';
import bcrypt from 'bcryptjs';

async function initDatabase() {
  const db = await getDb();
  
  console.log('Initializing database...');

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      hash TEXT NOT NULL,
      role TEXT DEFAULT 'member' CHECK (role IN ('member', 'instructor', 'manager', 'admin')),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      country TEXT DEFAULT 'USA',
      is_default BOOLEAN DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      brand TEXT,
      category TEXT,
      price DECIMAL(10,2) NOT NULL,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      alt TEXT,
      is_primary BOOLEAN DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      branch_id INTEGER DEFAULT 1,
      sku TEXT UNIQUE NOT NULL,
      qty_on_hand INTEGER DEFAULT 0,
      threshold INTEGER DEFAULT 5,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      effective_from DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );

    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cart_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      price_at_add DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (cart_id) REFERENCES carts (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
      payment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      seats_total INTEGER NOT NULL,
      seats_taken INTEGER DEFAULT 0,
      difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard', 'expert')),
      price DECIMAL(10,2) NOT NULL,
      description TEXT,
      active BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS trip_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlist', 'cancelled')),
      paid_amount DECIMAL(10,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
      price DECIMAL(10,2) NOT NULL,
      description TEXT,
      active BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS course_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      instructor_id INTEGER NOT NULL,
      start_at DATETIME NOT NULL,
      capacity INTEGER NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses (id),
      FOREIGN KEY (instructor_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'waitlist', 'dropped')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES course_sessions (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_user_id INTEGER NOT NULL,
      from_user_id INTEGER,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      channel TEXT DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'push')),
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (to_user_id) REFERENCES users (id),
      FOREIGN KEY (from_user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      delivered_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_user_id INTEGER,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id INTEGER,
      diff_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (actor_user_id) REFERENCES users (id)
    );
  `);

  // Insert sample data
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);
  
  await db.run(`
    INSERT OR IGNORE INTO users (id, name, email, hash, role) 
    VALUES (1, 'Admin User', 'admin@adventuregear.com', ?, 'admin')
  `, [adminHash]);

  await db.run(`
    INSERT OR IGNORE INTO users (id, name, email, hash, role) 
    VALUES (2, 'John Instructor', 'instructor@adventuregear.com', ?, 'instructor')
  `, [userHash]);

  await db.run(`
    INSERT OR IGNORE INTO users (id, name, email, hash, role) 
    VALUES (3, 'Jane Manager', 'manager@adventuregear.com', ?, 'manager')
  `, [userHash]);

  await db.run(`
    INSERT OR IGNORE INTO users (id, name, email, hash, role) 
    VALUES (4, 'Bob Member', 'member@adventuregear.com', ?, 'member')
  `, [userHash]);

  // Sample products
  await db.run(`
    INSERT OR IGNORE INTO products (id, name, description, brand, category, price) 
    VALUES (1, 'Adventure Backpack 65L', 'Large capacity backpack for multi-day trips', 'AdventurePro', 'Backpacks', 129.99)
  `);

  await db.run(`
    INSERT OR IGNORE INTO products (id, name, description, brand, category, price) 
    VALUES (2, 'Trekking Poles', 'Lightweight aluminum trekking poles', 'TrailMaster', 'Hiking', 89.99)
  `);

  await db.run(`
    INSERT OR IGNORE INTO products (id, name, description, brand, category, price) 
    VALUES (3, 'Waterproof Tent 2P', '2-person waterproof tent', 'CampLife', 'Camping', 199.99)
  `);

  // Sample inventory
  await db.run(`
    INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) 
    VALUES (1, 'BP-65L-001', 25)
  `);

  await db.run(`
    INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) 
    VALUES (2, 'TP-AL-001', 15)
  `);

  await db.run(`
    INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) 
    VALUES (3, 'TENT-2P-001', 8)
  `);

  // Sample trips
  await db.run(`
    INSERT OR IGNORE INTO trips (id, title, location, start_date, end_date, seats_total, difficulty, price, description) 
    VALUES (1, 'Rocky Mountain Adventure', 'Colorado', '2024-07-15', '2024-07-20', 12, 'moderate', 899.99, '5-day hiking adventure in the Rockies')
  `);

  await db.run(`
    INSERT OR IGNORE INTO trips (id, title, location, start_date, end_date, seats_total, difficulty, price, description) 
    VALUES (2, 'Coastal Kayaking', 'California', '2024-08-10', '2024-08-12', 8, 'easy', 299.99, 'Weekend kayaking along the Pacific coast')
  `);

  // Sample courses
  await db.run(`
    INSERT OR IGNORE INTO courses (id, title, level, price, description) 
    VALUES (1, 'Wilderness First Aid', 'beginner', 199.99, 'Learn essential first aid skills for outdoor adventures')
  `);

  await db.run(`
    INSERT OR IGNORE INTO courses (id, title, level, price, description) 
    VALUES (2, 'Advanced Rock Climbing', 'advanced', 399.99, 'Master advanced climbing techniques and safety protocols')
  `);

  // Sample course sessions
  await db.run(`
    INSERT OR IGNORE INTO course_sessions (id, course_id, instructor_id, start_at, capacity) 
    VALUES (1, 1, 2, '2024-06-15 09:00:00', 20)
  `);

  await db.run(`
    INSERT OR IGNORE INTO course_sessions (id, course_id, instructor_id, start_at, capacity) 
    VALUES (2, 2, 2, '2024-07-01 14:00:00', 12)
  `);

  console.log('Database initialized successfully!');
  console.log('Sample data created:');
  console.log('- Admin user: admin@adventuregear.com / admin123');
  console.log('- Member user: member@adventuregear.com / user123');
  console.log('- 3 sample products');
  console.log('- 2 sample trips');
  console.log('- 2 sample courses');
}

initDatabase().catch(console.error);
