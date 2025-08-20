import { DashboardService } from '../services/dashboardService.js';
import { asyncHandler } from '../middlewares/error.js';
import { NotFoundError } from '../middlewares/error.js';
export class DashboardController {
static getDashboardData = asyncHandler(async (req, res) => {
const startTime = Date.now();
const userId = req.user.id;
try {
// Fetch all dashboard data in parallel
const [orders, enrollments, tripBookings, stats] = await Promise.all([
DashboardService.getUserOrders(userId),
DashboardService.getUserEnrollments(userId),
DashboardService.getUserTripBookings(userId),
DashboardService.getDashboardStats(userId)
]);
const dashboardData = {
stats,
recentOrders: orders,
recentEnrollments: enrollments,
recentTripBookings: tripBookings
};
const responseTime = Date.now() - startTime;
res.status(200).json(dashboardData);
} catch (error) {
const responseTime = Date.now() - startTime;
throw error;
}
});
static getOrderDetails = asyncHandler(async (req, res) => {
const startTime = Date.now();
const userId = req.user.id;
const orderId = parseInt(req.params.orderId);
if (!orderId || isNaN(orderId)) {
throw new NotFoundError('Order');
}
try {
const orderDetails = await DashboardService.getOrderDetails(orderId, userId);
const responseTime = Date.now() - startTime;
res.status(200).json(orderDetails);
} catch (error) {
const responseTime = Date.now() - startTime;
throw error;
}
});
static getEnrollmentDetails = asyncHandler(async (req, res) => {
const startTime = Date.now();
const userId = req.user.id;
const enrollmentId = parseInt(req.params.enrollmentId);
if (!enrollmentId || isNaN(enrollmentId)) {
throw new NotFoundError('Enrollment');
}
try {
const enrollmentDetails = await DashboardService.getEnrollmentDetails(enrollmentId, userId);
const responseTime = Date.now() - startTime;
res.status(200).json(enrollmentDetails);
} catch (error) {
const responseTime = Date.now() - startTime;
throw error;
}
});
static getTripBookingDetails = asyncHandler(async (req, res) => {
const startTime = Date.now();
const userId = req.user.id;
const bookingId = parseInt(req.params.bookingId);
if (!bookingId || isNaN(bookingId)) {
throw new NotFoundError('Trip booking');
}
try {
const bookingDetails = await DashboardService.getTripBookingDetails(bookingId, userId);
const responseTime = Date.now() - startTime;
res.status(200).json(bookingDetails);
} catch (error) {
const responseTime = Date.now() - startTime;
throw error;
}
});
static getUserStats = asyncHandler(async (req, res) => {
const startTime = Date.now();
const userId = req.user.id;
try {
const stats = await DashboardService.getDashboardStats(userId);
const responseTime = Date.now() - startTime;
res.status(200).json(stats);
} catch (error) {
const responseTime = Date.now() - startTime;
throw error;
}
});
}
