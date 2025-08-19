import { getDb } from './db.js';

async function addSampleSessions() {
  const db = await getDb();

  console.log('Adding sample course sessions...');

  // Get current date and create sessions for the next 2 months
  const now = new Date();
  const sessions = [];

  // Create sessions for different courses
  const courseIds = [1, 2, 3, 4]; // Assuming we have 4 courses
  const instructors = [1, 2, 3]; // Assuming we have 3 instructors

  // Generate sessions for the next 60 days
  for (let day = 0; day < 60; day++) {
    const sessionDate = new Date(now);
    sessionDate.setDate(sessionDate.getDate() + day);
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (sessionDate.getDay() === 0 || sessionDate.getDay() === 6) {
      continue;
    }

    // Create 1-2 sessions per day
    const sessionsPerDay = Math.random() > 0.5 ? 1 : 2;
    
    for (let session = 0; session < sessionsPerDay; session++) {
      const courseId = courseIds[Math.floor(Math.random() * courseIds.length)];
      const instructorId = instructors[Math.floor(Math.random() * instructors.length)];
      
      // Set time to 9 AM or 2 PM
      const hour = session === 0 ? 9 : 14;
      sessionDate.setHours(hour, 0, 0, 0);
      
      // Random capacity between 8 and 15
      const capacity = Math.floor(Math.random() * 8) + 8;
      
      sessions.push({
        courseId,
        instructorId,
        startAt: sessionDate.toISOString(),
        capacity
      });
    }
  }

  // Insert sessions
  for (const session of sessions) {
    try {
      await db.run(`
        INSERT INTO course_sessions (course_id, instructor_id, start_at, capacity)
        VALUES (?, ?, ?, ?)
      `, [session.courseId, session.instructorId, session.startAt, session.capacity]);
    } catch (error) {
      console.error('Error inserting session:', error);
    }
  }

  console.log(`Added ${sessions.length} sample sessions`);
  console.log('Sample sessions added successfully!');
}

addSampleSessions().catch(console.error);
