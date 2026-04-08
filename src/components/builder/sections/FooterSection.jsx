function FooterSection({ section, theme = {} }) {
	return (
		<footer className="rounded-3xl border p-6" style={{ borderColor: `${theme.accent || '#0f172a'}33`, backgroundColor: '#ffffff' }}>
			<p className="text-sm" style={{ color: theme.text || '#0f172a' }}>
				{section?.content || 'Thank you for visiting our store.'}
			</p>
		</footer>
	)
}

export default FooterSection