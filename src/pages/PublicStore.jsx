import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import SectionRenderer from '../components/builder/SectionRenderer'

const fallbackLayout = {
	header: {
		title: 'Nexora Store',
		subtitle: 'Welcome to our storefront',
	},
	sections: [
		{ type: 'hero', content: 'Welcome to my store', subtext: 'Explore our latest products.' },
		{ type: 'products', title: 'Featured products', description: 'Shop from the live catalog.' },
		{ type: 'footer', content: 'Thanks for visiting.' },
	],
	theme: {
		accent: '#0f172a',
		background: '#f8fafc',
		text: '#0f172a',
	},
}

const readStoreFromResponse = (response) =>
	response?.data?.data?.store || response?.data?.store || response?.data

const readProductsFromResponse = (response) => {
	const payload = response?.data?.data?.products || response?.data?.products || response?.data
	return Array.isArray(payload) ? payload : []
}

const readWebsiteFromResponse = (response) =>
	response?.data?.data?.website || response?.data?.website || response?.data

function PublicStore() {
	const { slug } = useParams()
	const [store, setStore] = useState(null)
	const [products, setProducts] = useState([])
	const [layoutState, setLayoutState] = useState(fallbackLayout)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState('')
	const [buyingProductId, setBuyingProductId] = useState(null)
	const [buyError, setBuyError] = useState('')

	useEffect(() => {
		const fetchPublicStoreData = async () => {
			setError('')
			setIsLoading(true)

			try {
				const [storeResponse, productsResponse] = await Promise.all([
					api.get(`/api/stores/public/${slug}`),
					api.get(`/api/products/public/${slug}`),
				])

				const nextStore = readStoreFromResponse(storeResponse)
				const nextProducts = readProductsFromResponse(productsResponse)
				setStore(nextStore)
				setProducts(nextProducts)

				const storeId = nextStore?._id || nextStore?.id
				if (!storeId) {
					setLayoutState(fallbackLayout)
					return
				}

				try {
					const websiteResponse = await api.get(`/api/builder/public/${storeId}`)
					const website = readWebsiteFromResponse(websiteResponse)

					if (website?.layout) {
						setLayoutState({
							header: website.layout.header || fallbackLayout.header,
							sections: Array.isArray(website.layout.sections) && website.layout.sections.length > 0 ? website.layout.sections : fallbackLayout.sections,
							theme: website.layout.theme || website.theme || fallbackLayout.theme,
						})
					}
				} catch {
					setLayoutState(fallbackLayout)
				}
			} catch (err) {
				setError(err?.uiMessage || 'Could not load store data.')
				toast.error('Could not load store data')
			} finally {
				setIsLoading(false)
			}
		}

		if (slug) {
			fetchPublicStoreData()
		}
	}, [slug])

	const headerTitle = useMemo(
		() => layoutState?.header?.title || store?.name || 'Nexora Store',
		[layoutState?.header?.title, store?.name],
	)

	const headerSubtitle = useMemo(
		() => layoutState?.header?.subtitle || store?.description || 'Welcome to our storefront',
		[layoutState?.header?.subtitle, store?.description],
	)

	const handleBuy = async (product) => {
		const productId = product._id || product.id

		if (!productId) {
			setBuyError('Product ID is missing.')
			return
		}

		setBuyError('')
		setBuyingProductId(productId)

		try {
			const orderResponse = await api.post('/api/orders', {
				productId,
				quantity: 1,
			})

			const orderId =
				orderResponse?.data?.data?._id ||
				orderResponse?.data?.order?._id ||
				orderResponse?.data?.order?.id ||
				orderResponse?.data?._id ||
				orderResponse?.data?.id

			if (!orderId) {
				throw new Error('Order ID missing from create order response')
			}

			const razorpayResponse = await api.post('/api/orders/create-razorpay-order', { orderId })
			const razorOrder = razorpayResponse?.data?.data || razorpayResponse?.data?.order || razorpayResponse?.data

			if (!razorOrder?.id || !razorOrder?.amount) {
				throw new Error('Razorpay order data is incomplete')
			}

			if (!window.Razorpay) {
				throw new Error('Razorpay SDK not loaded')
			}

			const options = {
				key: import.meta.env.VITE_RAZORPAY_KEY || 'YOUR_RAZORPAY_KEY',
				amount: razorOrder.amount,
				currency: razorOrder.currency || 'INR',
				name: 'Nexora',
				description: product.name,
				order_id: razorOrder.id,
				handler: async (response) => {
					try {
						await api.post('/api/orders/verify-payment', {
							razorpay_order_id: response.razorpay_order_id,
							razorpay_payment_id: response.razorpay_payment_id,
							razorpay_signature: response.razorpay_signature,
						})

						toast.success('Payment Successful')
					} catch {
						toast.error('Payment verification failed')
					}
				},
				theme: { color: layoutState?.theme?.accent || '#0f172a' },
			}

			const rzp = new window.Razorpay(options)
			rzp.on('payment.failed', () => {
				toast.error('Payment failed')
			})
			rzp.open()
		} catch (err) {
			setBuyError(err?.uiMessage || 'Could not start purchase flow.')
			toast.error('Payment failed')
		} finally {
			setBuyingProductId(null)
		}
	}

	if (isLoading) {
		return <LoadingState message="Loading store..." />
	}

	if (error) {
		return <ErrorState message={error} />
	}

	return (
		<main className="min-h-screen px-4 py-8" style={{ backgroundColor: layoutState.theme.background || '#f8fafc' }}>
			<div className="mx-auto w-full max-w-7xl space-y-6">
				<header className="rounded-3xl border bg-white/85 p-6 shadow-sm" style={{ borderColor: `${layoutState.theme.accent || '#0f172a'}33` }}>
					<p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: `${layoutState.theme.text || '#0f172a'}99` }}>
						Public website
					</p>
					<h1 className="mt-2 text-3xl font-semibold tracking-tight" style={{ color: layoutState.theme.text || '#0f172a' }}>
						{headerTitle}
					</h1>
					<p className="mt-2 text-sm" style={{ color: `${layoutState.theme.text || '#0f172a'}cc` }}>
						{headerSubtitle}
					</p>
				</header>

				{buyError ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{buyError}</p> : null}

				<div className="space-y-4">
					{layoutState.sections.length === 0 ? (
						<EmptyState title="No sections configured" message="This store has no published sections yet." />
					) : (
						layoutState.sections.map((section, index) => (
							<SectionRenderer
								key={`${section.type}-${index}`}
								section={section}
								products={products}
								onBuy={handleBuy}
								buyingProductId={buyingProductId}
								showCheckout
								theme={layoutState.theme}
							/>
						))
					)}
				</div>
			</div>
		</main>
	)
}

export default PublicStore