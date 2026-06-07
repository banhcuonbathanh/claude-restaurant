'use client'

export function RestaurantBanner() {
  return (
    <div className="relative w-full h-44 overflow-hidden">
      <img
        src="/restaurant-banner.jpg"
        alt="Quán Bánh Cuốn"
        className="w-full h-full object-cover"
        onError={e => {
          const img = e.currentTarget
          img.style.display = 'none'
          img.parentElement!.classList.add('bg-gradient-to-br', 'from-primary/30', 'to-background')
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
      <div className="absolute bottom-3 left-4">
        <p className="text-white/90 text-sm font-medium drop-shadow">Bánh cuốn tươi — ngon mỗi ngày</p>
      </div>
    </div>
  )
}
