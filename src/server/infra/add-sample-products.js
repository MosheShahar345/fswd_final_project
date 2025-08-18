import { getDb } from './db.js';

async function addSampleProducts() {
  const db = await getDb();
  
  console.log('Adding sample products...');

  const products = [
    // Backpacks
    {
      name: 'Adventure Backpack 65L',
      description: 'Large capacity backpack for multi-day trips with multiple compartments',
      brand: 'AdventurePro',
      category: 'Backpacks',
      price: 129.99
    },
    {
      name: 'Day Hiking Pack 25L',
      description: 'Lightweight day pack perfect for day hikes and short adventures',
      brand: 'TrailMaster',
      category: 'Backpacks',
      price: 79.99
    },
    {
      name: 'Ultralight Backpack 40L',
      description: 'Ultralight backpack for thru-hiking and minimalist adventures',
      brand: 'LightGear',
      category: 'Backpacks',
      price: 159.99
    },

    // Hiking
    {
      name: 'Trekking Poles',
      description: 'Lightweight aluminum trekking poles with cork grips',
      brand: 'TrailMaster',
      category: 'Hiking',
      price: 89.99
    },
    {
      name: 'Hiking Boots Waterproof',
      description: 'Waterproof hiking boots with excellent traction and support',
      brand: 'MountainFoot',
      category: 'Hiking',
      price: 149.99
    },
    {
      name: 'Hiking Socks Merino',
      description: 'Merino wool hiking socks for comfort and moisture wicking',
      brand: 'TrailMaster',
      category: 'Hiking',
      price: 24.99
    },

    // Camping
    {
      name: 'Waterproof Tent 2P',
      description: '2-person waterproof tent with rainfly and vestibule',
      brand: 'CampLife',
      category: 'Camping',
      price: 199.99
    },
    {
      name: 'Sleeping Bag 20°F',
      description: 'Mummy sleeping bag rated for 20°F temperatures',
      brand: 'CampLife',
      category: 'Camping',
      price: 89.99
    },
    {
      name: 'Camping Stove',
      description: 'Portable camping stove with wind protection',
      brand: 'FireGear',
      category: 'Camping',
      price: 69.99
    },
    {
      name: 'Camping Chair',
      description: 'Lightweight camping chair with cup holder',
      brand: 'CampLife',
      category: 'Camping',
      price: 39.99
    },

    // Climbing
    {
      name: 'Climbing Harness',
      description: 'Comfortable climbing harness with gear loops',
      brand: 'RockPro',
      category: 'Climbing',
      price: 89.99
    },
    {
      name: 'Climbing Shoes',
      description: 'Aggressive climbing shoes for technical routes',
      brand: 'RockPro',
      category: 'Climbing',
      price: 129.99
    },
    {
      name: 'Climbing Rope 60m',
      description: 'Dynamic climbing rope with dry treatment',
      brand: 'RockPro',
      category: 'Climbing',
      price: 199.99
    },

    // Water Sports
    {
      name: 'Inflatable Kayak',
      description: '2-person inflatable kayak with paddles and pump',
      brand: 'WaterAdventure',
      category: 'Water Sports',
      price: 299.99
    },
    {
      name: 'PFD Life Jacket',
      description: 'Type III PFD life jacket for water activities',
      brand: 'WaterAdventure',
      category: 'Water Sports',
      price: 59.99
    },
    {
      name: 'Waterproof Dry Bag',
      description: 'Waterproof dry bag for protecting gear on water',
      brand: 'WaterAdventure',
      category: 'Water Sports',
      price: 34.99
    },

    // Electronics
    {
      name: 'GPS Device',
      description: 'Handheld GPS device with topographic maps',
      brand: 'TechGear',
      category: 'Electronics',
      price: 249.99
    },
    {
      name: 'Headlamp LED',
      description: 'Bright LED headlamp with multiple light modes',
      brand: 'TechGear',
      category: 'Electronics',
      price: 44.99
    },
    {
      name: 'Portable Charger',
      description: 'High-capacity portable charger for devices',
      brand: 'TechGear',
      category: 'Electronics',
      price: 79.99
    },

    // Clothing
    {
      name: 'Waterproof Jacket',
      description: 'Lightweight waterproof jacket with breathable membrane',
      brand: 'WeatherGear',
      category: 'Clothing',
      price: 179.99
    },
    {
      name: 'Hiking Pants',
      description: 'Quick-dry hiking pants with zip-off legs',
      brand: 'WeatherGear',
      category: 'Clothing',
      price: 89.99
    },
    {
      name: 'Base Layer Set',
      description: 'Merino wool base layer set for temperature regulation',
      brand: 'WeatherGear',
      category: 'Clothing',
      price: 119.99
    }
  ];

  for (const product of products) {
    const result = await db.run(`
      INSERT INTO products (name, description, brand, category, price)
      VALUES (?, ?, ?, ?, ?)
    `, [product.name, product.description, product.brand, product.category, product.price]);

    const productId = result.lastID;

    // Add inventory
    const sku = `${product.category.substring(0, 3).toUpperCase()}-${productId.toString().padStart(3, '0')}`;
    await db.run(`
      INSERT INTO inventory (product_id, sku, qty_on_hand)
      VALUES (?, ?, ?)
    `, [productId, sku, Math.floor(Math.random() * 50) + 5]);

    console.log(`Added: ${product.name} (${product.brand}) - $${product.price}`);
  }

  console.log('Sample products added successfully!');
}

addSampleProducts().catch(console.error);
