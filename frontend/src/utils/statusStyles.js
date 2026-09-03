export const labelize = (value = '') =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export const toneFor = (value = '') => {
  const key = value.toUpperCase()
  if (['RECOVERED', 'COMPLETED', 'SUCCESS', 'LOW'].includes(key)) return 'success'
  if (['MEDIUM', 'PENDING', 'IN_PROGRESS'].includes(key)) return 'warning'
  if (['HIGH', 'FAILED', 'LOST'].includes(key)) return 'danger'
  if (['PAYMENT_FAILED'].includes(key)) return 'violet'
  if (['CHECKOUT_ABANDONED'].includes(key)) return 'amber'
  return 'neutral'
}
