import Image from 'next/image'

/**
 * MenuHeader — photo banner for the customer /menu page.
 *
 * New QR-ordering design (DESIGN_PROMPT §1): a ~196px restaurant cover photo with a
 * dark top→bottom gradient overlay and the Playfair (font-display) serif title centered
 * over it. No pill bar, no table label, no login button — the "Bàn XX" pill lives in
 * OrderSummary, and login is intentionally absent from this QR-ordering flow.
 *
 * Not sticky: the banner scrolls away; the sticky element is the category nav below it.
 */
export function MenuHeader() {
  return (
    <header className="relative h-[196px] w-full overflow-hidden bg-background">
      <Image
        src="/header-example.jpg"
        alt="Ảnh bìa Quán Bánh Cuốn"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Dark gradient overlay: transparent at top → near-black at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background/95" />
      <div className="absolute inset-x-0 top-[18px] z-10 text-center">
        <h1 className="font-display text-[27px] font-bold leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.65)]">
          Quán Bánh Cuốn
        </h1>
      </div>
    </header>
  )
}
