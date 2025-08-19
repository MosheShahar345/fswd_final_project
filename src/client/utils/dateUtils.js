// Date formatting utilities for consistent dd/mm/yyyy format across the application

/**
 * Format date to dd/mm/yyyy format
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date in dd/mm/yyyy format
 */
export const formatDate = (date) => {
  const dateObj = new Date(date);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format date to dd/mm/yyyy with time
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (date) => {
  const dateObj = new Date(date);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format date range for trips (start - end)
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Format time only (HH:MM)
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted time
 */
export const formatTime = (date) => {
  const dateObj = new Date(date);
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
