import { getDb } from './db.js';

async function addSampleProducts() {
  const db = await getDb();
  
  console.log('Adding scuba diving gear products...');

  const products = [
    // Buoyancy Control Devices (BCDs)
    {
      name: 'ScubaPro Hydros Pro BCD',
      description: 'Revolutionary lightweight BCD with integrated weight system and quick-release harness',
      brand: 'ScubaPro',
      category: 'Buoyancy Control Devices',
      price: 899.99
    },
    {
      name: 'Cressi Travelight BCD',
      description: 'Lightweight travel BCD with integrated weight pockets and adjustable harness',
      brand: 'Cressi',
      category: 'Buoyancy Control Devices',
      price: 449.99
    },
    {
      name: 'Mares Avanti Quattro+ BCD',
      description: 'Versatile BCD with multiple D-rings and comfortable padding for extended dives',
      brand: 'Mares',
      category: 'Buoyancy Control Devices',
      price: 599.99
    },
    {
      name: 'Aqualung Dimension i3 BCD',
      description: 'Innovative BCD with i3 weight system and comfortable shoulder design',
      brand: 'Aqualung',
      category: 'Buoyancy Control Devices',
      price: 749.99
    },

    // Regulators
    {
      name: 'ScubaPro MK25 EVO/S620Ti Regulator',
      description: 'High-performance regulator with titanium second stage for cold water diving',
      brand: 'ScubaPro',
      category: 'Regulators',
      price: 1299.99
    },
    {
      name: 'Cressi AC2/AC2 Regulator Set',
      description: 'Reliable regulator set with balanced first stage and adjustable second stage',
      brand: 'Cressi',
      category: 'Regulators',
      price: 399.99
    },
    {
      name: 'Mares Abyss 22 Navy II Regulator',
      description: 'Military-grade regulator with cold water capability and excellent breathing performance',
      brand: 'Mares',
      category: 'Regulators',
      price: 649.99
    },
    {
      name: 'Aqualung Legend LX Supreme Regulator',
      description: 'Premium regulator with balanced piston design and environmental sealing',
      brand: 'Aqualung',
      category: 'Regulators',
      price: 899.99
    },

    // Wetsuits
    {
      name: 'ScubaPro Everflex 7mm Wetsuit',
      description: 'Premium 7mm wetsuit with Everflex neoprene for maximum flexibility and warmth',
      brand: 'ScubaPro',
      category: 'Wetsuits',
      price: 549.99
    },
    {
      name: 'Cressi Comfort 5mm Wetsuit',
      description: 'Comfortable 5mm wetsuit with stretch neoprene for tropical diving',
      brand: 'Cressi',
      category: 'Wetsuits',
      price: 299.99
    },
    {
      name: 'Mares Flexa 3mm Wetsuit',
      description: 'Lightweight 3mm wetsuit with maximum flexibility for warm water diving',
      brand: 'Mares',
      category: 'Wetsuits',
      price: 199.99
    },
    {
      name: 'Aqualung Solafx 6.5mm Wetsuit',
      description: 'Thermal protection wetsuit with Solafx technology for cold water diving',
      brand: 'Aqualung',
      category: 'Wetsuits',
      price: 449.99
    },

    // Drysuits
    {
      name: 'ScubaPro Everdry 4 Dry Suit',
      description: 'Premium drysuit with trilaminate construction and dry zipper system',
      brand: 'ScubaPro',
      category: 'Drysuits',
      price: 1899.99
    },
    {
      name: 'DUI FLX Extreme Dry Suit',
      description: 'Heavy-duty drysuit with reinforced knees and ankles for technical diving',
      brand: 'DUI',
      category: 'Drysuits',
      price: 2499.99
    },
    {
      name: 'Santi E.Lite+ Dry Suit',
      description: 'Lightweight drysuit with compressed neoprene for maximum mobility',
      brand: 'Santi',
      category: 'Drysuits',
      price: 2199.99
    },

    // Tanks
    {
      name: 'Luxfer Aluminum 80 Tank',
      description: 'Standard 80 cubic foot aluminum tank with 3000 PSI working pressure',
      brand: 'Luxfer',
      category: 'Tanks',
      price: 299.99
    },
    {
      name: 'Catalina Steel 100 Tank',
      description: 'High-capacity steel tank with 3442 PSI for extended bottom time',
      brand: 'Catalina',
      category: 'Tanks',
      price: 449.99
    },
    {
      name: 'Worthington Steel 120 Tank',
      description: 'Large capacity steel tank for technical diving and extended range',
      brand: 'Worthington',
      category: 'Tanks',
      price: 599.99
    },

    // Fins
    {
      name: 'ScubaPro Jet Fin',
      description: 'Classic paddle fins with excellent power and control for technical diving',
      brand: 'ScubaPro',
      category: 'Fins',
      price: 199.99
    },
    {
      name: 'Cressi Gara Modular Fins',
      description: 'Adjustable open-heel fins with modular foot pocket system',
      brand: 'Cressi',
      category: 'Fins',
      price: 149.99
    },
    {
      name: 'Mares Avanti Quattro+ Fins',
      description: 'Split fin design with four channels for efficient propulsion',
      brand: 'Mares',
      category: 'Fins',
      price: 179.99
    },
    {
      name: 'Aqualung Blades Fins',
      description: 'Channeled blade design with comfortable foot pocket for all divers',
      brand: 'Aqualung',
      category: 'Fins',
      price: 129.99
    },

    // Masks
    {
      name: 'ScubaPro Solo Mask',
      description: 'Low-volume mask with tempered glass and comfortable silicone skirt',
      brand: 'ScubaPro',
      category: 'Masks',
      price: 89.99
    },
    {
      name: 'Cressi Big Eyes Evolution Mask',
      description: 'Large lens mask with panoramic view and comfortable fit',
      brand: 'Cressi',
      category: 'Masks',
      price: 79.99
    },
    {
      name: 'Mares X-Vision Mask',
      description: 'Ultra-low volume mask with excellent field of vision',
      brand: 'Mares',
      category: 'Masks',
      price: 99.99
    },
    {
      name: 'Aqualung Look 2 Mask',
      description: 'Classic design mask with comfortable fit and clear visibility',
      brand: 'Aqualung',
      category: 'Masks',
      price: 69.99
    },

    // Snorkels
    {
      name: 'ScubaPro Escape Snorkel',
      description: 'Dry snorkel with splash guard and flexible tube for comfort',
      brand: 'ScubaPro',
      category: 'Snorkels',
      price: 49.99
    },
    {
      name: 'Cressi Supernova Dry Snorkel',
      description: 'Dry snorkel with flexible tube and comfortable mouthpiece',
      brand: 'Cressi',
      category: 'Snorkels',
      price: 39.99
    },
    {
      name: 'Mares Ergo Dry Snorkel',
      description: 'Ergonomic dry snorkel with anatomical mouthpiece design',
      brand: 'Mares',
      category: 'Snorkels',
      price: 44.99
    },

    // Dive Computers
    {
      name: 'ScubaPro Aladin 2G Dive Computer',
      description: 'Advanced dive computer with air integration and wireless connectivity',
      brand: 'ScubaPro',
      category: 'Dive Computers',
      price: 899.99
    },
    {
      name: 'Cressi Leonardo Dive Computer',
      description: 'User-friendly dive computer with large display and intuitive interface',
      brand: 'Cressi',
      category: 'Dive Computers',
      price: 299.99
    },
    {
      name: 'Mares Puck Pro Dive Computer',
      description: 'Compact dive computer with multiple gas capability and clear display',
      brand: 'Mares',
      category: 'Dive Computers',
      price: 399.99
    },
    {
      name: 'Aqualung i300C Dive Computer',
      description: 'Color display dive computer with air integration and compass',
      brand: 'Aqualung',
      category: 'Dive Computers',
      price: 649.99
    },

    // Accessories
    {
      name: 'ScubaPro Nova 800 Dive Light',
      description: 'High-powered LED dive light with multiple brightness settings',
      brand: 'ScubaPro',
      category: 'Accessories',
      price: 299.99
    },
    {
      name: 'Cressi Compact SMB',
      description: 'Compact surface marker buoy for safety and signaling',
      brand: 'Cressi',
      category: 'Accessories',
      price: 29.99
    },
    {
      name: 'Mares Ergo Knife',
      description: 'Ergonomic dive knife with secure sheath and comfortable grip',
      brand: 'Mares',
      category: 'Accessories',
      price: 79.99
    },
    {
      name: 'Aqualung Storm Whistle',
      description: 'Loud safety whistle for emergency signaling on the surface',
      brand: 'Aqualung',
      category: 'Accessories',
      price: 19.99
    },

    // Weight Systems
    {
      name: 'ScubaPro Weight Belt',
      description: 'Comfortable weight belt with quick-release buckle system',
      brand: 'ScubaPro',
      category: 'Weight Systems',
      price: 49.99
    },
    {
      name: 'Cressi Weight Pockets',
      description: 'Integrated weight pockets for BCD with quick-release system',
      brand: 'Cressi',
      category: 'Weight Systems',
      price: 39.99
    },
    {
      name: 'Mares Ankle Weights',
      description: 'Adjustable ankle weights for improved trim and positioning',
      brand: 'Mares',
      category: 'Weight Systems',
      price: 34.99
    },

    // Training Equipment
    {
      name: 'ScubaPro Training BCD',
      description: 'Durable BCD designed for training and rental operations',
      brand: 'ScubaPro',
      category: 'Training Equipment',
      price: 299.99
    },
    {
      name: 'Cressi Training Regulator',
      description: 'Reliable regulator set perfect for training and certification courses',
      brand: 'Cressi',
      category: 'Training Equipment',
      price: 249.99
    },
    {
      name: 'Mares Training Fins',
      description: 'Affordable fins designed for training and beginner divers',
      brand: 'Mares',
      category: 'Training Equipment',
      price: 89.99
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

  console.log('Scuba diving gear products added successfully!');
}

addSampleProducts().catch(console.error);
