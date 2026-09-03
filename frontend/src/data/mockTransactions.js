export const transactions = [
  { id: 3658, customerId: 3, eventType: 'PAYMENT_FAILED', amount: 5830.2, failureReason: 'EXPIRED_CARD', riskLevel: 'MEDIUM', status: 'RECOVERED', timestamp: '2026-09-03T14:32:08' },
  { id: 2841, customerId: 717, eventType: 'CHECKOUT_ABANDONED', amount: 16596.41, failureReason: null, riskLevel: 'HIGH', status: 'PENDING', timestamp: '2026-09-03T13:42:15' },
  { id: 4012, customerId: 88, eventType: 'PAYMENT_FAILED', amount: 8290, failureReason: 'NETWORK_ERROR', riskLevel: 'HIGH', status: 'RECOVERED', timestamp: '2026-09-03T13:18:43' },
  { id: 3104, customerId: 102, eventType: 'SUCCESSFUL_PURCHASE', amount: 9240, failureReason: null, riskLevel: null, status: 'COMPLETED', timestamp: '2026-09-03T12:56:11' },
  { id: 4390, customerId: 221, eventType: 'PAYMENT_FAILED', amount: 12880.4, failureReason: 'AUTHENTICATION_FAILED', riskLevel: 'MEDIUM', status: 'PENDING', timestamp: '2026-09-03T12:21:02' },
  { id: 2298, customerId: 414, eventType: 'CHECKOUT_ABANDONED', amount: 4340.7, failureReason: null, riskLevel: 'LOW', status: 'FAILED', timestamp: '2026-09-03T11:59:38' },
  { id: 1784, customerId: 56, eventType: 'PAYMENT_FAILED', amount: 19760, failureReason: 'BANK_DECLINED', riskLevel: 'HIGH', status: 'PENDING', timestamp: '2026-09-03T11:11:25' },
  { id: 4581, customerId: 302, eventType: 'SUCCESSFUL_PURCHASE', amount: 3390, failureReason: null, riskLevel: null, status: 'COMPLETED', timestamp: '2026-09-03T10:47:51' },
]

export const intelligence = {
  3658: {
    transaction: transactions[0],
    risk: { amountAtRisk: 5830.2, riskLevel: 'MEDIUM', failureReason: 'EXPIRED_CARD', cause: 'CUSTOMER_ACTION_REQUIRED', recoverability: 'MEDIUM' },
    customer: { customerId: 3, customerType: 'Returning', previousPurchases: 11, totalSpending: 52174.07, clv: 61098.38, averageOrderValue: 4743.1, customerValue: 'MEDIUM' },
    decision: { priority: 'MEDIUM', action: 'REQUEST_PAYMENT_METHOD_UPDATE', reason: 'Card expired. Customer action is required before the payment can be retried.', recoverability: 'MEDIUM' },
    recovery: { simulationResult: 'PAYMENT_METHOD_UPDATED', success: true, revenueRecovered: 5830.2, revenueLost: 0 },
  },
}
