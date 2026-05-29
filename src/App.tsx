import { useState } from 'react'
import { BagCustomizer } from './components/BagCustomizer'
import { Disclaimer } from './components/Disclaimer'
import { Features } from './components/Features'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { InquirySection } from './components/InquirySection'
import { OrderFlow } from './components/OrderFlow'
import {
  DEFAULT_CUSTOMIZATION,
  type BagCustomization,
  type BagLayer,
} from './types/bag'

function App() {
  const [customization, setCustomization] =
    useState<BagCustomization>(DEFAULT_CUSTOMIZATION)
  const [activeLayer, setActiveLayer] = useState<BagLayer>('body')

  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <Header />
      <main>
        <Hero />
        <Features />
        <BagCustomizer
          customization={customization}
          activeLayer={activeLayer}
          onCustomizationChange={setCustomization}
          onActiveLayerChange={setActiveLayer}
        />
        <OrderFlow />
        <InquirySection customization={customization} />
        <Disclaimer />
      </main>
      <Footer />
    </div>
  )
}

export default App
