function parseCommaList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseProducts(value) {
  return String(value || '')
    .split(',')
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row, index) => {
      const [name, price] = row.split('|').map((item) => item?.trim())
      return {
        id: `${name || 'product'}-${index}`,
        name: name || 'Product',
        price: price || '99',
      }
    })
}

function NavbarSection({ props }) {
  const links = parseCommaList(props.links)

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <p className="text-lg font-bold text-slate-900">{props.title || 'Nexora Store'}</p>
        <nav className="flex items-center gap-5 text-sm text-slate-600">
          {links.map((link) => <span key={link}>{link}</span>)}
        </nav>
      </div>
    </header>
  )
}

function HeroSection({ props }) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <h1 className="text-4xl font-semibold text-slate-950">{props.heading || 'Welcome to Nexora'}</h1>
        <p className="mt-3 max-w-xl text-slate-600">{props.subheading || 'Build and launch your storefront faster.'}</p>
        <button type="button" className="mt-5 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{props.buttonText || 'Shop now'}</button>
      </div>
    </section>
  )
}

function FeaturesSection({ props }) {
  const items = parseCommaList(props.items)

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <h2 className="text-2xl font-semibold text-slate-950">{props.title || 'Why choose us'}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{item}</article>
        ))}
      </div>
    </section>
  )
}

function ProductsSection({ props }) {
  const products = parseProducts(props.items)

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <h2 className="text-2xl font-semibold text-slate-950">{props.title || 'Featured Products'}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="h-24 rounded-xl bg-slate-100" />
            <p className="mt-3 font-semibold text-slate-900">{product.name}</p>
            <p className="text-sm text-slate-500">${product.price}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function FooterSection({ props }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-4xl px-6 py-5 text-sm text-slate-600">{props.text || '© 2026 Nexora. All rights reserved.'}</div>
    </footer>
  )
}

function BuilderPreview({ uiTree }) {
  if (!Array.isArray(uiTree) || uiTree.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600">
        Canvas is empty. Add a section from the component library.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      {uiTree.map((section) => {
        if (section.type === 'navbar') return <NavbarSection key={section.id} props={section.props} />
        if (section.type === 'hero') return <HeroSection key={section.id} props={section.props} />
        if (section.type === 'features') return <FeaturesSection key={section.id} props={section.props} />
        if (section.type === 'products') return <ProductsSection key={section.id} props={section.props} />
        if (section.type === 'footer') return <FooterSection key={section.id} props={section.props} />
        return null
      })}
    </div>
  )
}

export default BuilderPreview
