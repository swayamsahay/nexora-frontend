import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { generateStore } from '../services/ai'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import SectionRenderer from '../components/builder/SectionRenderer'

const defaultLayoutState = {
	header: {
		title: 'Nexora Store',
		subtitle: 'Build your storefront with confidence',
	},
	sections: [],
	theme: {
		accent: '#0f172a',
		background: '#f8fafc',
		text: '#0f172a',
	},
}

const componentCatalog = [
	{ type: 'hero', title: 'Hero', create: () => ({ type: 'hero', content: 'Welcome to my store', subtext: 'A premium shopping experience starts here.' }) },
	{ type: 'products', title: 'Products', create: () => ({ type: 'products', title: 'Featured products', description: 'Discover our latest catalog.' }) },
	{ type: 'footer', title: 'Footer', create: () => ({ type: 'footer', content: 'Thank you for visiting our store.' }) },
]

const readStoreFromResponse = (response) =>
	response?.data?.data?.store || response?.data?.store || response?.data

const readProductsFromResponse = (response) => {
	const payload = response?.data?.data?.products || response?.data?.products || response?.data
	return Array.isArray(payload) ? payload : []
}

const readWebsiteFromResponse = (response) =>
	response?.data?.data?.website || response?.data?.website || response?.data

function Builder() {
	const [store, setStore] = useState(null)
	const [products, setProducts] = useState([])
	const [layoutState, setLayoutState] = useState(defaultLayoutState)
	const [selectedSectionIndex, setSelectedSectionIndex] = useState(null)
	const [isPublished, setIsPublished] = useState(false)
	const [prompt, setPrompt] = useState('')
	const [loading, setLoading] = useState(false)

	const [isLoading, setIsLoading] = useState(true)
	const [isSaving, setIsSaving] = useState(false)
	const [isPublishing, setIsPublishing] = useState(false)
	const [loadError, setLoadError] = useState('')

	const selectedSection =
		selectedSectionIndex !== null ? layoutState.sections[selectedSectionIndex] : null

	useEffect(() => {
		const loadBuilder = async () => {
			setIsLoading(true)
			setLoadError('')

			try {
				const [storeResponse, productsResponse] = await Promise.all([
					api.get('/api/stores/me'),
					api.get('/api/products/me'),
				])

				const nextStore = readStoreFromResponse(storeResponse)
				const nextProducts = readProductsFromResponse(productsResponse)

				setStore(nextStore)
				setProducts(nextProducts)

				const storeId = nextStore?._id || nextStore?.id
				if (!storeId) {
					setLoadError('Create a store before using builder.')
					return
				}

				const websiteResponse = await api.get(`/api/builder/${storeId}`)
				const website = readWebsiteFromResponse(websiteResponse)

				const nextLayout = {
					header: website?.layout?.header || defaultLayoutState.header,
					sections: Array.isArray(website?.layout?.sections) ? website.layout.sections : [],
					theme: website?.layout?.theme || website?.theme || defaultLayoutState.theme,
				}

				setLayoutState(nextLayout)
				setIsPublished(Boolean(website?.isPublished))
			} catch (error) {
				const message = error?.uiMessage || 'Failed to load builder workspace.'
				setLoadError(message)
				toast.error(message)
			} finally {
				setIsLoading(false)
			}
		}

		loadBuilder()
	}, [])

	const sectionSummary = useMemo(
		() =>
			layoutState.sections.map((section, index) => ({
				index,
				type: section.type,
				label:
					section.type === 'hero'
						? section.content || 'Hero'
						: section.type === 'products'
							? section.title || 'Products'
							: section.content || 'Footer',
			})),
		[layoutState.sections]
	)

	const addSection = (factory) => {
		setLayoutState((prev) => ({
			...prev,
			sections: [...prev.sections, factory()],
		}))
		setSelectedSectionIndex(layoutState.sections.length)
	}

	const removeSection = (index) => {
		setLayoutState((prev) => ({
			...prev,
			sections: prev.sections.filter((_, currentIndex) => currentIndex !== index),
		}))

		setSelectedSectionIndex((prevIndex) => {
			if (prevIndex === null) return null
			if (prevIndex === index) return null
			if (prevIndex > index) return prevIndex - 1
			return prevIndex
		})
	}

	const updateHeader = (field, value) => {
		setLayoutState((prev) => ({
			...prev,
			header: {
				...prev.header,
				[field]: value,
			},
		}))
	}

	const updateTheme = (field, value) => {
		setLayoutState((prev) => ({
			...prev,
			theme: {
				...prev.theme,
				[field]: value,
			},
		}))
	}

	const updateSection = (index, patch) => {
		setLayoutState((prev) => ({
			...prev,
			sections: prev.sections.map((section, currentIndex) =>
				currentIndex === index ? { ...section, ...patch } : section,
			),
		}))
	}

	const handleGenerateStore = async () => {
		const trimmedPrompt = prompt.trim()
		if (!trimmedPrompt) {
			toast.error('Enter a prompt to generate a store.')
			return
		}

		try {
			setLoading(true)

			const res = await generateStore(trimmedPrompt)
			const data = res.data.data

			setLayoutState(data?.layout || defaultLayoutState)
			setSelectedSectionIndex(null)
			toast.success('Store generated')
		} catch (err) {
			console.error(err)
			toast.error(err?.uiMessage || 'Failed to generate store.')
		} finally {
			setLoading(false)
		}
	}

	const handleSave = async () => {
		const storeId = store?._id || store?.id
		if (!storeId) {
			toast.error('Create a store before saving builder layout.')
			return
		}

		setIsSaving(true)
		try {
			await api.post('/api/builder/save', {
				storeId,
				layout: layoutState,
				theme: layoutState.theme,
			})
			toast.success('Builder layout saved')
		} catch (error) {
			toast.error(error?.uiMessage || 'Failed to save builder layout.')
		} finally {
			setIsSaving(false)
		}
	}

	const handlePublishToggle = async () => {
		const storeId = store?._id || store?.id
		if (!storeId) {
			toast.error('Create a store before publishing website.')
			return
		}

		setIsPublishing(true)
		try {
			const response = await api.put('/api/builder/publish', {
				storeId,
				isPublished: !isPublished,
			})

			const website = readWebsiteFromResponse(response)
			setIsPublished(Boolean(website?.isPublished))
			toast.success(website?.isPublished ? 'Website published' : 'Website moved to draft')
		} catch (error) {
			toast.error(error?.uiMessage || 'Failed to update publish state.')
		} finally {
			setIsPublishing(false)
		}
	}

	if (isLoading) {
		return <LoadingState message="Loading builder workspace..." />
	}

	if (loadError) {
		return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{loadError}</div>
	}

	return (
		<div className="grid gap-6 xl:grid-cols-[0.95fr_1.3fr_0.95fr]">
			<aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Components</p>
				<h2 className="mt-2 text-xl font-semibold text-slate-950">Left panel</h2>

				<div className="mt-4 space-y-3">
					{componentCatalog.map((item) => (
						<button
							key={item.type}
							type="button"
							onClick={() => addSection(item.create)}
							className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
						>
							Add {item.title}
						</button>
					))}
				</div>

				<div className="mt-6">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Current sections</p>
					<div className="mt-3 space-y-2">
						{sectionSummary.length === 0 ? (
							<EmptyState title="No sections yet" message="Click any component above to add sections." />
						) : (
							sectionSummary.map((item) => (
								<div
									key={`${item.type}-${item.index}`}
									className={`flex items-center justify-between rounded-2xl border px-3 py-2 ${selectedSectionIndex === item.index ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
								>
									<button
										type="button"
										onClick={() => setSelectedSectionIndex(item.index)}
										className="truncate text-left text-sm font-medium"
									>
										{item.label}
									</button>
									<button
										type="button"
										onClick={() => removeSection(item.index)}
										className={`rounded-lg px-2 py-1 text-xs font-semibold ${selectedSectionIndex === item.index ? 'bg-white/15 text-white' : 'bg-rose-50 text-rose-700'}`}
									>
										Remove
									</button>
								</div>
							))
						)}
					</div>
				</div>
			</aside>

			<section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live preview</p>
				<h2 className="mt-2 text-xl font-semibold text-slate-950">Center panel</h2>

				<div
					className="mt-4 rounded-3xl border p-5"
					style={{ backgroundColor: layoutState.theme.background || '#f8fafc', borderColor: `${layoutState.theme.accent || '#0f172a'}33` }}
				>
					<header className="mb-5 rounded-2xl border border-slate-200 bg-white/80 p-4">
						<p className="text-2xl font-semibold" style={{ color: layoutState.theme.text || '#0f172a' }}>
							{layoutState.header.title || 'Nexora Store'}
						</p>
						<p className="mt-1 text-sm" style={{ color: `${layoutState.theme.text || '#0f172a'}cc` }}>
							{layoutState.header.subtitle || 'Build your storefront with confidence'}
						</p>
					</header>

					<div className="space-y-4">
						{layoutState.sections.length === 0 ? (
							<EmptyState title="Preview is empty" message="Add Hero, Products, or Footer sections from the left panel." />
						) : (
							layoutState.sections.map((section, index) => (
								<div key={`${section.type}-${index}`} className={selectedSectionIndex === index ? 'ring-2 ring-slate-900/20 rounded-3xl' : ''}>
									<SectionRenderer section={section} products={products} showCheckout={false} theme={layoutState.theme} />
								</div>
							))
						)}
					</div>
				</div>
			</section>

			<aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Settings</p>
				<h2 className="mt-2 text-xl font-semibold text-slate-950">Right panel</h2>

				<div className="mt-4 space-y-4">
					<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
						<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">AI store prompt</label>
						<textarea
							value={prompt}
							onChange={(event) => setPrompt(event.target.value)}
							className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
							placeholder="Describe the storefront you want to generate"
						/>
						<button
							type="button"
							onClick={handleGenerateStore}
							disabled={loading || !prompt.trim()}
							className="mt-3 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
						>
							{loading ? 'Generating...' : 'Generate Store'}
						</button>
					</div>

					<div>
						<label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Header title</label>
						<input
							type="text"
							value={layoutState.header.title || ''}
							onChange={(event) => updateHeader('title', event.target.value)}
							className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
						/>
					</div>

					<div>
						<label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Header subtitle</label>
						<input
							type="text"
							value={layoutState.header.subtitle || ''}
							onChange={(event) => updateHeader('subtitle', event.target.value)}
							className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
						/>
					</div>

					<div className="grid grid-cols-3 gap-2">
						<div>
							<label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Accent</label>
							<input type="color" value={layoutState.theme.accent || '#0f172a'} onChange={(event) => updateTheme('accent', event.target.value)} className="h-10 w-full rounded-lg border border-slate-200" />
						</div>
						<div>
							<label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Background</label>
							<input type="color" value={layoutState.theme.background || '#f8fafc'} onChange={(event) => updateTheme('background', event.target.value)} className="h-10 w-full rounded-lg border border-slate-200" />
						</div>
						<div>
							<label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Text</label>
							<input type="color" value={layoutState.theme.text || '#0f172a'} onChange={(event) => updateTheme('text', event.target.value)} className="h-10 w-full rounded-lg border border-slate-200" />
						</div>
					</div>

					{selectedSection ? (
						<div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
							<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Section settings</p>
							<p className="mt-2 text-sm font-semibold text-slate-900">{selectedSection.type}</p>

							{selectedSection.type === 'hero' ? (
								<div className="mt-3 space-y-2">
									<input type="text" value={selectedSection.content || ''} onChange={(event) => updateSection(selectedSectionIndex, { content: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Hero headline" />
									<textarea value={selectedSection.subtext || ''} onChange={(event) => updateSection(selectedSectionIndex, { subtext: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Hero subtext" />
								</div>
							) : null}

							{selectedSection.type === 'products' ? (
								<div className="mt-3 space-y-2">
									<input type="text" value={selectedSection.title || ''} onChange={(event) => updateSection(selectedSectionIndex, { title: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Products heading" />
									<textarea value={selectedSection.description || ''} onChange={(event) => updateSection(selectedSectionIndex, { description: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Products description" />
								</div>
							) : null}

							{selectedSection.type === 'footer' ? (
								<div className="mt-3">
									<textarea value={selectedSection.content || ''} onChange={(event) => updateSection(selectedSectionIndex, { content: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Footer text" />
								</div>
							) : null}
						</div>
					) : (
						<EmptyState title="No section selected" message="Select a section from left panel to edit content." />
					)}

					<div className="space-y-3">
						<button type="button" onClick={handleSave} disabled={isSaving} className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
							{isSaving ? 'Saving...' : 'Save Builder'}
						</button>
						<button type="button" onClick={handlePublishToggle} disabled={isPublishing} className="w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60">
							{isPublishing ? 'Updating...' : isPublished ? 'Unpublish Website' : 'Publish Website'}
						</button>
					</div>

					<div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
						<p>Store: {store?.name || 'N/A'}</p>
						<p>Status: {isPublished ? 'Published' : 'Draft'}</p>
					</div>
				</div>
			</aside>
		</div>
	)
}

export default Builder