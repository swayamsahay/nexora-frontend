const currencyFormatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0,
})

const compactFormatter = new Intl.NumberFormat('en-US', {
	notation: 'compact',
	maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
})

export function formatCurrency(value) {
	const amount = Number(value || 0)
	return currencyFormatter.format(Number.isFinite(amount) ? amount : 0)
}

export function formatCompactNumber(value) {
	const amount = Number(value || 0)
	return compactFormatter.format(Number.isFinite(amount) ? amount : 0)
}

export function buildTrendSeries(orders = []) {
	const seriesMap = new Map()

	orders.forEach((order) => {
		const sourceDate = order?.createdAt || order?.paymentProcessedAt || order?.updatedAt
		const date = sourceDate ? new Date(sourceDate) : new Date()
		const dateKey = Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10)
		const previous = seriesMap.get(dateKey) || { date: dateKey, revenue: 0, orders: 0 }

		seriesMap.set(dateKey, {
			date: dateKey,
			revenue: previous.revenue + Number(order?.totalAmount || 0),
			orders: previous.orders + 1,
		})
	})

	return Array.from(seriesMap.values())
		.sort((first, second) => first.date.localeCompare(second.date))
		.map((entry) => ({
			...entry,
			label: dateFormatter.format(new Date(entry.date)),
		}))
}

export function buildProductStatusBreakdown(products = []) {
	return [
		{
			label: 'In stock',
			value: products.filter((product) => Number(product?.stock || 0) > 0).length,
		},
		{
			label: 'Low stock',
			value: products.filter((product) => Number(product?.stock || 0) > 0 && Number(product?.stock || 0) <= 5).length,
		},
		{
			label: 'Out of stock',
			value: products.filter((product) => Number(product?.stock || 0) <= 0).length,
		},
	]
}