const COMPONENT_LIBRARY = [
	{ type: 'navbar', label: 'Navbar' },
	{ type: 'hero', label: 'Hero' },
	{ type: 'features', label: 'Features' },
	{ type: 'products', label: 'Products' },
	{ type: 'footer', label: 'Footer' },
]

const DEFAULT_PROPS = {
	navbar: { title: 'Nexora Store', links: 'Home,Products,About,Contact' },
	hero: { heading: 'Welcome to Nexora', subheading: 'Build and launch your storefront faster.', buttonText: 'Shop now' },
	features: { title: 'Why choose us', items: 'Fast shipping,Premium quality,24/7 support' },
	products: { title: 'Featured Products', items: 'Air Dash|129,Street Lite|99,Cloud Run|149' },
	footer: { text: '© 2026 Nexora. All rights reserved.' },
}

export function getComponentLibrary() {
	return COMPONENT_LIBRARY
}

export function createUiSection(type) {
	return {
		id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
		type,
		props: { ...(DEFAULT_PROPS[type] || {}) },
	}
}

export function buildDefaultUiTree() {
	return ['navbar', 'hero', 'products', 'footer'].map((type) => createUiSection(type))
}

function readFileContent(files, path) {
	return files.find((file) => file.path === path)?.content || ''
}

function parseBetween(content, start, end, fallback) {
	const startIndex = content.indexOf(start)
	if (startIndex < 0) return fallback
	const from = startIndex + start.length
	const endIndex = content.indexOf(end, from)
	if (endIndex < 0) return fallback
	const value = content.slice(from, endIndex).trim()
	return value || fallback
}

export function buildUiTreeFromFrontendFiles(files) {
	if (!Array.isArray(files) || files.length === 0) {
		return buildDefaultUiTree()
	}

	const navbar = readFileContent(files, 'components/Navbar.jsx')
	const hero = readFileContent(files, 'components/Hero.jsx')
	const products = readFileContent(files, 'components/ProductList.jsx')
	const footer = readFileContent(files, 'components/Footer.jsx')

	const navbarTitle = parseBetween(navbar, '>{', '}</p>', 'Nexora Store').replace(/\{\$\{[^}]+\}\}/g, 'Nexora Store')
	const heroHeading = parseBetween(hero, '>', '</h1>', 'Welcome to Nexora')
	const heroSubheading = parseBetween(hero, '<p className="mt-4 text-slate-600">', '</p>', 'Build and launch your storefront faster.')
	const footerText = parseBetween(footer, '<p>', '</p>', '© 2026 Nexora. All rights reserved.')

	return [
		{ id: createUiSection('navbar').id, type: 'navbar', props: { ...DEFAULT_PROPS.navbar, title: navbarTitle } },
		{ id: createUiSection('hero').id, type: 'hero', props: { ...DEFAULT_PROPS.hero, heading: heroHeading, subheading: heroSubheading } },
		{ id: createUiSection('products').id, type: 'products', props: { ...DEFAULT_PROPS.products } },
		{ id: createUiSection('footer').id, type: 'footer', props: { ...DEFAULT_PROPS.footer, text: footerText } },
	]
}

export function sectionTitle(section) {
	if (section.type === 'hero') return section.props.heading || 'Hero'
	if (section.type === 'features') return section.props.title || 'Features'
	if (section.type === 'products') return section.props.title || 'Products'
	if (section.type === 'navbar') return section.props.title || 'Navbar'
	if (section.type === 'footer') return section.props.text || 'Footer'
	return section.type
}

export function getSectionEditableFields(section) {
	if (!section) return []

	if (section.type === 'navbar') {
		return [
			{ key: 'title', label: 'Title', type: 'text' },
			{ key: 'links', label: 'Links (comma-separated)', type: 'text' },
		]
	}

	if (section.type === 'hero') {
		return [
			{ key: 'heading', label: 'Heading', type: 'text' },
			{ key: 'subheading', label: 'Subheading', type: 'textarea' },
			{ key: 'buttonText', label: 'Button text', type: 'text' },
		]
	}

	if (section.type === 'features') {
		return [
			{ key: 'title', label: 'Title', type: 'text' },
			{ key: 'items', label: 'Items (comma-separated)', type: 'textarea' },
		]
	}

	if (section.type === 'products') {
		return [
			{ key: 'title', label: 'Title', type: 'text' },
			{ key: 'items', label: 'Items (name|price comma-separated)', type: 'textarea' },
		]
	}

	if (section.type === 'footer') {
		return [
			{ key: 'text', label: 'Text', type: 'text' },
		]
	}

	return []
}
