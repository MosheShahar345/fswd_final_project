import { getDb } from './db.js';

const checkSuspendedUser = async () => {
  const db = await getDb();
  
  // Check if suspended user exists
  const user = await db.get('SELECT * FROM users WHERE email = ?', ['suspended@adventuregear.com']);
  
  if (user) {
    console.log('Suspended user found:');
    console.log('- ID:', user.id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Status:', user.status);
    console.log('- Role:', user.role);
  } else {
    console.log('Suspended user not found. Creating one...');
    
    // Create suspended user
    const bcrypt = await import('bcryptjs');
    const userHash = await bcrypt.default.hash('user123', 10);
    
    await db.run(`
      INSERT OR IGNORE INTO users (id, name, email, hash, role, status) 
      VALUES (5, 'Suspended User', 'suspended@adventuregear.com', ?, 'member', 'suspended')
    `, [userHash]);
    
    console.log('Suspended user created: suspended@adventuregear.com / user123');
  }
};

checkSuspendedUser().catch(console.error);

