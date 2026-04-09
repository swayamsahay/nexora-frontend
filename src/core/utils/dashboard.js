export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(Number(value || 0))
}

export function buildTrendSeries(orders = []) {
  return Array.isArray(orders) ? orders.slice(0, 8).map((order, index) => ({ label: order?.label || `Day ${index + 1}`, revenue: Number(order?.revenue || 0), orders: Number(order?.orders || 0) })) : []
}

export function buildProductStatusBreakdown(products = []) {
  const total = Array.isArray(products) ? products.length : 0
  return [
    { label: 'Total products', value: total },
    { label: 'In stock', value: products.filter((product) => Number(product?.stock || 0) > 0).length },
    { label: 'Out of stock', value: products.filter((product) => Number(product?.stock || 0) <= 0).length },
  ]
}
