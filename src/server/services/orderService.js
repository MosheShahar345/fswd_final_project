import { getDb } from '../infra/db.js';
import { ConflictError, ValidationError } from '../middlewares/error.js';
export class OrderService {
static async createOrder(userId, orderData) {
const startTime = Date.now();
const db = await getDb();
try {
// Start transaction
await db.run('BEGIN TRANSACTION');
// Create order
const orderResult = await db.run(`
INSERT INTO orders (user_id, total, status, payment_id) 
VALUES (?, ?, ?, ?)
`, [userId, orderData.total, 'pending', orderData.paymentId]);
const orderId = orderResult.lastID;
// Create order items
if (orderData.items && orderData.items.length > 0) {
for (const item of orderData.items) {
await db.run(`
INSERT INTO order_items (order_id, product_id, qty, price) 
VALUES (?, ?, ?, ?)
`, [orderId, item.productId, item.quantity, item.price]);
// Update inventory
await db.run(`
UPDATE inventory 
SET qty_on_hand = qty_on_hand - ? 
WHERE product_id = ?
`, [item.quantity, item.productId]);
}
}
// Create course enrollments
if (orderData.courses && orderData.courses.length > 0) {
for (const course of orderData.courses) {
// Check if session exists and has capacity
const session = await db.get(`
SELECT cs.*, c.title as course_title, c.level as course_level, c.price as course_price
FROM course_sessions cs
JOIN courses c ON cs.course_id = c.id
WHERE cs.id = ? AND cs.course_id = ?
`, [course.sessionId, course.courseId]);
if (!session) {
throw new Error('Course session not found');
}
// Check if user is already enrolled (only active enrollments)
const existingEnrollment = await db.get(`
SELECT id FROM enrollments 
WHERE user_id = ? AND session_id = ? AND status = 'enrolled'
`, [userId, course.sessionId]);
if (existingEnrollment) {
throw new ConflictError('You are already enrolled in this course session');
}
// Check session capacity
const enrolledCount = await db.get(`
SELECT COUNT(*) as count FROM enrollments WHERE session_id = ?
`, [course.sessionId]);
if (enrolledCount.count >= session.capacity) {
throw new Error('Course session is full');
}
// Create enrollment
await db.run(`
INSERT INTO enrollments (user_id, session_id, order_id, status, created_at) 
VALUES (?, ?, ?, ?, datetime('now'))
`, [userId, course.sessionId, orderId, 'enrolled']);
}
}
// Create trip bookings
if (orderData.trips && orderData.trips.length > 0) {
for (const trip of orderData.trips) {
// Check if trip exists and has available seats
const tripData = await db.get(`
SELECT t.*, COUNT(tb.id) as seats_taken
FROM trips t
LEFT JOIN trip_bookings tb ON t.id = tb.trip_id AND tb.status = 'confirmed'
WHERE t.id = ? AND t.active = 1
GROUP BY t.id
`, [trip.tripId]);
if (!tripData) {
throw new Error('Trip not found');
}
if (tripData.seats_taken >= tripData.seats_total) {
throw new Error('Trip is full');
}
// Check if user already booked this trip
const existingBooking = await db.get(`
SELECT id FROM trip_bookings 
WHERE trip_id = ? AND user_id = ? AND status = 'confirmed'
`, [trip.tripId, userId]);
if (existingBooking) {
throw new Error('Already booked this trip');
}
// Create booking
await db.run(`
INSERT INTO trip_bookings (trip_id, user_id, order_id, status, paid_amount, created_at)
VALUES (?, ?, ?, 'confirmed', ?, datetime('now'))
`, [trip.tripId, userId, orderId, trip.price]);
}
}
// Commit transaction
await db.run('COMMIT');
const duration = Date.now() - startTime;
return { orderId, success: true };
} catch (error) {
// Rollback transaction on error
await db.run('ROLLBACK');
const duration = Date.now() - startTime;
throw error;
}
}
static async getOrderById(orderId, userId) {
const startTime = Date.now();
const db = await getDb();
try {
const order = await db.get(`
SELECT 
o.id,
o.total,
o.status,
o.created_at,
o.payment_id
FROM orders o
WHERE o.id = ? AND o.user_id = ?
`, [orderId, userId]);
if (!order) {
throw new Error('Order not found');
}
const orderItems = await db.all(`
SELECT 
oi.id,
oi.qty,
oi.price,
p.name as product_name,
p.brand,
p.category
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = ?
`, [orderId]);
// Get course enrollments for this order
const enrollments = await db.all(`
SELECT 
e.id,
e.status,
e.created_at,
c.title as course_title,
c.subtitle as course_subtitle,
c.level as course_level,
c.price as course_price,
cs.start_at,
cs.capacity
FROM enrollments e
JOIN course_sessions cs ON e.session_id = cs.id
JOIN courses c ON cs.course_id = c.id
WHERE e.order_id = ?
`, [orderId]);
// Get trip bookings for this order
const tripBookings = await db.all(`
SELECT 
tb.id,
tb.status,
tb.paid_amount,
tb.created_at,
t.title as trip_title,
t.location,
t.start_date,
t.end_date,
t.difficulty
FROM trip_bookings tb
JOIN trips t ON tb.trip_id = t.id
WHERE tb.order_id = ? 
AND tb.status = 'confirmed'
`, [orderId]);
const duration = Date.now() - startTime;
return {
order,
items: orderItems,
courses: enrollments,
trips: tripBookings
};
} catch (error) {
const duration = Date.now() - startTime;
throw error;
}
}
static async getUserOrders(userId) {
const startTime = Date.now();
const db = await getDb();
try {
const orders = await db.all(`
SELECT 
o.id,
o.total,
o.status,
o.created_at,
COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = ?
GROUP BY o.id
ORDER BY o.created_at DESC
`, [userId]);
const duration = Date.now() - startTime;
return orders;
} catch (error) {
const duration = Date.now() - startTime;
throw new Error('Failed to fetch user orders');
}
}
static async updateOrderStatus(orderId, userId, status) {
const startTime = Date.now();
const db = await getDb();
try {
const result = await db.run(`
UPDATE orders 
SET status = ? 
WHERE id = ? AND user_id = ?
`, [status, orderId, userId]);
if (result.changes === 0) {
throw new Error('Order not found or no changes made');
}
const duration = Date.now() - startTime;
return { success: true };
} catch (error) {
const duration = Date.now() - startTime;
throw error;
}
}
}
