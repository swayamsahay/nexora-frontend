import HeroSection from './sections/HeroSection'
import ProductsSection from './sections/ProductsSection'
import FooterSection from './sections/FooterSection'

function SectionRenderer({ section, products = [], onBuy, buyingProductId = null, showCheckout = false, theme = {} }) {
	if (!section?.type) {
		return null
	}

	switch (section.type) {
		case 'hero':
			return <HeroSection section={section} theme={theme} />
		case 'products':
			return (
				<ProductsSection
					section={section}
					products={products}
					onBuy={onBuy}
					buyingProductId={buyingProductId}
					showCheckout={showCheckout}
					theme={theme}
				/>
			)
		case 'footer':
			return <FooterSection section={section} theme={theme} />
		default:
			return null
	}
}

export default SectionRenderer