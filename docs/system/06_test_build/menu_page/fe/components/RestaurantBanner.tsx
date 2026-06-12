// P-SYSTEST reference build — banner per menu_spec.md §Restaurant Banner; not imported by the app.
'use client'
import { useState } from 'react'

export function RestaurantBanner() {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className={`relative h-44 overflow-hidden ${imgFailed ? 'bg-gradient-to-br from-primary/30 to-background' : ''}`}>
      {!imgFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/restaurant-banner.jpg"
          alt="Quán Bánh Cuốn"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
      <p className="absolute bottom-3 left-4 text-white/90 text-sm">Bánh cuốn tươi — ngon mỗi ngày</p>
    </div>
  )
}
