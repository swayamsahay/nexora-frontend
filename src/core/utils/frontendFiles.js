const REQUIRED_PATHS = ['App.jsx', 'components/Navbar.jsx', 'components/Hero.jsx', 'components/ProductList.jsx', 'components/Footer.jsx']

function sanitizeFilePath(path) {
	if (typeof path !== 'string') return ''
	const trimmed = path.trim().replace(/^\/+/, '')

	if (!trimmed || trimmed.includes('..') || trimmed.includes('\\')) {
		return ''
	}

	return trimmed
}

function sanitizeContent(content) {
	if (typeof content !== 'string') return ''

	return content.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
}

export function buildDefaultFrontendFiles(projectName = 'Nexora Storefront') {
	return [
		{
			path: 'App.jsx',
			content: "import Navbar from './components/Navbar'\nimport Hero from './components/Hero'\nimport ProductList from './components/ProductList'\nimport Footer from './components/Footer'\n\nfunction App() {\n  return (\n    <main className=\"min-h-screen bg-slate-50\">\n      <Navbar />\n      <Hero />\n      <ProductList />\n      <Footer />\n    </main>\n  )\n}\n\nexport default App\n",
		},
		{
			path: 'components/Navbar.jsx',
			content: `function Navbar() {\n  return (\n    <header className=\"border-b border-slate-200 bg-white\">\n      <div className=\"mx-auto flex max-w-6xl items-center justify-between px-6 py-4\">\n        <p className=\"text-lg font-bold text-slate-900\">${projectName}</p>\n        <nav className=\"flex items-center gap-6 text-sm text-slate-600\">\n          <a href=\"#products\">Products</a>\n          <a href=\"#about\">About</a>\n          <a href=\"#contact\">Contact</a>\n        </nav>\n      </div>\n    </header>\n  )\n}\n\nexport default Navbar\n`,
		},
		{
			path: 'components/Hero.jsx',
			content: "function Hero() {\n  return (\n    <section className=\"mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-2\">\n      <div>\n        <p className=\"text-xs font-semibold uppercase tracking-[0.24em] text-slate-500\">New season collection</p>\n        <h1 className=\"mt-4 text-4xl font-semibold text-slate-900\">Modern sneakers built for everyday movement.</h1>\n        <p className=\"mt-4 text-slate-600\">Comfort-first sneakers with premium materials and timeless styling.</p>\n      </div>\n      <div className=\"rounded-3xl border border-slate-200 bg-white p-6\">\n        <div className=\"h-56 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200\" />\n      </div>\n    </section>\n  )\n}\n\nexport default Hero\n",
		},
		{
			path: 'components/ProductList.jsx',
			content: "const products = [\n  { id: 1, name: 'Air Dash', price: '$129' },\n  { id: 2, name: 'Street Lite', price: '$99' },\n  { id: 3, name: 'Cloud Run', price: '$149' },\n]\n\nfunction ProductList() {\n  return (\n    <section id=\"products\" className=\"mx-auto max-w-6xl px-6 py-12\">\n      <h2 className=\"text-2xl font-semibold text-slate-900\">Featured Products</h2>\n      <div className=\"mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3\">\n        {products.map((product) => (\n          <article key={product.id} className=\"rounded-2xl border border-slate-200 bg-white p-4\">\n            <div className=\"h-36 rounded-xl bg-slate-100\" />\n            <p className=\"mt-3 font-semibold text-slate-900\">{product.name}</p>\n            <p className=\"mt-1 text-sm text-slate-500\">{product.price}</p>\n          </article>\n        ))}\n      </div>\n    </section>\n  )\n}\n\nexport default ProductList\n",
		},
		{
			path: 'components/Footer.jsx',
			content: "function Footer() {\n  return (\n    <footer className=\"border-t border-slate-200 bg-white\">\n      <div className=\"mx-auto max-w-6xl px-6 py-6 text-sm text-slate-600\">\n        <p>© 2026 Nexora. All rights reserved.</p>\n      </div>\n    </footer>\n  )\n}\n\nexport default Footer\n",
		},
	]
}

export function ensureFrontendFiles(files) {
	if (!Array.isArray(files) || files.length === 0) {
		throw new Error('Generated output is empty.')
	}

	const normalized = files
		.map((file) => ({
			path: sanitizeFilePath(file?.path),
			content: sanitizeContent(file?.content),
		}))
		.filter((file) => file.path && file.content)

	const byPath = new Map()
	for (const file of normalized) {
		byPath.set(file.path, file)
	}

	for (const requiredPath of REQUIRED_PATHS) {
		if (!byPath.has(requiredPath)) {
			throw new Error(`Missing required generated file: ${requiredPath}`)
		}
	}

	return Array.from(byPath.values())
}
