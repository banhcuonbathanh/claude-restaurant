import { FavouritesSpeedDial } from './components/FavouritesSpeedDial'

// Wraps every favourites page (list · sets · build · save). Hosts the shared speed-dial
// FAB so it persists across the whole section and provides the only navigation between
// the three views (replacing the former FavouriteSegmentTabs bar).
export default function FavouritesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FavouritesSpeedDial />
    </>
  )
}
