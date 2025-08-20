import { getDb } from '../infra/db.js';
export class RefundService {
static async createRefundRequest(userId, enrollmentId, courseId, amount, reason) {
const startTime = Date.now();
const db = await getDb();
try {
const result = await db.run(`
INSERT INTO refunds (user_id, enrollment_id, course_id, amount, reason, status)
VALUES (?, ?, ?, ?, ?, 'pending')
`, [userId, enrollmentId, courseId, amount, reason]);
const duration = Date.now() - startTime;
return {
id: result.lastID,
userId,
enrollmentId,
courseId,
amount,
reason,
status: 'pending'
};
} catch (error) {
const duration = Date.now() - startTime;
throw error;
}
}
static async getRefundsByUser(userId) {
const startTime = Date.now();
const db = await getDb();
try {
const refunds = await db.all(`
SELECT 
r.*,
c.title as course_title,
c.level as course_level,
e.created_at as enrollment_date
FROM refunds r
JOIN courses c ON r.course_id = c.id
JOIN enrollments e ON r.enrollment_id = e.id
WHERE r.user_id = ?
ORDER BY r.created_at DESC
`, [userId]);
const duration = Date.now() - startTime;
return refunds;
} catch (error) {
const duration = Date.now() - startTime;
throw error;
}
}
static async getAllRefunds() {
const startTime = Date.now();
const db = await getDb();
try {
const refunds = await db.all(`
SELECT 
r.*,
u.name as user_name,
u.email as user_email,
c.title as course_title,
c.level as course_level,
e.created_at as enrollment_date
FROM refunds r
JOIN users u ON r.user_id = u.id
JOIN courses c ON r.course_id = c.id
JOIN enrollments e ON r.enrollment_id = e.id
ORDER BY r.created_at DESC
`);
const duration = Date.now() - startTime;
return refunds;
} catch (error) {
const duration = Date.now() - startTime;
throw error;
}
}
static async updateRefundStatus(refundId, status, processedBy = null) {
const startTime = Date.now();
const db = await getDb();
try {
const processedAt = status === 'processed' ? new Date().toISOString() : null;
const result = await db.run(`
UPDATE refunds 
SET status = ?, processed_at = ?
WHERE id = ?
`, [status, processedAt, refundId]);
if (result.changes === 0) {
throw new Error('Refund not found');
}
const duration = Date.now() - startTime;
return { success: true, refundId, status };
} catch (error) {
const duration = Date.now() - startTime;
throw error;
}
}
static async getRefundStats() {
const startTime = Date.now();
const db = await getDb();
try {
const stats = await db.get(`
SELECT 
COUNT(*) as total_refunds,
COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_refunds,
COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_refunds,
COUNT(CASE WHEN status = 'processed' THEN 1 END) as processed_refunds,
COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_refunds,
SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved_amount,
SUM(CASE WHEN status = 'processed' THEN amount ELSE 0 END) as processed_amount
FROM refunds
`);
const duration = Date.now() - startTime;
return stats;
} catch (error) {
const duration = Date.now() - startTime;
throw error;
}
}
}
