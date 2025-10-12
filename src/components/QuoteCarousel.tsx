import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

type Quote = { en: string; ko: string }
type Props = {
  items: Quote[]
  intervalMs?: number
}

export default function QuoteCarousel({ items, intervalMs = 3500 }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', skipSnaps: false },
    [Autoplay({ delay: intervalMs, stopOnInteraction: false })]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  const scrollTo = (idx: number) => emblaApi?.scrollTo(idx)

  return (
    <div className="quote-embla" ref={emblaRef}>
      <div className="quote-embla__container">
        {items.map((q, i) => (
          <div className="quote-embla__slide" key={i}>
            <div className="quote-card">
              <h3 className="quote-title">오늘의 문장✨</h3>
              <p className="quote-en">“{q.en}”</p>
              <p className="quote-ko">{q.ko}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="quote-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`quote-dot ${i === selectedIndex ? 'is-active' : ''}`}
            onClick={() => scrollTo(i)}
            aria-label={`slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
