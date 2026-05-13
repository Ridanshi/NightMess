// src/utils/orderUtils.js

/**
 * Calculate global order numbers for all orders of a specific date.
 * Global order numbers are assigned only to orders with status "Confirmed" or "Ready",
 * sorted by their approval timestamp (updatedAt, or createdAt, or ObjectId timestamp).
 * 
 * @param {Array} allOrders - Array of all orders (from all clients/vendors)
 * @param {string} date - Date string in YYYY-MM-DD format to group orders by
 * @param {Function} formatLocalDate - Function to convert Date or string to YYYY-MM-DD string
 * @returns {Object} - Map of orderId to global order number (1-based)
 */
export function calculateGlobalOrderNumbersForDate(allOrders, date, formatLocalDate) {
  // Filter all orders for the given date
  const allOrdersForDate = allOrders.filter(order => {
    const orderDate = order.createdAt
      ? formatLocalDate(order.createdAt)
      : formatLocalDate(new Date(parseInt(order._id.substring(0, 8), 16) * 1000));
    return orderDate === date;
  });

  // Filter orders only with status "Confirmed" or "Ready"
  const approvedOrders = allOrdersForDate.filter(
    o => o.status === "Confirmed" || o.status === "Ready"
  );

  // Sort approved orders by approval timestamp ascending (updatedAt or createdAt or _id)
  const sortedByApproval = [...approvedOrders].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || a._id);
    const timeB = new Date(b.updatedAt || b.createdAt || b._id);
    return timeA - timeB;
  });

  // Assign global order numbers starting at 1
  const globalOrderNumberMap = {};
  sortedByApproval.forEach((order, index) => {
    globalOrderNumberMap[order._id] = index + 1;
  });

  return globalOrderNumberMap;
}
