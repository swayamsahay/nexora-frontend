function HeroSection({ section, theme = {} }) {
	return (
		<section className="rounded-3xl border p-6" style={{ borderColor: `${theme.accent || '#0f172a'}33`, backgroundColor: theme.background || '#f8fafc' }}>
			<p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: theme.text || '#0f172a' }}>
				Hero
			</p>
			<h2 className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: theme.text || '#0f172a' }}>
				{section?.content || 'Welcome to my store'}
			</h2>
			{section?.subtext ? (
				<p className="mt-3 text-sm leading-6" style={{ color: `${theme.text || '#0f172a'}cc` }}>
					{section.subtext}
				</p>
			) : null}
		</section>
	)
}

export default HeroSection