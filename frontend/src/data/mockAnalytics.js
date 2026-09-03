export const revenueTrend = [
  { name: 'Aug 28', risk: 72000, recovered: 39800, lost: 14200 },
  { name: 'Aug 29', risk: 90500, recovered: 55200, lost: 17800 },
  { name: 'Aug 30', risk: 84500, recovered: 49100, lost: 16100 },
  { name: 'Aug 31', risk: 112000, recovered: 70800, lost: 20600 },
  { name: 'Sep 1', risk: 128000, recovered: 83400, lost: 22100 },
  { name: 'Sep 2', risk: 155000, recovered: 104000, lost: 26400 },
  { name: 'Sep 3', risk: 142650, recovered: 129120, lost: 23800 },
]

export const riskDistribution = [
  { name: 'High', value: 24 },
  { name: 'Medium', value: 49 },
  { name: 'Low', value: 27 },
]

export const failureReasons = [
  { name: 'Expired Card', success: 65 },
  { name: 'Network Error', success: 72 },
  { name: 'Authentication', success: 54 },
  { name: 'Insufficient Funds', success: 41 },
  { name: 'Bank Declined', success: 20 },
]

export const actionSuccess = [
  { name: 'Retry Payment', value: 72 },
  { name: 'Payment Method Update', value: 65 },
  { name: 'Checkout Reminder', value: 48 },
  { name: 'Payment Reminder', value: 41 },
  { name: 'Escalate Support', value: 20 },
]

export const eventDistribution = [
  { name: 'Payment Failed', value: 813 },
  { name: 'Checkout Abandoned', value: 561 },
  { name: 'Successful Purchase', value: 2626 },
]
