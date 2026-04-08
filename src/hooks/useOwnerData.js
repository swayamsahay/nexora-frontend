import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'
import { getApiErrorMessage } from '../utils/apiError'

function normalizeArray(value) {
	return Array.isArray(value) ? value : []
}

export function useOwnerData() {
	const [store, setStore] = useState(null)
	const [products, setProducts] = useState([])
	const [orders, setOrders] = useState([])
	const [analytics, setAnalytics] = useState(null)

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [refreshing, setRefreshing] = useState(false)

	const loadData = useCallback(async () => {
		setError('')
		setLoading(true)

		try {
			const [storeResponse, productsResponse, ordersResponse, analyticsResponse] = await Promise.all([
				api.get('/stores/me'),
				api.get('/products/me'),
				api.get('/orders/me'),
				api.get('/analytics/me'),
			])

			setStore(storeResponse?.data?.store ?? storeResponse?.data ?? null)
			setProducts(normalizeArray(productsResponse?.data?.products ?? productsResponse?.data))
			setOrders(normalizeArray(ordersResponse?.data?.orders ?? ordersResponse?.data))
			setAnalytics(analyticsResponse?.data?.analytics ?? analyticsResponse?.data ?? null)
		} catch (err) {
			setError(getApiErrorMessage(err, 'Could not load your workspace data.'))
		} finally {
			setLoading(false)
		}
	}, [])

	const refresh = useCallback(async () => {
		setRefreshing(true)
		try {
			await loadData()
		} finally {
			setRefreshing(false)
		}
	}, [loadData])

	const refreshProducts = useCallback(async () => {
		try {
			const response = await api.get('/products/me')
			setProducts(normalizeArray(response?.data?.products ?? response?.data))
		} catch (err) {
			setError(getApiErrorMessage(err, 'Could not refresh products.'))
		}
	}, [])

	const refreshOrders = useCallback(async () => {
		try {
			const response = await api.get('/orders/me')
			setOrders(normalizeArray(response?.data?.orders ?? response?.data))
		} catch (err) {
			setError(getApiErrorMessage(err, 'Could not refresh orders.'))
		}
	}, [])

	const refreshStore = useCallback(async () => {
		try {
			const response = await api.get('/stores/me')
			setStore(response?.data?.store ?? response?.data ?? null)
		} catch (err) {
			setError(getApiErrorMessage(err, 'Could not refresh store details.'))
		}
	}, [])

	useEffect(() => {
		loadData()
	}, [loadData])

	return {
		store,
		products,
		orders,
		analytics,
		loading,
		error,
		refreshing,
		refresh,
		refreshProducts,
		refreshOrders,
		refreshStore,
	}
}