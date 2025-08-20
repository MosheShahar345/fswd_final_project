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

  // Scuba Diving Products - Masks
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (1, 'Crystal Vision Dive Mask', 'Crystal clear tempered glass mask with low-volume design', 'Cressi', 'Masks', 89.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (2, 'Pro Hunter Mask', 'Professional grade silicone mask with anti-fog coating', 'Mares', 'Masks', 125.00)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (3, 'Ultra Clear Mask', 'Ultra-clear glass with comfort skirt design', 'Scubapro', 'Masks', 110.50)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (4, 'Freediving Mask', 'Low-volume mask perfect for freediving and spearfishing', 'Omer', 'Masks', 95.00)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (5, 'Compact Travel Mask', 'Foldable mask with compact case for travel', 'Aqua Lung', 'Masks', 75.99)`);

  // Fins
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (6, 'Open Heel Fins', 'Adjustable strap fins with powerful blade design', 'Cressi', 'Fins', 79.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (7, 'Full Foot Fins', 'Comfortable full foot pocket fins for warm water diving', 'Mares', 'Fins', 69.95)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (8, 'Carbon Fiber Fins', 'High-performance carbon fiber blades for technical diving', 'Scubapro', 'Fins', 189.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (9, 'Split Fins', 'Split blade design for efficient propulsion with less effort', 'Atomic', 'Fins', 149.00)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (10, 'Freediving Fins', 'Long blade fins designed for freediving and spearfishing', 'Omer', 'Fins', 135.50)`);

  // Wetsuits
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (11, '3mm Shorty Wetsuit', 'Neoprene shorty wetsuit for warm water diving', 'Cressi', 'Wetsuits', 89.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (12, '5mm Full Wetsuit', 'Full body wetsuit with back zip for temperate waters', 'Mares', 'Wetsuits', 179.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (13, '7mm Semi-Dry Suit', 'Semi-dry suit with sealed seams for cold water diving', 'Scubapro', 'Wetsuits', 399.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (14, 'Drysuit Trilam', 'Trilaminate drysuit for professional cold water diving', 'Aqua Lung', 'Wetsuits', 1299.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (15, 'Ladies 3mm Wetsuit', 'Anatomically designed wetsuit for women divers', 'Roxy', 'Wetsuits', 149.99)`);

  // BCDs (Buoyancy Control Devices)
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (16, 'Jacket Style BCD', 'Comfortable jacket-style BCD with integrated weight pockets', 'Cressi', 'BCDs', 249.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (17, 'Back Inflate BCD', 'Back-mount BCD for streamlined diving experience', 'Mares', 'BCDs', 319.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (18, 'Wing BCD System', 'Modular wing BCD for technical diving applications', 'Halcyon', 'BCDs', 649.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (19, 'Travel BCD', 'Lightweight travel BCD with quick-dry fabric', 'Zeagle', 'BCDs', 279.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (20, 'Weight Integrated BCD', 'BCD with quick-release integrated weight system', 'Aqua Lung', 'BCDs', 359.99)`);

  // Regulators
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (21, 'First Stage Regulator', 'Balanced diaphragm first stage with environmental seal', 'Scubapro', 'Regulators', 449.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (22, 'Second Stage Regulator', 'Pneumatically balanced second stage with adjustable breathing', 'Mares', 'Regulators', 199.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (23, 'Regulator Set Complete', 'Complete regulator set with octopus and pressure gauge', 'Cressi', 'Regulators', 399.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (24, 'Technical Regulator', 'Technical diving regulator for deep and decompression diving', 'Apeks', 'Regulators', 689.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (25, 'Travel Regulator', 'Compact lightweight regulator perfect for travel', 'Sherwood', 'Regulators', 319.99)`);

  // Tanks
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (26, 'Aluminum 80 Tank', 'Standard 80 cubic foot aluminum scuba tank', 'Luxfer', 'Tanks', 179.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (27, 'Steel 100 Tank', 'High-capacity steel tank with 3442 PSI rating', 'Catalina', 'Tanks', 249.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (28, 'Nitrox Tank', 'Nitrox-compatible tank with special valve', 'Worthington', 'Tanks', 229.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (29, 'Travel Tank Pony', '13 cubic foot pony bottle for emergency backup', 'Catalina', 'Tanks', 139.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (30, 'Steel 120 Tank', 'Large capacity steel tank for extended diving', 'Worthington', 'Tanks', 279.99)`);

  // Boots & Gloves
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (31, '5mm Dive Boots', 'Neoprene dive boots with hard sole for rocky entries', 'Cressi', 'Boots & Gloves', 39.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (32, '3mm Dive Gloves', 'Flexible neoprene gloves for warm water diving', 'Mares', 'Boots & Gloves', 29.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (33, '7mm Dive Boots', 'Thick neoprene boots for cold water protection', 'Scubapro', 'Boots & Gloves', 59.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (34, 'Dry Gloves', 'Waterproof dry gloves for drysuit diving', 'Waterproof', 'Boots & Gloves', 89.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (35, 'Tropical Dive Socks', 'Thin protection socks for warm water diving', 'Aqua Lung', 'Boots & Gloves', 19.99)`);

  // Instruments & Gauges
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (36, 'Dive Computer', 'Advanced dive computer with air integration', 'Suunto', 'Instruments', 449.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (37, 'Pressure Gauge', 'Analog pressure gauge with luminescent dial', 'Mares', 'Instruments', 79.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (38, 'Depth Gauge', 'Analog depth gauge accurate to 200 feet', 'Cressi', 'Instruments', 49.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (39, 'Compass', 'Wrist-mounted diving compass with lanyard', 'Suunto', 'Instruments', 69.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (40, 'Console 3-Gauge', 'Three-gauge console with pressure, depth, and compass', 'Oceanic', 'Instruments', 159.99)`);

  // Snorkels
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (41, 'Dry Top Snorkel', 'Snorkel with dry top valve to prevent water entry', 'Cressi', 'Snorkels', 34.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (42, 'Flexible Snorkel', 'Flexible snorkel with comfortable mouthpiece', 'Mares', 'Snorkels', 29.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (43, 'Professional Snorkel', 'Large bore snorkel for maximum airflow', 'Scubapro', 'Snorkels', 39.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (44, 'Travel Snorkel', 'Collapsible snorkel perfect for travel', 'Aqua Lung', 'Snorkels', 24.99)`);

  // Lights & Photography
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (45, 'Primary Dive Light', 'High-intensity LED primary dive light', 'Light & Motion', 'Lights', 189.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (46, 'Backup Dive Light', 'Compact backup light with twist on/off', 'Princeton Tec', 'Lights', 39.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (47, 'Underwater Camera', 'Waterproof digital camera for underwater photography', 'Olympus', 'Photography', 599.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (48, 'Camera Housing', 'Waterproof housing for DSLR cameras', 'Ikelite', 'Photography', 899.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (49, 'Video Light', 'High-output LED video light for underwater filming', 'Sola', 'Lights', 299.99)`);

  // Accessories
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (50, 'Dive Slate', 'Underwater writing slate with pencil', 'Innovative', 'Accessories', 12.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (51, 'Surface Marker Buoy', 'Inflatable safety buoy for surface signaling', 'Halcyon', 'Accessories', 79.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (52, 'Gear Bag', 'Large mesh bag for dive gear storage and transport', 'Stahlsac', 'Accessories', 49.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (53, 'Dive Flag', 'Diver down flag for surface safety', 'Trident', 'Accessories', 19.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (54, 'Reef Hook', 'Stainless steel reef hook for drift diving', 'Innovative', 'Accessories', 34.99)`);

  // Weights & Weight Systems
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (55, 'Lead Weight 2lb', 'Coated lead weight for diving', 'Generic', 'Weights', 8.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (56, 'Weight Belt', 'Nylon weight belt with quick-release buckle', 'Cressi', 'Weights', 19.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (57, 'Weight Pouch', 'Ditchable weight pouch for BCD integration', 'Scubapro', 'Weights', 29.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (58, 'Ankle Weights', 'Trim weights for ankle placement', 'Mares', 'Weights', 24.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (59, 'Shot Weight 5lb', 'Heavy-duty shot weight for technical diving', 'Halcyon', 'Weights', 15.99)`);

  // Maintenance & Care
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (60, 'Mask Defog', 'Anti-fog solution for diving masks', 'Stream2Sea', 'Maintenance', 9.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (61, 'Wetsuit Cleaner', 'Specialized cleaner for neoprene wetsuits', 'McNett', 'Maintenance', 12.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (62, 'Equipment Rinse Tank', 'Large tank for rinsing dive equipment', 'Innovative', 'Maintenance', 89.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (63, 'Regulator Service Kit', 'Complete service kit for regulator maintenance', 'Scubapro', 'Maintenance', 79.99)`);

  // Safety Equipment
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (64, 'Emergency Whistle', 'Loud whistle for surface emergencies', 'Storm', 'Safety', 7.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (65, 'Cutting Tool', 'Titanium dive knife with line cutter', 'EEZYCUT', 'Safety', 45.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (66, 'Emergency Signaling Mirror', 'Waterproof signaling mirror for emergencies', 'Innovative', 'Safety', 14.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (67, 'First Aid Kit Waterproof', 'Comprehensive waterproof first aid kit', 'Adventure Medical', 'Safety', 69.99)`);
  await db.run(`INSERT OR IGNORE INTO products (id, name, description, brand, category, price) VALUES (68, 'Dive Alert Horn', 'Pneumatic signaling device powered by tank air', 'Dive Alert', 'Safety', 49.99)`);

  // Sample inventory for scuba products
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (1, 'MASK-CV-001', 25)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (2, 'MASK-PH-001', 15)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (3, 'MASK-UC-001', 20)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (6, 'FINS-OH-001', 30)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (7, 'FINS-FF-001', 25)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (11, 'WET-3MM-001', 20)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (12, 'WET-5MM-001', 15)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (16, 'BCD-JAC-001', 12)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (21, 'REG-1ST-001', 8)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (26, 'TANK-AL80-001', 50)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (36, 'COMP-DIV-001', 10)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (45, 'LIGHT-PRI-001', 15)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (47, 'CAM-UW-001', 5)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (55, 'WEIGHT-2LB-001', 100)`);
  await db.run(`INSERT OR IGNORE INTO inventory (product_id, sku, qty_on_hand) VALUES (60, 'DEFOG-001', 50)`);

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

  // Diving course sessions - Open Water Diver (Course 1)
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (1, 1, '2025-09-15 09:00:00', 12)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (2, 1, '2025-10-01 09:00:00', 12)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (3, 1, '2025-10-20 14:00:00', 12)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (4, 1, '2025-11-10 09:00:00', 12)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (5, 1, '2025-11-25 14:00:00', 12)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (6, 1, '2025-12-05 09:00:00', 12)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (7, 1, '2025-12-20 14:00:00', 12)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (8, 1, '2026-01-05 09:00:00', 12)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (9, 1, '2026-01-20 14:00:00', 12)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (10, 1, '2026-02-02 09:00:00', 12)`);

  // Advanced Open Water Diver (Course 2)
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (11, 2, '2025-09-20 14:00:00', 8)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (12, 2, '2025-10-15 09:00:00', 8)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (13, 2, '2025-11-05 14:00:00', 8)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (14, 2, '2025-11-30 09:00:00', 8)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (15, 2, '2025-12-15 14:00:00', 8)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (16, 2, '2026-01-01 09:00:00', 8)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (17, 2, '2026-01-25 14:00:00', 8)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (18, 2, '2026-02-10 09:00:00', 8)`);

  // Master Diver (Course 3)
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (19, 3, '2025-10-10 09:00:00', 6)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (20, 3, '2025-11-25 09:00:00', 6)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (21, 3, '2025-12-10 14:00:00', 6)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (22, 3, '2026-01-15 09:00:00', 6)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (23, 3, '2026-02-05 14:00:00', 6)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (24, 3, '2026-02-25 09:00:00', 6)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (25, 3, '2026-03-10 14:00:00', 6)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (26, 3, '2026-04-15 09:00:00', 6)`);

  // Divemaster (Course 4)
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (27, 4, '2025-11-01 09:00:00', 4)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (28, 4, '2025-12-15 09:00:00', 4)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (29, 4, '2026-01-01 09:00:00', 4)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (30, 4, '2026-02-01 09:00:00', 4)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (31, 4, '2026-03-01 09:00:00', 4)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (32, 4, '2026-04-05 09:00:00', 4)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (33, 4, '2026-05-01 09:00:00', 4)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (34, 4, '2026-06-01 09:00:00', 4)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (35, 4, '2026-07-01 09:00:00', 4)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (36, 4, '2026-08-01 09:00:00', 4)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (37, 4, '2026-09-01 09:00:00', 4)`);
  await db.run(`INSERT OR IGNORE INTO course_sessions (id, course_id, start_at, capacity) VALUES (38, 4, '2026-10-01 09:00:00', 4)`);

  console.log('Database initialized successfully!');
  console.log('Sample data created:');
  console.log('- Admin user: admin@adventuregear.com / admin123');
  console.log('- Member user: member@adventuregear.com / user123');
  console.log('- 68 scuba diving products across 11 categories');
  console.log('- 2 sample trips');
  console.log('- 4 diving certification courses with 38 sessions total:');
  console.log('  • Open Water Diver: 10 sessions');
  console.log('  • Advanced Open Water: 8 sessions');
  console.log('  • Master Diver: 8 sessions');
  console.log('  • Divemaster: 12 sessions');
}

initDatabase().catch(console.error);
