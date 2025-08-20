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
      role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
      profile_picture TEXT,
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
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'SENT')),
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
      order_id INTEGER,
      status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlist', 'cancelled')),
      paid_amount DECIMAL(10,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (order_id) REFERENCES orders (id)
    );

    DROP TABLE IF EXISTS courses;
    
    CREATE TABLE courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT,
      level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'professional')),
      price DECIMAL(10,2) NOT NULL,
      description TEXT,
      duration TEXT,
      prerequisites TEXT,
      max_depth TEXT,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS course_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      start_at DATETIME NOT NULL,
      capacity INTEGER NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses (id)
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      order_id INTEGER,
      status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'waitlist', 'dropped', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES course_sessions (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (order_id) REFERENCES orders (id)
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

    CREATE TABLE IF NOT EXISTS refunds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      enrollment_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'rejected')),
      processed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (enrollment_id) REFERENCES enrollments (id),
      FOREIGN KEY (course_id) REFERENCES courses (id)
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
    VALUES (2, 'John Member', 'member@adventuregear.com', ?, 'member')
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

  // Sample diving courses
  await db.run(`
    INSERT OR IGNORE INTO courses (id, title, subtitle, level, price, description, duration, prerequisites, max_depth) 
    VALUES (1, 'Open Water Diver', 'One Star Diver', 'beginner', 599.99, 'The One Star Diver class teaches the effects of the underwater environment on the human body, and instills in the diver the correct guidelines and proper techniques for the aquatic realm, which will enable them to perform safe and enjoyable dives.', '5 days', 'None (10+ years old)', '20m (65ft)')
  `);

  await db.run(`
    INSERT OR IGNORE INTO courses (id, title, subtitle, level, price, description, duration, prerequisites, max_depth) 
    VALUES (2, 'Advanced Open Water Diver', 'Two Star Diver', 'intermediate', 449.99, 'The Advanced open water course aims to enhance build the diver''s techniques and abilities to deal with various situations underwater, to allow further evolution of the diver''s in-water and academic knowledge base, and advance the assessment, analysis and decision-making capabilities of the diver on any given dive.', '2-3 days', 'Open Water Diver', '30m (100ft)')
  `);

  await db.run(`
    INSERT OR IGNORE INTO courses (id, title, subtitle, level, price, description, duration, prerequisites, max_depth) 
    VALUES (3, 'Master Diver', 'Recreational Three Star Diver', 'advanced', 899.99, 'The Master Diver certification level is intended for experienced Two Star divers who would like to advance as divers, but are not interested in being trained as Dive Masters and leading dives.', '5-7 days', 'Advanced Open Water + 50 dives', '40m (130ft)')
  `);

  await db.run(`
    INSERT OR IGNORE INTO courses (id, title, subtitle, level, price, description, duration, prerequisites, max_depth) 
    VALUES (4, 'Divemaster', 'Three Star Diver', 'professional', 1299.99, 'The Divemaster certification level is intended to bring the diver to a high level of proficiency, in both skills and knowledge. Upon its completion the diver will have acquired the abilities to deal with the majority of diving scenarios, as well exercise sound judgment in dynamic situations. These abilities allow the diver to assume responsibility guiding a group of (certified) divers, and place the diver in an ideal starting point for instructor training.', '4-6 weeks', 'Master Diver + 100 dives', '40m (130ft)')
  `);

  // Sample diving course sessions
  await db.run(`
    INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) 
    VALUES (1, 1, '2024-06-15 09:00:00', 12)
  `);

  await db.run(`
    INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) 
    VALUES (2, 1, '2024-07-01 09:00:00', 12)
  `);

  await db.run(`
    INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) 
    VALUES (3, 2, '2024-06-20 14:00:00', 8)
  `);

  await db.run(`
    INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) 
    VALUES (4, 3, '2024-07-10 09:00:00', 6)
  `);

  await db.run(`
    INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) 
    VALUES (5, 4, '2024-08-01 09:00:00', 4)
  `);

  console.log('Database initialized successfully!');
  console.log('Sample data created:');
  console.log('- Admin user: admin@adventuregear.com / admin123');
  console.log('- Member user: member@adventuregear.com / user123');
  console.log('- 3 sample products');
  console.log('- 2 sample trips');
  console.log('- 4 diving certification courses');
}

initDatabase().catch(console.error);
