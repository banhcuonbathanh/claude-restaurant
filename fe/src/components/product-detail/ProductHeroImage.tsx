'use client'
import { useState } from 'react'
import Image from 'next/image'

interface ProductHeroImageProps {
  src: string | null
  alt: string
}

export function ProductHeroImage({ src, alt }: ProductHeroImageProps) {
  const [imgError, setImgError] = useState(false)
  const showFallback = !src || imgError

  return (
    <div className="relative w-full aspect-[390/220] overflow-hidden bg-muted">
      {src && !imgError && (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          onError={() => setImgError(true)}
        />
      )}
      {showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-4xl font-bold text-muted-fg select-none">
            {alt.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
    </div>
  )
}
